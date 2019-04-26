import React, { Component } from 'react';

import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import './Events.css';

class EventsPage extends Component {
    state = {
        creating: false
    }

    startCreateEventHandler = () => {
        this.setState({ creating: true })
    }

    modalCancelHandler = () => {
        this.setState({ creating: false })
    }

    modalSubmitHandler = () => {
        this.setState({ creating: false })
    }

    render() {
        return (
            <React.Fragment>
                { this.state.creating && <Backdrop /> }
                { this.state.creating && (
                    <Modal
                        title="Create Event"
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.modalSubmitHandler}
                    >
                        <p>Create Your Awesome Event, Now!</p>
                    </Modal>
                )}
                <div className="events-control">
                    <p>Share your own Events!</p>
                    <button className="btn" onClick={this.startCreateEventHandler}>
                        Create Event
                    </button>
                </div>
            </React.Fragment>
        )
    }
}

export default EventsPage;