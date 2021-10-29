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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import SettingsIcon from '@material-ui/icons/Settings';
import Popover from '@material-ui/core/Popover';
import Tooltip from '@material-ui/core/Tooltip';
import SettingForm from './Setting';

const styles = {
    customizeToolbar: {
        minHeight: 32,
        maxHeight: 32,
    },
    small: {
        width: 20,
        height: 20,
        fontSize: '1rem',
    },
};
const APP_VERSION = process.env.APP_VERSION;
class TopBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            auth: true,
            anchorEl: null,
        };
    }

    handleClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    render() {
        const { anchorEl } = this.state;
        const { validated, username, classes } = this.props;
        const open = Boolean(anchorEl);
        const id = open ? 'simple-popover' : undefined;
        return (
            <AppBar position="static" id="app-bar" >
                <Toolbar
                    className={classNames(classes.customizeToolbar)}
                    variant="dense"
                >
                    <Typography type="title" color="inherit" style={{ flex: 1 }} >
                        JES Explorer
                        <Typography variant="caption" color="inherit" style={{ flex: 1, paddingLeft: '5px' }}>v{ APP_VERSION }</Typography>
                    </Typography>
                    <Tooltip title="Setting" placement="bottom">
                        <IconButton color="inherit" aria-describedby={id} onClick={this.handleClick}>
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>
                    <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={this.handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                    >
                        <SettingForm />
                    </Popover>
                    {validated &&
                    <Tooltip title={username} placement="bottom">
                        <IconButton color="inherit">
                            <Avatar className={classes.small}>{username.charAt(0).toUpperCase()}</Avatar>
                        </IconButton>
                    </Tooltip>}
                </Toolbar>
            </AppBar>);
    }
}


TopBar.propTypes = {
    validated: PropTypes.bool.isRequired,
    username: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    classes: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const validationRoot = state.get('validation');
    return {
        validated: validationRoot.get('validated'),
        username: validationRoot.get('username'),
    };
}

const ConnectedTopBar = connect(mapStateToProps)(withStyles(styles)(TopBar));
export default ConnectedTopBar;
