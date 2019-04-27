import React, { Component } from 'react';

import Spinner from '../components/Spinner/Spinner';
import AuthContext from '../context/auth-context';
import BookingsList from '../components/Bookings/BookingsList/BookingsList';
import BookingsTabs from '../components/Bookings/BookingsTabs/BookingsTabs';
import BookinsChart from '../components/Bookings/BookingsChart/BookingsChart';

class BookingsPage extends Component {
  state = {
    isLoading: false,
    bookings: [],
    outputType: 'list'
  };

  static contextType = AuthContext;

  componentDidMount() {
    this.fetchBookings();
  }

  fetchBookings = () => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
          query {
            bookings {
              _id
             createdAt
             event {
               _id
               title
               date
               price
             }
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
        const bookings = resData.data.bookings;
        this.setState({ bookings: bookings, isLoading: false });
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  };

  deleteBookingHandler = bookingId => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
          mutation cancelBookiong($id: ID!) {
            cancelBooking(bookingId: $id) {
                _id
                title
            }
          }
        `,
        variables: {
          id: bookingId
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
    .then(res => {
        this.setState(prevState => {
            const updatedBookings = prevState.bookings.filter(booking => {
                return booking._id !== bookingId;
            });
            return { bookings: updatedBookings, isLoading: false };
        })
    })
    .catch(error => {
        console.log(error);
        this.setState({ isLoading: false });
    })
  }

  changeOutputTypeHandler = outputType => {
    if (outputType === 'list') {
      this.setState({ outputType: 'list' });
    } else {
      this.setState({ outputType: 'chart' });
    }
  };

  render() {
    let content = <Spinner />;
    if(!this.state.isLoading) {
      content = (
        <React.Fragment>
          <BookingsTabs
            activeOutputType={this.state.outputType}
            onChange={this.changeOutputTypeHandler}
          />
          { this.state.outputType === 'list' ? (
            <BookingsList
              bookings={this.state.bookings}
              onDelete={this.deleteBookingHandler}
            />
          ) : (
            <BookinsChart bookings={this.state.bookings} />
          )}
        </React.Fragment>

      );
    }
    return (
      <React.Fragment>
        { content }
      </React.Fragment>
    );
  }
}

export default BookingsPage;