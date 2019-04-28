import React from 'react';
import Button from '@material-ui/core/Button';

import './BookingsList.css';

const bookingList = props => (
  <ul className="bookings__list">
    {props.bookings.map(booking => {
      return (
        <li key={booking._id} className="bookings__item">
          <div className="bookings__item-data">
            {booking.event.title} -{' '}
            {new Date(booking.createdAt).toLocaleDateString()}
          </div>
          <div className="bookings__item-actions form-actions">
            <Button className="btn" onClick={props.onDelete.bind(this, booking._id)}>Cancel</Button>
          </div>
        </li>
      );
    })}
  </ul>
);

export default bookingList;