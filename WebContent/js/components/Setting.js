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
import styled from 'styled-components';
import { ENABLE_REDUX_LOGGER, NOTIFICATION_DURATION, getStorageItem, setStorageItem } from '../utilities/storageHelper';

const Settings = styled.div`
    width: 220px;
    padding: 20px;
    margin: 0;
    font-size: 13px;
    color: #eef0ff;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;
const H3 = styled.h3`
    border-top: 1px solid rgba(99, 102, 241, 0.1);
    color: #5a5d8a;
    font-size: 11px;
    font-weight: 600;
    padding-top: 12px;
    margin-top: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const H5 = styled.h5`
    color: #fb7185;
    font-size: 11px;
`;

const Heading3 = styled.h3`
    font-size: 15px;
    font-weight: 700;
    color: #eef0ff;
    margin-bottom: 4px;
`;

const SettingSection = styled.div`
    width: 100%;
    display: grid;
    grid-template-columns: 100%;
    gap: 8px;
`;

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
            enableReduxLogger: getStorageItem(ENABLE_REDUX_LOGGER) || false,
            notificationDuration: getStorageItem(NOTIFICATION_DURATION) || 5000,
        };

        this.mapStorageKey = new Map();
        this.mapStorageKey.set(ENABLE_REDUX_LOGGER, 'enableReduxLogger');
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
        const { notificationDuration, enableReduxLogger } = this.state;
        const { classes } = this.props;
        return (
            <Settings>
                <Heading3>Preferences</Heading3>
                <form>
                    <H3>App</H3>
                    <SettingSection>
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
                    </SettingSection>
                    <H3>Logging</H3>
                    <SettingSection>
                        <FormControl>
                            <FormControlLabel
                                control={(<Switch
                                    name={ENABLE_REDUX_LOGGER}
                                    checked={enableReduxLogger}
                                    onChange={this.handleChange}
                                />)}
                                label="Browser Console Logging"
                                classes={{ label: classes.customizeLabel }}
                            />
                        </FormControl>
                    </SettingSection>
                </form>
                <H5 style={{ color: '#fb7185' }}>*Preferences change require reload</H5>
            </Settings>
        );
    }
}

SettingFormBase.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    classes: PropTypes.object.isRequired,
};

const SettingForm = withStyles(styles)(SettingFormBase);
export default SettingForm;
