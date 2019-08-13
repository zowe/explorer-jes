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
import { List } from 'immutable';
import { connect } from 'react-redux';
import OrionEditor from 'orion-editor-component';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import ClearIcon from '@material-ui/icons/Clear';
import { fetchJobFileNoName, removeContent, changeSelectedContent } from '../actions/content';

export class ContentViewer extends React.Component {
    constructor(props) {
        super(props);
        this.editorReady = this.editorReady.bind(this);
        this.handleSelectedTabChange = this.handleSelectedTabChange.bind(this);
        this.handleCloseTab = this.handleCloseTab.bind(this);

        this.state = {
            height: 0,
            editorContent: ' ',
        };
    }

    componentWillReceiveProps(nextProps) {
        const { locationQuery, content, dispatch } = this.props;
        const { content: newContent } = nextProps;
        if (locationQuery && locationQuery !== nextProps.locationQuery) {
            window.location.reload();
        }
        if (newContent.size > content.size) {
            dispatch(changeSelectedContent(newContent.size - 1));
        }
    }

    editorReady = () => {
        const { locationQuery, dispatch } = this.props;
        if (locationQuery) {
            dispatch(fetchJobFileNoName(locationQuery.jobName, locationQuery.jobId, locationQuery.fileId));
        }
    };

    handleSelectedTabChange(newTabIndex) {
        const { dispatch } = this.props;
        dispatch(changeSelectedContent(newTabIndex));
    }

    handleCloseTab(index) {
        const { selectedContent, dispatch } = this.props;
        dispatch(removeContent(index));
        if (selectedContent > 1) {
            dispatch(changeSelectedContent(selectedContent - 1));
        } else {
            dispatch(changeSelectedContent(0));
        }
    }

    renderTabs() {
        const { content, selectedContent } = this.props;
        const unselectedTabStyle = { display: 'flex', float: 'left', alignItems: 'center', padding: '6px', cursor: 'pointer' };
        const selectedTabStyle = { ...{ color: 'black', backgroundColor: 'white' }, ...unselectedTabStyle };
        if (content.size > 0) {
            return content.map((tabContent, index) => {
                return (
                    <div style={index === selectedContent ? selectedTabStyle : unselectedTabStyle} key={tabContent.label}>
                        <div onClick={() => { this.handleSelectedTabChange(index); }} >
                            {tabContent.label}
                        </div>
                        <ClearIcon onClick={() => { this.handleCloseTab(index); }} />
                    </div>
                );
            });
        }
        return (
            <div style={{ padding: '6px' }} >
                Content viewer
            </div>
        );
    }

    render() {
        const { content, locationHost, selectedContent } = this.props;
        const cardTextStyle = { paddingTop: '0', paddingBottom: '0' };
        return (
            <Card
                id="content-viewer"
                className="card-component"
                style={{ marginBottom: 0 }}
                expanded={true}
            >
                <CardHeader
                    subheader={this.renderTabs()}
                    style={{ paddingBottom: 0 }}
                />
                <CardContent style={cardTextStyle} >
                    <OrionEditor
                        content={(content.get(selectedContent) && content.get(selectedContent).content) || ' '}
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
    content: PropTypes.instanceOf(List),
    dispatch: PropTypes.func.isRequired,
    selectedContent: PropTypes.number.isRequired,
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
        content: contentRoot.get('content'),
        isFetching: contentRoot.get('isFetching'),
        selectedContent: contentRoot.get('selectedContent'),
    };
}

const ConnectedContentViewer = connect(mapStateToProps)(ContentViewer);
export default ConnectedContentViewer;
