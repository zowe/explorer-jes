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
import MonacoEditor from '../components/MonacoEditor';
import { useThemeMode } from '../themes/ThemeContext';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ClearIcon from '@material-ui/icons/Clear';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import CircularProgressIcon from '@material-ui/core/CircularProgress';
import queryString from 'query-string';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { fetchJobFileNoName, removeContent, updateContent, updateContentAtIndex, changeSelectedContent, submitJCL } from '../actions/content';

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
        this._tabSwitchInternal = false;
        this.state = {
            height: 0, // eslint-disable-line
            currentContent: '',
            submitJCLButtonOffset: window.innerWidth - 120,
        };
    }

    componentDidMount() {
        window.addEventListener('resize', this.updateSubmitJCLButtonOffset);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateSubmitJCLButtonOffset);
    }

    // eslint-disable-next-line
    componentWillReceiveProps(nextProps) {
        const { locationSearch, content, dispatch, selectedContent } = this.props;
        const { content: newContent } = nextProps;
        if (locationSearch && locationSearch !== nextProps.locationSearch) {
            window.location.reload();
        }
        if (newContent.size > content.size) {
            // Save current edits before auto-switching to new tab
            const currentTab = content.get(selectedContent);
            if (this.state.currentContent && currentTab
                && this.state.currentContent !== currentTab.content) {
                dispatch(updateContent(this.state.currentContent));
            }
            this.setState({ currentContent: '' });
            this._tabSwitchInternal = true;
            dispatch(changeSelectedContent(newContent.size - 1));
        }
    }

    componentDidUpdate(prevProp) {
        const { selectedContent, content, dispatch, title } = this.props;
        if (selectedContent !== prevProp.selectedContent) {
            // Auto-save edits when tab switches externally (from tree clicks)
            if (!this._tabSwitchInternal) {
                const prevTab = prevProp.content.get(prevProp.selectedContent);
                if (this.state.currentContent && prevTab
                    && this.state.currentContent !== prevTab.content) {
                    // Use updateContentAtIndex to save to the PREVIOUS tab, not current
                    dispatch(updateContentAtIndex(this.state.currentContent, prevProp.selectedContent));
                }
                // Initialize currentContent with the new tab's content
                const newTab = content.get(selectedContent);
                this.setState({ currentContent: newTab ? newTab.content || '' : '' });
            }
            this._tabSwitchInternal = false;
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
        if (newTabIndex === selectedContent) return; // Already on this tab
        const currentTabContent = content.get(selectedContent);
        // Only save edits if user actually modified the content
        if (this.state.currentContent && currentTabContent
            && this.state.currentContent !== currentTabContent.content) {
            dispatch(updateContent(this.state.currentContent));
        }
        // Reset currentContent for the new tab
        const newTab = content.get(newTabIndex);
        this.setState({ currentContent: newTab ? newTab.content || '' : '' });
        this._tabSwitchInternal = true;
        dispatch(changeSelectedContent(newTabIndex));
    }

    handleCloseTab(removeIndex) {
        const { selectedContent, dispatch } = this.props;
        dispatch(removeContent(removeIndex));
        // Only reset content state when the selected tab itself is being closed
        if (removeIndex === selectedContent) {
            this.setState({ currentContent: '' });
        }
        // Do we need to change the selectedContent
        if (removeIndex <= selectedContent && selectedContent >= 1) {
            this._tabSwitchInternal = true;
            dispatch(changeSelectedContent(selectedContent - 1));
        }
    }

    handleCloseRightTabs(index) {
        const { selectedContent, dispatch } = this.props;
        const openedFilesCount = this.props.content.size;
        if (index < openedFilesCount - 1) {
            for (let removeIndex = index + 1; removeIndex < openedFilesCount; removeIndex++) {
                dispatch(removeContent(index + 1));
            }
            if (index < selectedContent) {
                // Selected tab was closed, switch and reset
                this._tabSwitchInternal = true;
                dispatch(changeSelectedContent(index));
                this.setState({ currentContent: '' });
            }
            // else: selected tab is preserved, keep currentContent
        }
    }

    handleCloseLeftTabs(index) {
        const { selectedContent, dispatch } = this.props;
        if (index > 0) {
            for (let removeIndex = 0; removeIndex < index; removeIndex++) {
                dispatch(removeContent(0));
            }
            this._tabSwitchInternal = true;
            if (selectedContent < index) {
                // Selected tab was in the closed range, reset
                dispatch(changeSelectedContent(0));
                this.setState({ currentContent: '' });
            } else {
                // Selected tab survives, just shifted left
                dispatch(changeSelectedContent(selectedContent - index));
            }
        }
    }

    handleCloseAllExceptTabs(index) {
        const { selectedContent, dispatch } = this.props;
        const openedFilesCount = this.props.content.size;
        this._tabSwitchInternal = true;
        if (index < openedFilesCount - 1) {
            for (let removeIndex = index + 1; removeIndex < openedFilesCount; removeIndex++) {
                dispatch(removeContent(index + 1));
            }
            if (index < selectedContent) {
                dispatch(changeSelectedContent(index));
            }
        }
        dispatch(changeSelectedContent(0));

        if (index > 0) {
            for (let removeIndex = 0; removeIndex < index; removeIndex++) {
                dispatch(removeContent(0));
            }
            dispatch(changeSelectedContent(0));
        }
        // Only reset if the surviving tab was not the one being edited
        if (selectedContent !== index) {
            this.setState({ currentContent: '' });
        }
    }

    handleCloseAllTabs() {
        const { dispatch } = this.props;
        const openedFilesCount = this.props.content.size;
        for (let index = 0; index < openedFilesCount; index++) {
            dispatch(removeContent(0));
        }
        this.setState({ currentContent: '' });
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

    renderTabContextMenu(index) {
        return (
            <ContextMenu
                id={index.toString()}
            >
                <MenuItem key="close" onClick={() => { this.handleCloseTab(index); }}>
                    Close
                </MenuItem>
                <MenuItem key="closeAll" onClick={() => { this.handleCloseAllTabs(); }}>
                    Close All
                </MenuItem>
                <MenuItem key="closeAllExcept" onClick={() => { this.handleCloseAllExceptTabs(index); }}>
                    Close All Except
                </MenuItem>
                <MenuItem key="closeAllToTheLeft" onClick={() => { this.handleCloseLeftTabs(index); }}>
                    Close All to the Left
                </MenuItem>
                <MenuItem key="closeAllToTheRight" onClick={() => { this.handleCloseRightTabs(index); }}>
                    Close All to the Right
                </MenuItem>
            </ContextMenu>
        );
    }

    renderTabs() {
        const { content, selectedContent } = this.props;
        const isDark = this.props.themeMode === 'dark';
        const tabTextColor = isDark ? '#eef0ff' : '#1e293b';
        const tabActiveColor = isDark ? '#818cf8' : '#4f46e5';
        const baseTabStyle = {
            display: 'flex',
            float: 'left',
            alignItems: 'center',
            padding: '8px 14px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
            transition: 'all 200ms ease',
            borderBottom: '2px solid transparent',
            color: tabTextColor,
        };
        const selectedTabStyle = {
            ...baseTabStyle,
            color: tabActiveColor,
            backgroundColor: isDark ? 'rgba(129, 140, 248, 0.06)' : 'rgba(79, 70, 229, 0.06)',
            borderBottomColor: tabActiveColor,
            fontWeight: 600,
        };
        const unselectedTabStyle = {
            ...baseTabStyle,
        };
        if (content.size > 0) {
            return content.map((tabContent, index) => {
                return (
                    <div
                        className="content-tab"
                        style={{ width: 'max-content', display: 'inline-block' }}
                        key={tabContent.id}
                        role="tab"
                        aria-selected={index === selectedContent ? 'true' : 'false'}
                        aria-controls="content-viewer-body"
                    >
                        <ContextMenuTrigger id={index.toString()}>
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
                            {tabContent.isFetching ? <LinearProgress className="progress-bar" style={{ width: '100%', height: '2px' }} /> : null}
                            {this.renderTabContextMenu(index)}
                        </ContextMenuTrigger>
                    </div>
                );
            });
        }
        return (
            <div style={{ padding: '12px 16px', color: 'inherit', fontWeight: 500, fontSize: '13px' }}>
                Content viewer
            </div>
        );
    }

    /* eslint-disable react/jsx-indent-props */
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
                    {isSubmittingJCL
                        ? <CircularProgressIcon
                            id="loading-icon"
                            size={20}
                    style={{ color: 'var(--text-primary)' }}
                        />
                        : <div>SUBMIT</div>}
                </Button>
            );
        }
        return null;
    }
    /* eslint-enable react/jsx-indent-props */

    renderSubheader() {
        return (
            <div style={{ height: '38px' }} role="tablist" aria-label="Open Job output files">
                { this.renderTabs() }
                { this.renderSubmitButton()}
            </div>
        );
    }

    render() {
        const { content, selectedContent } = this.props;
        const cardTextStyle = { paddingTop: '0', paddingBottom: '0' };
        const isDark = this.props.themeMode === 'dark';
        const headerStyle = {
            paddingBottom: 0,
            paddingTop: 0,
            whiteSpace: 'nowrap',
            overflowY: 'hidden',
            overflowX: 'auto',
            borderBottom: isDark ? '1px solid rgba(99, 102, 241, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
            background: isDark ? '#0f1022' : '#f1f5f9',
        };
        return (
            <Card
                id="content-viewer"
                className="card-component"
                style={{ marginBottom: 0 }}
            >
                <div
                    id="content-viewer-header"
                    style={headerStyle}
                >
                    {this.renderSubheader()}
                </div>
                <CardContent id="content-viewer-body" style={cardTextStyle} role="tabpanel">
                    <MonacoEditor
                        content={(content.get(selectedContent) && content.get(selectedContent).content) || ''}
                        readonly={content.get(selectedContent) ? content.get(selectedContent).readOnly : true}
                        theme={this.props.themeMode === 'light' ? 'zowe-light' : 'zowe-dark'}
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
    locationSearch: PropTypes.string,
    isSubmittingJCL: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    themeMode: PropTypes.string,
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

const ReduxConnectedContentViewer = connect(mapStateToProps)(ContentViewer);

// Wrapper to inject theme context into class component
const ConnectedContentViewer = (props) => {
    const { mode } = useThemeMode();
    return <ReduxConnectedContentViewer {...props} themeMode={mode} />;
};
export default ConnectedContentViewer;
