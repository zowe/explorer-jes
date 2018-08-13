/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018
 */

import PropTypes from 'prop-types';
import React from 'react';

export default class FulleHeightTree extends React.Component {
    constructor(props) {
        super(props);
        this.onDivRef = this.onDivRef.bind(this);
        this.updateDivHeight = this.updateDivHeight.bind(this);

        this.state = {
            height: 0,
        };
    }

    componentDidMount() {
        this.updateDivHeight();
        window.addEventListener('resize', this.updateDivHeight);
    }

    onDivRef(node) {
        if (node) {
            this.divRef = node;
        }
    }

    updateDivHeight() {
        const { offset } = this.props;
        if (this.divRef) {
            this.setState({ height: window.innerHeight - this.divRef.offsetTop - (offset || 0) });
        }
    }

    render() {
        const { overrideHeight, children } = this.props;
        return (
            <div
                className="node"
                ref={this.onDivRef}
                style={{ overflow: 'auto', height: overrideHeight || this.state.height }}
            >
                {children}
            </div>
        );
    }
}

FulleHeightTree.propTypes = {
    children: PropTypes.element.isRequired,
    overrideHeight: PropTypes.string,
    offset: PropTypes.number,
};
