/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2020
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { List } from 'immutable';
import { popMessage } from '../actions/snackbarNotifications';
import { getStorageItem, NOTIFICATION_DURATION } from '../utilities/storageHelper';

class AtlasSnackbar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
        };
        this.notificationDuration = getStorageItem(NOTIFICATION_DURATION) || 5000;
    }

    componentDidUpdate(prevProps) {
        const { snackbarNotificationsMessages } = this.props;
        if (snackbarNotificationsMessages.first()
        && prevProps.snackbarNotificationsMessages.first() !== snackbarNotificationsMessages.first()) {
            const messageValue = snackbarNotificationsMessages.first();
            window.sendJesNotificationsToZlux(messageValue.get('message'));
            this.setState({ open: true });
        }
    }

    handleRequestClose = () => {
        const { dispatch } = this.props;

        this.setState({ open: false });
        dispatch(popMessage());
    }

    render() {
        const { snackbarNotificationsMessages } = this.props;
        if (snackbarNotificationsMessages.size > 0) {
            const messageValue = snackbarNotificationsMessages.first();
            return (
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    autoHideDuration={this.notificationDuration}
                    message={messageValue.get('message')}
                    open={this.state.open}
                    onClose={this.handleRequestClose}
                    role="alert"
                    action={
                        <IconButton size="small" aria-label="close" color="inherit" onClick={this.handleRequestClose}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                />
            );
        }
        return null;
    }
}

AtlasSnackbar.propTypes = {
    snackbarNotificationsMessages: PropTypes.instanceOf(List).isRequired,
    dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    return {
        snackbarNotificationsMessages: state.get('snackbarNotifications').get('messages'),
    };
}

const ConnectedSnackbar = connect(mapStateToProps)(AtlasSnackbar);
export default ConnectedSnackbar;
