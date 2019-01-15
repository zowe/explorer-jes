/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2019
 */

import PropTypes from 'prop-types';
import React from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import ConnectedSyslogViewer from '../components/SyslogViewer';

export default class SyslogCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            unreadLines: 0,
        };
    }

    updateUnreadLines = unreadLines => {
        this.setState({ unreadLines });
    }

    render() {
        const { fullScreen } = this.props;
        return (
            <Card id="syslog-viewer" className="card-component">
                <CardHeader
                    title="SYSLOG Viewer"
                    subtitle={this.state.unreadLines > 0 ? `Unread count: ${this.state.unreadLines}` : null}
                    actAsExpander={!fullScreen}
                    showExpandableButton={!fullScreen}
                />
                <CardText expandable={!fullScreen}>
                    <ConnectedSyslogViewer
                        updateUnreadLines={this.updateUnreadLines}
                    />
                </CardText>
            </Card>
        );
    }
}

SyslogCard.propTypes = {
    fullScreen: PropTypes.bool,
};
