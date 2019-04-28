import React from 'react';
import Button from '@material-ui/core/Button';

import './BookingsTabs.css';

const bookingsTabs = props => {
    return (
      <div className="bookings-control">
        <Button
          className={props.activeOutputType === 'list' ? 'active' : ''}
          onClick={props.onChange.bind(this, 'list')}
        >
          List
        </Button>
        <Button
          className={props.activeOutputType === 'chart' ? 'active' : ''}
          onClick={props.onChange.bind(this, 'chart')}
        >
          Chart
        </Button>
      </div>
    );
  };

  export default bookingsTabs;