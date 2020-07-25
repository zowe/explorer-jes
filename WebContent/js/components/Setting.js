/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2019
 */

import React from 'react';
import { connect } from 'react-redux';
import Switch from '@material-ui/core/Switch';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import styled from 'styled-components';


const Settings = styled.div`
    width: 580px;
    padding: 15px;
    margin: 0px 0px 15px;
    fontSize: 13px;
    color: #39464e;
    fontFamily: "Roboto", "Helvetica", "Arial", sans-serif;
`;
const H3 = styled.h3`
    border-top-color:rgb(233, 233, 233);
    border-top-style:solid;
    border-top-width:1px;
    color:rgb(57, 70, 78);
    font-size:13px;
    font-weight:700;
    padding-top:8px;
`;

const SettingSection = styled.div`
    width: 100%;
    display: grid;
    grid-template-columns: 33% 33% 33%
`;

export class SettingForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            enableReduxLogger: (window.localStorage.getItem('enableReduxLogger') === 'true') || false,
            notificationDuration: parseInt(window.localStorage.getItem('notificationDuration'), 10) || 5000,
        };

        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
    }

    componentWillReceiveProps() {

    }

    componentDidUpdate() {

    }

    onSubmit(event) {
        console.log(this.state);
        event.preventDefault();
        return false;
    }

    handleChange = ev => {
        let value = ev.target.value;
        if ('checked' in ev.target) {
            value = ev.target.checked;
        }
        this.setState({
            [ev.target.name]: value,
        });

        window.localStorage.setItem(ev.target.name, value);
    }

    render() {
        const { notificationDuration } = this.state;
        return (
            <Settings>
                <form onSubmit={this.onSubmit}>
                    <H3>App</H3>
                    <SettingSection>
                        <FormControl>
                            <TextField
                                select={true}
                                label="Notification Duration"
                                value={notificationDuration.toString()}
                                onChange={this.handleChange}
                                name="notificationDuration"
                            >
                                <MenuItem id="notification-small" key="small" value="5000" >Small</MenuItem>
                                <MenuItem id="notification-medium" key="medium" value="10000" >Medium</MenuItem>
                                <MenuItem id="notification-large" key="large" value="15000" >Large</MenuItem>
                            </TextField>


                        </FormControl>
                    </SettingSection>
                    <H3>Development</H3>
                    <SettingSection>
                        <FormControl>
                            <FormControlLabel
                                control={<Switch
                                    name="enableReduxLogger"
                                    checked={this.state.enableReduxLogger}
                                    onChange={this.handleChange}
                                />}
                                label="Redux Logger"
                            />
                        </FormControl>
                    </SettingSection>
                </form>
            </Settings>);
    }
}

SettingForm.propTypes = {

};

function mapStateToProps() {
    return {

    };
}

const ConnectedSettingForm = connect(mapStateToProps)(SettingForm);
export default ConnectedSettingForm;
