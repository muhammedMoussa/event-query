import React, { Component } from 'react';

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
        selectedEvent: null
    }

    isActive = true;

    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.titleEl = React.createRef();
        this.priceEl = React.createRef();
        this.dateEl = React.createRef();
        this.descriptionEl = React.createRef();
    }

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
        this.setState({ creating: false });
        const title = this.titleEl.current.value;
        const price = +this.priceEl.current.value;
        const date = this.dateEl.current.value;
        const description = this.descriptionEl.current.value;

        if (title.trim().length === 0
            || price <= 0
              || date.trim().length === 0
               || description.trim().length === 0
        ) {
          return; /* TODO:: TOAST */
        }

        const requestBody = {
          query: `
              mutation {
                createEvent(eventInput: {title: "${title}", description: "${description}", price: ${price}, date: "${date}"}) {
                  _id
                  title
                  description
                  date
                  price
                }
              }
            `
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
        debugger
        if (!this.context.token) {
          this.setState({ selectedEvent: null });
          return;
        }
        const requestBody = {
          query: `
              mutation {
                bookEvent(eventId: "${this.state.selectedEvent._id}") {
                  _id
                 createdAt
                 updatedAt
                }
              }
            `
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
                                <label htmlFor="title">Title</label>
                                <input type="text" id="title" ref={this.titleEl} />
                            </div>
                            <div className="form-control">
                                <label htmlFor="price">Price</label>
                                <input type="number" min="0" id="price" ref={this.priceEl} />
                            </div>
                            <div className="form-control">
                                <label htmlFor="date">Date</label>
                                <input type="datetime-local" id="date" ref={this.dateEl} />
                            </div>
                            <div className="form-control">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    rows="4"
                                    ref={this.descriptionEl}
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
                    <div className="events-control">
                        <p>Share your own Events!</p>
                        <button
                            className="btn"
                            onClick={this.startCreateEventHandler}
                        >
                            Create Event
                        </button>
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