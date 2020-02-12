/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2020
 */

import React from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import { validateUser, loginUser } from '../../actions/validation';

class LoginDialog extends React.Component {
    constructor(props) {
        super(props);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);

        this.state = {
            username: '',
            password: '',
        };
    }

    componentDidMount() {
        const { dispatch } = this.props;
        return dispatch(validateUser());
    }

    handleUsernameChange(event) {
        this.setState({
            username: event.target.value,
        });
    }

    handlePasswordChange(event) {
        this.setState({
            password: event.target.value,
        });
    }

    handleLogin = () => {
        const { dispatch } = this.props;
        return dispatch(loginUser(this.state.username, this.state.password));
    }

    render() {
        const { isValidating, validationMessage } = this.props;
        const dialogContent = isValidating ? <CircularProgress /> :
            (<form onSubmit={this.handleLogin}>
                <TextField
                    id="username"
                    label="username"
                    placeholder="Username"
                    error={this.state.username === ''}
                    helperText={this.state.username === '' ? <div>*Required</div> : null}
                    value={this.state.username}
                    onChange={this.handleUsernameChange}
                    style={{ display: 'block' }}
                />
                <TextField
                    id="password"
                    label="password"
                    placeholder="Password"
                    error={this.state.password === ''}
                    helperText={this.state.password === '' ? <div>*Required</div> : null}
                    type="password"
                    value={this.state.password}
                    onChange={this.handlePasswordChange}
                />
                <input type="submit" style={{ display: 'none' }} />
                <div style={{ color: 'red' }}>
                    {validationMessage}
                </div>
            </form>);

        const dialogAction = !isValidating ? (<Button onClick={this.handleLogin} >Login</Button>) : null;

        return (
            <Dialog
                open={true}
                type={'primary'}
            >
                <DialogTitle>Zowe Login</DialogTitle>
                <DialogContent >
                    {dialogContent}
                </DialogContent>
                <DialogActions >
                    {dialogAction}
                </DialogActions>
            </Dialog>
        );
    }
}

LoginDialog.propTypes = {
    dispatch: PropTypes.func.isRequired,
    isValidating: PropTypes.bool.isRequired,
    validationMessage: PropTypes.string,
};

function mapStateToProps(state) {
    const validationRoot = state.get('validation');
    return {
        isValidating: validationRoot.get('isValidating'),
        validationMessage: validationRoot.get('message'),
    };
}

const connectedLoginDialog = connect(mapStateToProps)(LoginDialog);
export default connectedLoginDialog;
