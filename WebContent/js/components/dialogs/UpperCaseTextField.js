/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2018
 */

import PropTypes from 'prop-types';
import React from 'react';
import TextField from 'material-ui/TextField';

export default class UpperCaseTextField extends React.Component {
    constructor(props) {
        super(props);
        const { value } = props;
        this.handleFieldChange = this.handleFieldChange.bind(this);

        this.state = {
            field: value,
        };
    }

    componentWillReceiveProps(nextProps) {
        const { value } = this.props;
        if (value !== nextProps.value) {
            this.fieldChanged(nextProps.value);
        }
    }

    handleFieldChange({ target }) {
        const { fieldChangedCallback } = this.props;
        const value = this.fieldChanged(target.value);
        fieldChangedCallback.call(this, value);
    }

    fieldChanged(value) {
        const fieldValue = value.toUpperCase();
        this.setState({ field: fieldValue });
        return fieldValue;
    }

    render() {
        const { fieldChangedCallback, ...props } = this.props;
        return (<TextField
            {...props}
            value={this.state.field}
            onChange={this.handleFieldChange}
        />);
    }
}

UpperCaseTextField.propTypes = {
    fieldChangedCallback: PropTypes.func,
    value: PropTypes.string,
};

