import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import './App.css';
import  AuthPage  from './components/Auth';
import  EventsPage  from './components/Events';
import  BookingPage  from './components/Booking';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Redirect from="/" to="/auth" exact />
        <Route path="/auth" component={AuthPage}/>
        <Route path="/events" component={EventsPage}/>
        <Route path="/booking" component={BookingPage}/>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
