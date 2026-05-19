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
import ViewSwitcher from './ViewSwitcher';

const styles = {
    customizeToolbar: {
        minHeight: 48,
        maxHeight: 48,
        padding: '0 20px',
    },
    small: {
        width: 28,
        height: 28,
        fontSize: '0.75rem',
        background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.3), rgba(167, 139, 250, 0.3))',
        border: '1px solid rgba(129, 140, 248, 0.3)',
        backdropFilter: 'blur(10px)',
        fontWeight: 700,
        color: '#eef0ff',
    },
    title: {
        fontWeight: 700,
        fontSize: '15px',
        letterSpacing: '-0.3px',
        color: '#eef0ff',
        background: 'linear-gradient(135deg, #eef0ff, #a5b4fc)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    version: {
        opacity: 0.5,
        fontSize: '10px',
        fontWeight: 500,
        color: '#8b8fba',
    },
};
const APP_VERSION = process.env.APP_VERSION;
class TopBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            auth: true, // eslint-disable-line
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
        const { validated, username, classes, activeView, onViewChange } = this.props;
        const open = Boolean(anchorEl);
        const id = open ? 'simple-popover' : undefined;
        return (
            <AppBar position="static" id="app-bar" elevation={0}>
                <Toolbar
                    className={classNames(classes.customizeToolbar)}
                    variant="dense"
                >
                    <Typography type="title" color="inherit" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={styles.title}>Zowe Explorer</span>
                        <Typography variant="caption" color="inherit" style={styles.version}>v{ APP_VERSION }</Typography>
                    </Typography>
                    {onViewChange && <ViewSwitcher activeView={activeView} onViewChange={onViewChange} />}
                    <div style={{ flex: 1 }} />
                    <Tooltip title="Settings" placement="bottom">
                        <IconButton color="inherit" aria-describedby={id} onClick={this.handleClick} style={{ marginRight: '4px' }}>
                            <SettingsIcon style={{ fontSize: '20px' }} />
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
                    {
                        <Tooltip title={username} placement="bottom">
                            <IconButton color="inherit">
                                <Avatar className={classes.small}>{username.charAt(0).toUpperCase()}</Avatar>
                            </IconButton>
                        </Tooltip> && validated
                    }
                </Toolbar>
            </AppBar>
        );
    }
}

TopBar.propTypes = {
    validated: PropTypes.bool.isRequired,
    username: PropTypes.string.isRequired,
    activeView: PropTypes.string,
    onViewChange: PropTypes.func,
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
