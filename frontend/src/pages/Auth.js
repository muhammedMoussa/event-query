import React, { Component } from 'react';

import './Auth.css';
import AuthContext from '../context/auth-context';

class AuthPage extends Component {
    state = {
        isLogin: true
    };

    static contextType = AuthContext;

    switchModeHandler = () => {
        this.setState(prevState => {
            return {
                isLogin: !this.state.isLogin
            };
        });
    };

    constructor(props) {
        super(props);
        this.emailEl = React.createRef();
        this.passwordEl = React.createRef();
    };

    submitHandler = event => {
        event.preventDefault();
        const email = this.emailEl.current.value;
        const password = this.passwordEl.current.value;

        if(email.trim().length === 0 || password.trim().length === 0) {
            return;
            /*TODO: ADD TOAST HERE */
        }

        let requestBody = {
            query: `
              query {
                login(email: "${email}", password: "${password}") {
                  userId
                  token
                  tokenExpiration
                }
              }
            `
          };

          if (!this.state.isLogin) {
            requestBody = {
              query: `
                mutation signup($email: String!, $password: String!) {
                  createUser(userInput: {email: $email, password: $password}) {
                    _id
                    email
                  }
                }
              `,
              variables: {
                email,
                password
              }
            };
          }

        fetch('http://localhost:3003/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            if(res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            return res.json();
        })
        .then(res => {
            console.log(res)
            if(res.data.login.token && this.state.isLogin) {
                this.context.login(
                    res.data.login.token,
                    res.data.login.userId,
                    res.data.login.tokenExpiration
                );
            }
        })
        .catch(error =>  {
            console.log(error);
        });
    };

    render() {
        return (
            <form className="auth-form" onSubmit={this.submitHandler}>
                <div className="form-control">
                    <label htmlFor="email">E-Mail</label>
                    <input type="email" id="email" ref={this.emailEl} />
                </div>
                <div className="form-control">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" ref={this.passwordEl} />
                </div>
                <div className="form-actions">
                    <button type="submit">Submit</button>
                    <button type="button" onClick={this.switchModeHandler}>
                        Switch to {this.state.isLogin ? 'Signup' : 'Login'}
                    </button>
                </div>
            </form>
        )
    }
}

export default AuthPage;