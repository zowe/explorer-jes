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
import PropTypes from 'prop-types';

/**
 * Component to announce a change to a screen reader,
 * No content is ever rendered on screen
 */
const Announcer = ({ message }) => {
    return (
        <div
            aria-live="polite"
            aria-label={message}
            style={{ visibility: 'hidden', lineHeight: 0, display: 'block' }}
        >
            {message}
        </div>
    );
};

export default Announcer;

Announcer.propTypes = {
    message: PropTypes.string,
};
