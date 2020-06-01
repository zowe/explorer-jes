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
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import CircularProgressIcon from '@material-ui/core/CircularProgress';
import queryString from 'query-string';
import { fetchJobFileNoName, removeContent, updateContent, changeSelectedContent, submitJCL } from '../actions/content';

export class ContentViewer extends React.Component {
    constructor(props) {
        super(props);
        this.editorReady = this.editorReady.bind(this);
        this.handleSelectedTabChange = this.handleSelectedTabChange.bind(this);
        this.handleCloseTab = this.handleCloseTab.bind(this);
        this.renderSubmitButton = this.renderSubmitButton.bind(this);
        this.onButtonRef = this.onButtonRef.bind(this);
        this.updateSubmitJCLButtonOffset = this.updateSubmitJCLButtonOffset.bind(this);
        this.focusToActiveTab = this.focusToActiveTab.bind(this);
        this.handleKeyDownOnContentTabLabel = this.handleKeyDownOnContentTabLabel.bind(this);

        this.fileTabs = [];
        this.state = {
            height: 0,
            currentContent: '',
            submitJCLButtonOffset: window.innerWidth - 120,
        };
    }

    componentDidMount() {
        window.addEventListener('resize', this.updateSubmitJCLButtonOffset);
    }

    componentWillReceiveProps(nextProps) {
        const { locationSearch, content, dispatch } = this.props;
        const { content: newContent } = nextProps;
        if (locationSearch && locationSearch !== nextProps.locationSearch) {
            window.location.reload();
        }
        if (newContent.size > content.size) {
            dispatch(changeSelectedContent(newContent.size - 1));
        }
    }

    componentDidUpdate(prevProp) {
        const { selectedContent, title } = this.props;
        if (selectedContent !== prevProp.selectedContent) {
            this.focusToActiveTab();
        }
        document.title = title;
    }

    onButtonRef(node) {
        if (node) {
            this.buttonRef = node;
        }
    }

    getContent = content => {
        this.setState({ currentContent: content });
    };

    updateSubmitJCLButtonOffset() {
        if (this.buttonRef) {
            this.setState({ submitJCLButtonOffset: window.innerWidth - 120 });
        }
    }

    editorReady = () => {
        const { locationSearch, dispatch } = this.props;
        if (locationSearch) {
            const urlQueryParams = queryString.parse(locationSearch);
            dispatch(fetchJobFileNoName(urlQueryParams.jobName, urlQueryParams.jobId, urlQueryParams.fileId));
        }
    };

    handleSelectedTabChange(newTabIndex) {
        const { selectedContent, content, dispatch } = this.props;
        if (this.state.currentContent !== content.get(selectedContent).content) {
            dispatch(updateContent(this.state.currentContent));
        }
        dispatch(changeSelectedContent(newTabIndex));
    }

    handleCloseTab(removeIndex) {
        const { selectedContent, dispatch } = this.props;
        dispatch(removeContent(removeIndex));
        // Do we need to change the selectedContent
        if (removeIndex <= selectedContent && selectedContent >= 1) {
            dispatch(changeSelectedContent(selectedContent - 1));
        }
    }

    handleKeyDownOnContentTabLabel(e, index) {
        if (e.key === 'Enter') { this.handleSelectedTabChange(index); }
    }

    focusToActiveTab() {
        const { selectedContent } = this.props;
        const tab = this.fileTabs[selectedContent];
        if (tab) {
            tab.focus();
        }
    }

    renderTabs() {
        const { content, selectedContent } = this.props;
        const unselectedTabStyle = { display: 'flex', float: 'left', alignItems: 'center', padding: '6px', cursor: 'pointer' };
        const selectedTabStyle = { ...{ color: 'black', backgroundColor: 'white' }, ...unselectedTabStyle };
        if (content.size > 0) {
            return content.map((tabContent, index) => {
                return (
                    <div
                        className="content-tab"
                        style={{ width: 'max-content', display: 'inline-block' }}
                        key={tabContent.label}
                        role="tab"
                        aria-selected={index === selectedContent ? 'true' : 'false'}
                        aria-controls="content-viewer-body"
                    >
                        <div
                            style={index === selectedContent ? selectedTabStyle : unselectedTabStyle}
                        >
                            <div
                                className="content-tab-label"
                                onClick={() => { this.handleSelectedTabChange(index); }}
                                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                                tabIndex="0"
                                onKeyDown={e => { return this.handleKeyDownOnContentTabLabel(e, index); }}
                                ref={fileTab => { this.fileTabs[index] = fileTab; return this.fileTabs[index]; }}
                            >
                                {tabContent.label}
                            </div>
                            <ClearIcon
                                onClick={() => { this.handleCloseTab(index); }}
                                tabIndex="0"
                                onKeyDown={e => { if (e.key === 'Enter') this.handleCloseTab(index); }}
                            />
                        </div>
                        {tabContent.isFetching ? <LinearProgress class="progress-bar" style={{ width: '100%', height: '2px' }} /> : null}
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

    renderSubmitButton() {
        const { content, selectedContent, isSubmittingJCL, dispatch } = this.props;
        if (content && content.get(selectedContent) && !content.get(selectedContent).readOnly
            && !content.get(selectedContent).isFetching) {
            return (
                <Button
                    id="content-viewer-submit"
                    variant="contained"
                    color="primary"
                    style={{ position: 'absolute', left: this.state.submitJCLButtonOffset, width: '85px' }}
                    ref={this.onButtonRef}
                    onClick={() => { dispatch(submitJCL(this.state.currentContent)); }}
                >
                    {isSubmittingJCL ?
                        <CircularProgressIcon
                            id="loading-icon"
                            size={20}
                            style={{ color: 'white' }}
                        />
                        :
                        <div>SUBMIT</div>}
                </Button>
            );
        }
        return null;
    }

    renderSubheader() {
        return (
            <div style={{ height: '38px' }} role="tablist" aria-label="Open Job output files">
                { this.renderTabs() }
                { this.renderSubmitButton()}
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
            >
                <CardHeader
                    id="content-viewer-header"
                    subheader={this.renderSubheader()}
                    style={{ paddingBottom: 0, whiteSpace: 'nowrap', overflowY: 'hidden', overflowX: 'scroll' }}
                />
                <CardContent id="content-viewer-body" style={cardTextStyle} role="tabpanel">
                    <OrionEditor
                        content={(content.get(selectedContent) && content.get(selectedContent).content) || ' '}
                        syntax={'text/jclcontext'}
                        languageFilesHost={locationHost}
                        readonly={content.get(selectedContent) ? content.get(selectedContent).readOnly : true}
                        editorReady={this.editorReady}
                        passContentToParent={this.getContent}
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
    locationSearch: PropTypes.string,
    isSubmittingJCL: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
    const contentRoot = state.get('content');
    return {
        content: contentRoot.get('content'),
        isFetching: contentRoot.get('isFetching'),
        selectedContent: contentRoot.get('selectedContent'),
        isSubmittingJCL: contentRoot.get('isSubmittingJCL'),
        title: contentRoot.get('title'),
    };
}

const ConnectedContentViewer = connect(mapStateToProps)(ContentViewer);
export default ConnectedContentViewer;
