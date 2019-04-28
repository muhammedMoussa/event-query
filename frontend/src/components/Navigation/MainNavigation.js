import React from 'react';
import { NavLink } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import ExitToApp from '@material-ui/icons/ExitToApp';

import './MainNavigation.css';
import AuthContext from '../../context/auth-context';


const mainNavigation = props => (
  <AuthContext.Consumer>
      { context => {
          return (
            <header className="main-navigation">
                <div className="main-navigation__logo">
                    <h1>EventQuery</h1>
                </div>
                <nav className="main-navigation__items">
                    <ul>
                        { !context.token && (
                            <li>
                                <Button> <NavLink to="/auth">Authenticate</NavLink> </Button>
                            </li>
                        )}
                        <li> <Button> <NavLink to="/events">Events</NavLink> </Button> </li>
                        { context.token && (
                            <React.Fragment>
                                <li>
                                    <Button>
                                        <NavLink to="/bookings">Bookings</NavLink>
                                    </Button>
                                </li>
                                <li>
                                    <Button onClick={context.logout}>
                                        Logout
                                        <ExitToApp/>
                                    </Button>

                                </li>
                            </React.Fragment>
                        )}
                    </ul>
                </nav>
            </header>
          )
      }}
  </AuthContext.Consumer>
);

export default mainNavigation;