import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import './App.css';
import  AuthPage  from './pages/Auth';
import  EventsPage  from './pages/Events';
import  BookingsPage  from './pages/Booking';
import MainNavigation from './components/Navigation/MainNavigation';
import AuthContext from './context/auth-context';

class App extends React.Component {
  state = {
    token: null,
    userId: null,
    tokenExpiration: 0
  };

  login = (token, userId, tokenExpiration) => {
    this.setState({ token, userId, tokenExpiration })
  };

  logout = () => {
    this.setState({ token: null, userId: null, tokenExpiration: null })
  };

  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <AuthContext.Provider value={{
            token: this.state.token,
            userId: this.state.userId,
            login: this.login,
            logout: this.logout
          }}>
            <MainNavigation />
            <main className="main-content">
              <Switch>
                  {this.state.token && <Redirect from="/" to="/events" exact />}
                  {this.state.token && (
                    <Redirect from="/auth" to="/events" exact />
                  )}
                  {!this.state.token && (
                    <Route path="/auth" component={AuthPage} />
                  )}
                  <Route path="/events" component={EventsPage} />
                  {this.state.token && (
                    <Route path="/bookings" component={BookingsPage} />
                  )}
                  {!this.state.token && <Redirect to="/auth" exact />}
                </Switch>
            </main>
          </AuthContext.Provider>
        </React.Fragment>
      </BrowserRouter>
    );
  };
}

export default App;
