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
import {
    EDITOR_FONT_SIZE,
    EDITOR_MINIMAP,
    EDITOR_WORD_WRAP,
    EDITOR_LINE_NUMBERS,
    EDITOR_RENDER_WHITESPACE,
    getStorageItem,
    setStorageItem,
} from '../utilities/storageHelper';

const Settings = styled.div`
    width: 260px;
    padding: 20px;
    margin: 0;
    font-size: 13px;
    color: var(--text-primary);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;
const H3 = styled.h3`
    border-top: 1px solid var(--border-subtle);
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 600;
    padding-top: 12px;
    margin-top: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const H5 = styled.h5`
    color: var(--accent-rose);
    font-size: 11px;
`;

const Heading3 = styled.h3`
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
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
            fontSize: getStorageItem(EDITOR_FONT_SIZE) || 13,
            minimap: getStorageItem(EDITOR_MINIMAP) !== false,
            wordWrap: getStorageItem(EDITOR_WORD_WRAP) || 'off',
            lineNumbers: getStorageItem(EDITOR_LINE_NUMBERS) || 'on',
            renderWhitespace: getStorageItem(EDITOR_RENDER_WHITESPACE) || 'none',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSwitchChange = this.handleSwitchChange.bind(this);
    }

    handleChange = ev => {
        const { name, value } = ev.target;
        const keyMap = {
            [EDITOR_FONT_SIZE]: 'fontSize',
            [EDITOR_WORD_WRAP]: 'wordWrap',
            [EDITOR_LINE_NUMBERS]: 'lineNumbers',
            [EDITOR_RENDER_WHITESPACE]: 'renderWhitespace',
        };
        const stateKey = keyMap[name];
        if (stateKey) {
            const parsedValue = name === EDITOR_FONT_SIZE ? parseInt(value, 10) : value;
            this.setState({ [stateKey]: parsedValue });
            setStorageItem(name, parsedValue);
            window.dispatchEvent(new CustomEvent('editor-settings-changed'));
        }
    };

    handleSwitchChange = ev => {
        const { name, checked } = ev.target;
        if (name === EDITOR_MINIMAP) {
            this.setState({ minimap: checked });
            setStorageItem(name, checked);
            window.dispatchEvent(new CustomEvent('editor-settings-changed'));
        }
    };

    render() {
        const { fontSize, minimap, wordWrap, lineNumbers, renderWhitespace } = this.state;
        const { classes } = this.props;
        return (
            <Settings>
                <Heading3>Editor Preferences</Heading3>
                <form>
                    <H3>Appearance</H3>
                    <SettingSection>
                        <FormControl>
                            <TextField
                                select={true}
                                label="Font Size"
                                value={fontSize.toString()}
                                onChange={this.handleChange}
                                name={EDITOR_FONT_SIZE}
                            >
                                <MenuItem key="11" value="11">11px</MenuItem>
                                <MenuItem key="12" value="12">12px</MenuItem>
                                <MenuItem key="13" value="13">13px</MenuItem>
                                <MenuItem key="14" value="14">14px</MenuItem>
                                <MenuItem key="15" value="15">15px</MenuItem>
                                <MenuItem key="16" value="16">16px</MenuItem>
                            </TextField>
                        </FormControl>
                        <FormControl>
                            <FormControlLabel
                                control={(<Switch
                                    name={EDITOR_MINIMAP}
                                    checked={minimap}
                                    onChange={this.handleSwitchChange}
                                />)}
                                label="Minimap"
                                classes={{ label: classes.customizeLabel }}
                            />
                        </FormControl>
                    </SettingSection>
                    <H3>Editor Behavior</H3>
                    <SettingSection>
                        <FormControl>
                            <TextField
                                select={true}
                                label="Word Wrap"
                                value={wordWrap}
                                onChange={this.handleChange}
                                name={EDITOR_WORD_WRAP}
                            >
                                <MenuItem key="off" value="off">Off</MenuItem>
                                <MenuItem key="on" value="on">On</MenuItem>
                                <MenuItem key="wordWrapColumn" value="wordWrapColumn">At Column 80</MenuItem>
                                <MenuItem key="bounded" value="bounded">Bounded</MenuItem>
                            </TextField>
                        </FormControl>
                        <FormControl>
                            <TextField
                                select={true}
                                label="Line Numbers"
                                value={lineNumbers}
                                onChange={this.handleChange}
                                name={EDITOR_LINE_NUMBERS}
                            >
                                <MenuItem key="on" value="on">On</MenuItem>
                                <MenuItem key="off" value="off">Off</MenuItem>
                                <MenuItem key="relative" value="relative">Relative</MenuItem>
                            </TextField>
                        </FormControl>
                        <FormControl>
                            <TextField
                                select={true}
                                label="Render Whitespace"
                                value={renderWhitespace}
                                onChange={this.handleChange}
                                name={EDITOR_RENDER_WHITESPACE}
                            >
                                <MenuItem key="none" value="none">None</MenuItem>
                                <MenuItem key="boundary" value="boundary">Boundary</MenuItem>
                                <MenuItem key="selection" value="selection">Selection</MenuItem>
                                <MenuItem key="all" value="all">All</MenuItem>
                            </TextField>
                        </FormControl>
                    </SettingSection>
                </form>
                <H5 style={{ color: '#fb7185' }}>*Settings are applied in real-time</H5>
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
