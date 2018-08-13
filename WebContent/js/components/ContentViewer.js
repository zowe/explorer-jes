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
import ConnectedRichTextViewer from './RichTextViewer';
import HTMLTextViewer from './HTMLTextViewer';

const CONTENT_NODE_ID = 'node-viewer-content';

const ContentViewer = props => {
    const { content, isContentHTML, languageSyntax, dispatch } = props;
    if (content) {
        if (isContentHTML) {
            return (<HTMLTextViewer
                id={CONTENT_NODE_ID}
                content={content}
                languageSyntax={languageSyntax}
                dispatch={dispatch}
            />);
        }
        return (<ConnectedRichTextViewer
            id={CONTENT_NODE_ID}
            content={content}
            languageSyntax={languageSyntax}
            dispatch={dispatch}
        />);
    }
    return null;
};

ContentViewer.propTypes = {
    content: PropTypes.string,
    languageSyntax: PropTypes.string.isRequired,
    isContentHTML: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
};

export default ContentViewer;
