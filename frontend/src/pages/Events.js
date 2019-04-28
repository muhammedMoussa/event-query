import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import AuthContext from '../context/auth-context';
import Spinner from '../components/Spinner/Spinner';
import EventList from '../components/Events/EventsList/EventsList';
import './Events.css';

class EventsPage extends Component {
    state = {
        creating: false,
        events: [],
        isLoading: false,
        selectedEvent: null,
        title: null,
        price: null,
        date: null,
        description: null,
    }

    isActive = true;

    static contextType = AuthContext;

    componentDidMount() {
        this.fetchEvents();
    }

    startCreateEventHandler = () => {
        this.setState({ creating: true });
    }

    modalCancelHandler = () => {
        this.setState({ creating: false, selectedEvent: null });
    }

    modalSubmitHandler = () => {
        debugger
        this.setState({ creating: false });
        const title = this.state.title;
        const price = +this.state.price;
        const date = this.state.date;
        const description = this.state.description;

        if (title.trim().length === 0
            || price <= 0
              || date.trim().length === 0
               || description.trim().length === 0
        ) {
          return; /* TODO:: TOAST */
        }

        const requestBody = {
          query: `
              mutation CreateEvent($title: String!, $description: String!, $price: Float!, $date: String!){
                createEvent(eventInput: {title: $title, description: $description, price: $price, date: $date}) {
                  _id
                  title
                  description
                  date
                  price
                }
              }
            `,
            variables: {
                title,
                description,
                price,
                date
            }
        };

        const token = this.context.token;

        fetch('http://localhost:3003/graphql', {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          }
        })
          .then(res => {
            if (res.status !== 200 && res.status !== 201) {
              throw new Error('Failed!');
            }
            return res.json();
          })
          .then(res => {
            this.setState(prevState => {
                const updatedEvents = [...prevState.events];
                updatedEvents.push({
                    _id: res.data.createEvent._id,
                    title: res.data.createEvent.title,
                    description: res.data.createEvent.description,
                    date: res.data.createEvent.date,
                    price: res.data.createEvent.price,
                    creator: {
                        _id: this.context.userId
                    }
                });
                return { events: updatedEvents };
            })
          })
          .catch(err => {
            console.log(err);
          });
    }

    fetchEvents() {
        this.setState({ isLoading: true });
        const requestBody = {
            query: `
                query {
                    events {
                        _id
                        title
                        description
                        date
                        price
                        creator {
                            _id
                            email
                        }
                    }
                }
            `
        };

        fetch('http://localhost:3003/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error('Failed!');
                }
                return res.json();
            })
            .then(res => {
                const events = res.data.events;
                if(this.isActive) {
                    this.setState({ events: events, isLoading: false });
                }
            })
            .catch(err => {
                console.log(err);
                if(this.isActive) {
                    this.setState({ isLoading: false });
                }
            });
        }

    showDetailHandler = eventId => {
        this.setState(prevState => {
            const selectedEvent = prevState.events.find(event => event._id === eventId);
            return this.setState({ selectedEvent });
        });
    }

    bookEventHandler = () => {
        if (!this.context.token) {
          this.setState({ selectedEvent: null });
          return;
        }
        const requestBody = {
          query: `
              mutation BookEvent($id: ID!) {
                bookEvent(eventId: $id) {
                  _id
                 createdAt
                 updatedAt
                }
              }
            `,
            variables: {
                id: this.state.selectedEvent._id
            }
        };

        fetch('http://localhost:3003/graphql', {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this.context.token
          }
        })
          .then(res => {
            if (res.status !== 200 && res.status !== 201) {
              throw new Error('Failed!');
            }
            return res.json();
          })
          .then(resData => {
            console.log(resData);
            this.setState({ selectedEvent: null });
          })
          .catch(err => {
            console.log(err);
          });
    };

    componentWillUnmount() {
        this.isActive = false;
    }

    handleInputChange = name => event => {
        this.setState({ [name]: event.target.value });
    };
    render() {
        return (
            <React.Fragment>
                { (this.state.creating || this.state.selectedEvent) && <Backdrop /> }
                { this.state.creating && (
                    <Modal
                        title="Create Event"
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.modalSubmitHandler}
                        confirmText="Create"
                    >
                        <form>
                            <div className="form-control">
                                <TextField
                                    label="Title"
                                    style={{ margin: 8 }}
                                    placeholder="Event Title"
                                    fullWidth
                                    margin="normal"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    onChange={this.handleInputChange('title')}
                                />
                            </div>
                            <div className="form-control">
                                <TextField
                                    label="Price"
                                    type="number"
                                    min="0"
                                    style={{ margin: 8 }}
                                    placeholder="Event Price"
                                    fullWidth
                                    margin="normal"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    onChange={this.handleInputChange('price')}
                                />
                            </div>
                            <div className="form-control">
                                <TextField
                                    label="Price"
                                    type="datetime-local"
                                    style={{ margin: 8 }}
                                    placeholder="Event Date and Time"
                                    fullWidth
                                    margin="normal"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    onChange={this.handleInputChange('date')}
                                />
                            </div>
                            <div className="form-control">
                            <TextField
                                    label="Description"
                                    multiline={true}
                                    rows={2}
                                    rowsMax={4}
                                    style={{ margin: 8 }}
                                    placeholder="About Event.."
                                    fullWidth
                                    margin="normal"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    onChange={this.handleInputChange('description')}
                                />
                            </div>
                        </form>
                    </Modal>
                )}
                { this.state.selectedEvent && (
                    <Modal
                        title="Event Details"
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.bookEventHandler}
                        confirmText={this.context.token ? 'Book' : 'Confirm'}
                    >
                        <h1>{ this.state.selectedEvent.title }</h1>
                        <h2>
                            ${this.state.selectedEvent.price} - {' '}
                            {new Date(this.state.selectedEvent.date).toLocaleDateString()}
                        </h2>
                        <p>{this.state.selectedEvent.description}</p>
                    </Modal>
                )}
                { this.context.token && (
                    <div className="events-control form-actions">
                        <p>Share your own Events!</p>
                        <Button
                            className="btn"
                            onClick={this.startCreateEventHandler}
                        >
                            Create Event
                        </Button>
                    </div>
                )}
                { this.state.isLoading ? (
                    <Spinner />
                ): (
                    <EventList
                        events={this.state.events}
                        authUserId={this.context.userId}
                        onViewDetail={this.showDetailHandler}
                    />
                )}
            </React.Fragment>
        )
    }
}

export default EventsPage;