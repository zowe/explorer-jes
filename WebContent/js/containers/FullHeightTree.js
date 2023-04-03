/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */

import PropTypes from 'prop-types';
import React from 'react';

export default class FullHeightTree extends React.Component {
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

    componentDidUpdate() {
        this.updateDivHeight();
    }

    onDivRef(node) {
        if (node) {
            this.divRef = node;
        }
    }

    updateDivHeight() {
        const { offset } = this.props;
        const newHeight = window.innerHeight - (offset || 0);
        if (this.divRef && this.state.height !== newHeight) {
            this.setState({ height: newHeight });
        }
    }

    render() {
        const { overrideHeight, children } = this.props;
        return (
            <div
                id="full-height-tree"
                ref={this.onDivRef}
                style={{
                    overflow: 'scroll',
                    height: overrideHeight || this.state.height,
                    marginRight: '-15px',
                }}
            >
                {children}
            </div>
        );
    }
}

FullHeightTree.propTypes = {
    children: PropTypes.element.isRequired,
    overrideHeight: PropTypes.string,
    offset: PropTypes.number,
};
