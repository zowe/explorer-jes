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
import OrionEditor from 'orion-editor-component';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import ConnectedRealtimeContentViewer from '../components/RealtimeContentViewer';
import { fetchJobFileNoName } from '../actions/content';

export class NodeViewer extends React.Component {
    constructor(props) {
        super(props);
        this.editorReady = this.editorReady.bind(this);

        this.state = {
            height: 0,
        };
    }

    componentWillReceiveProps(nextProps) {
        const { locationQuery } = this.props;
        if (locationQuery && locationQuery !== nextProps.locationQuery) {
            window.location.reload();
        }
    }

    updateUnreadLines = unreadLines => {
        this.setState({ unreadLines });
    };

    editorReady = () => {
        const { locationQuery, dispatch } = this.props;
        if (locationQuery) {
            dispatch(fetchJobFileNoName(locationQuery.jobName, locationQuery.jobId, locationQuery.fileId));
        }
    };

    render() {
        const { label, sourceId, content, isContentRealtime, dispatch, locationHost } = this.props;
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
                <OrionEditor
                    content={content}
                    syntax={'text/jclcontext'}
                    languageFilesHost={locationHost}
                    editorTopOffset={60}
                    readonly={true}
                    editorReady={this.editorReady}
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
                <CardText style={cardTextStyle} >
                    {contentViewer}
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
    dispatch: PropTypes.func.isRequired,
    locationHost: PropTypes.string,
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
