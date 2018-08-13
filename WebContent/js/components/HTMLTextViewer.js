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
import { Markup } from 'interweave';


const CONTENT_NODE_ID = 'node-viewer-content';


class HTMLTextViewer extends React.Component {
    static replaceLineBreaks = content => {
        return content.replace(/\n/g, '</br>');
    }

    static replaceWhitespace = content => {
        return content.replace(/ /g, '&nbsp;');
    }

    render() {
        let { content } = this.props;
        content = HTMLTextViewer.replaceLineBreaks(HTMLTextViewer.replaceWhitespace(content));
        return (
            <div id={CONTENT_NODE_ID}>
                <Markup
                    tagName="div"
                    content={content}
                />
            </div>
        );
    }
}

HTMLTextViewer.propTypes = {
    content: PropTypes.string.isRequired,
};

export default HTMLTextViewer;
