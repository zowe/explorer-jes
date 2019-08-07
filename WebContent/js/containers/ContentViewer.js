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
import { connect } from 'react-redux';
import OrionEditor from 'orion-editor-component';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import { fetchJobFileNoName } from '../actions/content';

export class ContentViewer extends React.Component {
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
        const { label, content, locationHost } = this.props;
        const cardTextStyle = { paddingTop: '0', paddingBottom: '0' };
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
                <CardContent style={cardTextStyle} >
                    <OrionEditor
                        content={content}
                        syntax={'text/jclcontext'}
                        languageFilesHost={locationHost}
                        readonly={true}
                        editorReady={this.editorReady}
                    />
                </CardContent>
            </Card>
        );
    }
}

ContentViewer.propTypes = {
    label: PropTypes.string,
    content: PropTypes.string,
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
        label: contentRoot.get('label'),
        content: contentRoot.get('content'),
        edit: contentRoot.get('edit'),
        checksum: contentRoot.get('checksum'),
        isFetching: contentRoot.get('isFetching'),
    };
}

const ConnectedContentViewer = connect(mapStateToProps)(ContentViewer);
export default ConnectedContentViewer;
