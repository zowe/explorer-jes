/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2020
 */

import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { NOTIFICATION_DURATION, getStorageItem, setStorageItem } from '../utilities/storageHelper';

const settingsStyle = {
    width: '180px',
    padding: '15px',
    margin: '0px 0px 15px',
    fontSize: '13px',
    color: '#39464e',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
};

const h3Style = {
    borderTopColor: 'rgb(233, 233, 233)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    color: 'rgb(57, 70, 78)',
    fontSize: '13px',
    fontWeight: '700',
    paddingTop: '8px',
};

const h5Style = {
    color: 'red',
};

const settingSectionStyle = {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '100%',
};

const styles = {
    customizeLabel: {
        fontSize: '0.75rem',
        color: 'grey',
    },
};

class SettingFormBase extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            notificationDuration: getStorageItem(NOTIFICATION_DURATION) || 5000,
        };

        this.mapStorageKey = new Map();
        this.mapStorageKey.set(NOTIFICATION_DURATION, 'notificationDuration');

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange = ev => {
        let value = ev.target.value;
        const key = this.mapStorageKey.get(ev.target.name);

        if ('checked' in ev.target) {
            value = ev.target.checked;
        }

        this.setState({
            [key]: value,
        });

        setStorageItem(ev.target.name, value);
    };

    render() {
        const { notificationDuration } = this.state;
        const { classes } = this.props;
        return (
            <div style={settingsStyle}>
                <h3>Preferences</h3>
                <form>
                    <h3 style={h3Style}>App</h3>
                    <div style={settingSectionStyle}>
                        <FormControl>
                            <TextField
                                select={true}
                                label="Notification Duration"
                                value={notificationDuration.toString()}
                                onChange={this.handleChange}
                                name={NOTIFICATION_DURATION}
                            >
                                <MenuItem id="notification-small" key="small" value="5000">Small(5s)</MenuItem>
                                <MenuItem id="notification-medium" key="medium" value="10000">Medium(10s)</MenuItem>
                                <MenuItem id="notification-large" key="large" value="15000">Large(15s)</MenuItem>
                            </TextField>
                        </FormControl>
                    </div>
                </form>
                <h5 style={h5Style}>*Preferences change require reload</h5>
            </div>
        );
    }
}

SettingFormBase.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    classes: PropTypes.object.isRequired,
};

const SettingForm = withStyles(styles)(SettingFormBase);
export default SettingForm;
