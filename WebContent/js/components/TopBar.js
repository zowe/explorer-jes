import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import SettingsIcon from '@material-ui/icons/Settings';
import Popover from '@material-ui/core/Popover';
import Tooltip from '@material-ui/core/Tooltip';
import SettingForm from './Setting';

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
        const { validated, username } = this.props;
        const open = Boolean(anchorEl);
        const id = open ? 'simple-popover' : undefined;
        return (
            <AppBar position="static">
                <Toolbar>
                    <Typography type="title" color="inherit" style={{ flex: 1 }}>
                            JES Explorer
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
                            <Avatar>{username.charAt(0).toUpperCase()}</Avatar>
                        </IconButton>
                    </Tooltip>}
                </Toolbar>
            </AppBar>);
    }
}


TopBar.propTypes = {
    validated: PropTypes.bool.isRequired,
    username: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
    const validationRoot = state.get('validation');
    return {
        validated: validationRoot.get('validated'),
        username: validationRoot.get('username'),
    };
}

const ConnectedTopBar = connect(mapStateToProps)(TopBar);
export default ConnectedTopBar;
