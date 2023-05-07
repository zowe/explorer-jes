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
import ZoweIcon from '../../../img/zowe-icon-color.svg';

class LoginDialog extends React.Component {
    constructor(props) {
        super(props);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);

        this.state = {
            username: '',
            password: '',
            firstLoginAttempted: false,
        };
    }

    componentDidMount() {
        const { dispatch, forceLogin } = this.props;
        if (!forceLogin) {
            dispatch(validateUser());
        }
    }

    getDialogErrorMessage() {
        const { validationMessage } = this.props;
        if (this.state.firstLoginAttempted) {
            return (
                <div
                    id="login-status-message"
                    style={{ color: 'red' }}
                    role="status"
                >
                    {validationMessage}
                </div>
            );
        }
        return null;
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
        this.setState({ firstLoginAttempted: true });
        return dispatch(loginUser(this.state.username, this.state.password));
    }

    render() {
        const { isValidating } = this.props;
        const dialogContent = isValidating ? <CircularProgress /> : (
            <form onSubmit={this.handleLogin} style={{ width: '500px' }}>
                <TextField
                    id="username"
                    label="Username*"
                    value={this.state.username}
                    onChange={this.handleUsernameChange}
                    style={{ display: 'block' }}
                    fullWidth={true}
                    autoFocus={true}
                />
                <TextField
                    id="password"
                    label="Password*"
                    type="password"
                    value={this.state.password}
                    onChange={this.handlePasswordChange}
                    fullWidth={true}
                />
                <input type="submit" style={{ display: 'none' }} />
                {this.getDialogErrorMessage()}
            </form>
        );

        const dialogAction = !isValidating ? (<Button onClick={this.handleLogin}>Login</Button>) : null;

        const dialogTitle = !isValidating ? (
            <DialogTitle style={{ textAlign: 'center' }}>
                <img
                    style={{ width: '100px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                    src={ZoweIcon}
                    alt="logo"
                />
                Zowe Login
            </DialogTitle>
        )
            : null;

        return (
            <Dialog
                id="login-dialog"
                open={true}
                type="primary"
            >
                {dialogTitle}
                <DialogContent>
                    {dialogContent}
                </DialogContent>
                <DialogActions>
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
    forceLogin: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
    const validationRoot = state.get('validation');
    return {
        isValidating: validationRoot.get('isValidating'),
        validationMessage: validationRoot.get('message'),
        forceLogin: validationRoot.get('forceLogin'),
    };
}

const connectedLoginDialog = connect(mapStateToProps)(LoginDialog);
export default connectedLoginDialog;
