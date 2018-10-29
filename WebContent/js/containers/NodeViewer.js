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
import { connect } from 'react-redux';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import ContentViewer from '../components/ContentViewer';
import ConnectedRealtimeContentViewer from '../components/RealtimeContentViewer';
import { fetchContentNoNode } from '../actions/content';

const PADDING_OFFSET = 8;

export class NodeViewer extends React.Component {
    constructor(props) {
        super(props);
        this.onDivRef = this.onDivRef.bind(this);

        this.state = {
            height: 0,
        };
    }

    componentWillMount() {
        const { locationQuery, dispatch } = this.props;
        if (locationQuery && locationQuery.jobId && locationQuery.fileId &&
            (locationQuery.jobName || locationQuery.prefix)) {
            dispatch(fetchContentNoNode(locationQuery.jobName || locationQuery.prefix, locationQuery.jobId, locationQuery.fileId));
        }
    }

    componentDidMount() {
        this.updateDivHeight();
        window.addEventListener('resize', this.updateDivHeight);
    }

    componentWillReceiveProps(nextProps) {
        const { locationQuery } = this.props;
        if (locationQuery && locationQuery !== nextProps.locationQuery) {
            window.location.reload();
        }
    }

    onDivRef(node) {
        if (node) {
            this.divRef = node;
        }
    }

    updateDivHeight() {
        if (this.divRef) {
            this.setState({ height: window.innerHeight - this.divRef.offsetTop - PADDING_OFFSET });
        }
    }

    updateUnreadLines = unreadLines => {
        this.setState({ unreadLines });
    };

    render() {
        const { label, sourceId, content, isContentRealtime, isFetching, dispatch } = this.props;
        const cardTextStyle = { paddingTop: '0', paddingBottom: '0' };
        let contentViewer;
        if (isContentRealtime) {
            contentViewer = (
                <ConnectedRealtimeContentViewer
                    contentURI={`${sourceId}?records=40`}
                    dispatch={dispatch}
                    updateUnreadLines={this.updateUnreadLines}
                />);
        } else {
            contentViewer = (
                <ContentViewer
                    isFetching={isFetching}
                    content={content}
                    dispatch={dispatch}
                />
            );
        }
        return (
            <Card
                id="content-viewer"
                className="card-component"
                style={{ marginBottom: 0 }}
                expanded={true}
            >
                <CardHeader
                    title={label || 'Content Viewer'}
                />
                <CardText
                    style={cardTextStyle}
                >
                    <div
                        ref={this.onDivRef}
                        style={{ overflow: 'auto', height: this.state.height }}
                    >
                        {contentViewer}
                    </div>

                </CardText>
            </Card>
        );
    }
}

NodeViewer.propTypes = {
    sourceId: PropTypes.string,
    label: PropTypes.string,
    content: PropTypes.string,
    isContentRealtime: PropTypes.bool,
    isFetching: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    locationQuery: PropTypes.shape({
        jobName: PropTypes.string.isRequired,
        jobId: PropTypes.string.isRequired,
        fileId: PropTypes.string.isRequired,
    }),
};

function mapStateToProps(state) {
    const contentRoot = state.get('content');
    return {
        sourceId: contentRoot.get('sourceId'),
        label: contentRoot.get('label'),
        content: contentRoot.get('content'),
        edit: contentRoot.get('edit'),
        checksum: contentRoot.get('checksum'),
        isContentHTML: contentRoot.get('isContentHTML'),
        isContentRealtime: contentRoot.get('isContentRealtime'),
        isFetching: contentRoot.get('isFetching'),
    };
}

const ConnectedNodeViewer = connect(mapStateToProps)(NodeViewer);
export default ConnectedNodeViewer;
