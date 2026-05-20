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
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import Popover from '@material-ui/core/Popover';
import Tooltip from '@material-ui/core/Tooltip';
import SettingForm from './Setting';
import { useThemeMode } from '../themes/ThemeContext';

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
        color: 'var(--text-primary)',
    },
    title: {
        fontWeight: 700,
        fontSize: '15px',
        letterSpacing: '-0.3px',
        color: 'var(--text-primary)',
    },
};

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
        const { validated, username, classes, themeMode, toggleTheme } = this.props;
        const open = Boolean(anchorEl);
        const id = open ? 'simple-popover' : undefined;
        return (
            <AppBar position="static" id="app-bar" elevation={0}>
                <Toolbar
                    className={classNames(classes.customizeToolbar)}
                    variant="dense"
                >
                    <Typography type="title" color="inherit" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={classes.title}>Zowe Explorer</span>
                    </Typography>
                    <div style={{ flex: 1 }} />
                    <Tooltip title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'} placement="bottom">
                        <IconButton color="inherit" onClick={toggleTheme} style={{ marginRight: '4px' }}>
                            {themeMode === 'dark'
                                ? <Brightness7Icon style={{ fontSize: '20px' }} />
                                : <Brightness4Icon style={{ fontSize: '20px' }} />
                            }
                        </IconButton>
                    </Tooltip>
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
                        validated && <Tooltip title={username} placement="bottom">
                            <IconButton color="inherit">
                                <Avatar className={classes.small}>{username.charAt(0).toUpperCase()}</Avatar>
                            </IconButton>
                        </Tooltip>
                    }
                </Toolbar>
            </AppBar>
        );
    }
}

TopBar.propTypes = {
    validated: PropTypes.bool.isRequired,
    username: PropTypes.string.isRequired,
    themeMode: PropTypes.string,
    toggleTheme: PropTypes.func,
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

const StyledTopBar = connect(mapStateToProps)(withStyles(styles)(TopBar));

// Wrapper to inject theme context into class component
const ConnectedTopBar = (props) => {
    const { mode, toggleTheme } = useThemeMode();
    return <StyledTopBar {...props} themeMode={mode} toggleTheme={toggleTheme} />;
};
export default ConnectedTopBar;
