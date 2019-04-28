import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import './Auth.css';
import AuthContext from '../context/auth-context';

class AuthPage extends Component {
    state = {
        isLogin: true,
        email: null,
        password: null
    };

    static contextType = AuthContext;

    switchModeHandler = () => {
        this.setState(prevState => {
            return {
                isLogin: !this.state.isLogin
            };
        });
    };

    submitHandler = event => {
        event.preventDefault();
        const email = this.state.email;
        const password = this.state.password;

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

    handleInputChange = name => event => {
        this.setState({ [name]: event.target.value });
    };

    render() {
        return (
            <form className="auth-form" onSubmit={this.submitHandler}>
                <div className="form-control">
                    <TextField
                        label="E-Mail"
                        style={{ margin: 8 }}
                        placeholder="Type your mail.."
                        helperText="example@mail.com"
                        fullWidth
                        margin="normal"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        onChange={this.handleInputChange('email')}
                    />
                </div>
                <div className="form-control">
                    <TextField
                        label="Password"
                        style={{ margin: 8 }}
                        placeholder="Type your password.."
                        fullWidth
                        margin="normal"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        type="password"
                        onChange={this.handleInputChange('password')}
                    />
                </div>
                <div className="form-actions">
                    <Button type="submit">Submit</Button>
                    <Button type="button" onClick={this.switchModeHandler}>
                        Switch to {this.state.isLogin ? 'Signup' : 'Login'}
                    </Button>
                </div>
            </form>
        )
    }
}

export default AuthPage;