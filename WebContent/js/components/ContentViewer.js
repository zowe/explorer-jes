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
import OrionEditor from 'orion-editor-component';

const ContentViewer = props => {
    const { content } = props;
    return (
        <OrionEditor
            content={content}
            syntax={'text/jclcontext'}
            languageFilesHost={'winmvs3b.hursley.ibm.com:7445'}
            editorTopOffset={60}
            readonly={true}
        />);
};

ContentViewer.propTypes = {
    content: PropTypes.string,
};

export default ContentViewer;
