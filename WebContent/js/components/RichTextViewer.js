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
import SyntaxHighlighter from 'react-syntax-highlighter';
import lowlight from 'lowlight/lib/core';
import jcl from '../resources/languages/jcl';
import syslog from '../resources/languages/syslog';

lowlight.registerLanguage('jcl', jcl);
lowlight.registerLanguage('syslog', syslog);

const RichTextViewer = props => {
    const { id, content, languageSyntax } = props;

    return (
        <SyntaxHighlighter
            id={id}
            language={languageSyntax}
            useInlineStyles={false}
        >
            {content}
        </SyntaxHighlighter>
    );
};

RichTextViewer.propTypes = {
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    languageSyntax: PropTypes.string.isRequired,
};

export default RichTextViewer;
