/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2019, 2020
 */

import PropTypes from 'prop-types';
import React from 'react';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import WorkOutlineIcon from '@material-ui/icons/WorkOutline';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { hideMenu } from 'react-contextmenu/modules/actions';
import { fetchJobFiles, toggleJob, invertJobSelectStatus, unselectAllJobs, cancelJob, purgeJob, purgeJobs, getSelectedJobs, unselectAllJobFiles, highlightSelected } from '../actions/jobNodes';
import { getJCL, getFileLabel, changeSelectedContent, fetchConcatenatedJobFiles, downloadAllJobFiles, downloadFile } from '../actions/content';
import JobFile from './JobFile';
import { encodeURLComponent } from '../utilities/urlUtils';

class JobInstance extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            singleClickTimeout: 0,
            preventSingleClick: false,
            keyEnterCount: 0,
            menuShortCuts: true,
            menuVisible: false,
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.checkForExpand = this.checkForExpand.bind(this);
        setTimeout(this.checkForExpand, 1500); // Give time for UI code to render before toggling expand
    }

    checkForExpand() {
        const { expand, pos } = this.props;
        if (typeof (expand) === 'boolean' && expand && pos === 0) {
            this.handleJobToggle();
        }
    }

    handleSingleClick(e) {
        const { dispatch } = this.props;
        if (e && (e.metaKey || e.ctrlKey)) {
            this.handleSelectChange();
        } else {
            dispatch(unselectAllJobs());
            dispatch(unselectAllJobFiles());
            this.handleSelectChange();
            this.state.singleClickTimeout = setTimeout(() => {
                if (!this.state.preventSingleClick) {
                    this.handleJobToggle();
                }
                this.setState({ preventSingleClick: false });
                this.setState({ keyEnterCount: 0 });
            }, 500);
        }
    }

    hideContextMenu() {
        hideMenu();
        this.setState({ menuVisible: false });
    }

    handleContextMenu() {
        const { dispatch, job } = this.props;
        if (job.get('selectionType') !== 'selected') {
            dispatch(highlightSelected());
        }
    }
    
    handleKeyDown(e) {
        const { job } = this.props;
        const shortCuts = ['o', 'j', 'c', 'delete', 'r', 'd'];
        if (e.metaKey || e.altKey || e.ctrlKey) {
            return;
        }
        if (e.key === 'Enter' && this.state.menuVisible === false) {
            this.setState({ keyEnterCount: 1 });

            if (this.state.keyEnterCount === 0) {
                // single click on single enter
                this.handleSingleClick();
            } else {
                // double click action - on quick multiple presses
                this.handleOpenAllFiles(job);
            }
        }
        if (this.state.menuShortCuts && this.state.menuVisible) {
            switch (e.key.toLowerCase()) {
                case 'o':
                    this.handleOpenAllFiles(job);
                    break;
                case 'j':
                    this.handleGetJCL(job);
                    break;
                case 'c':
                    this.handleCancel(job);
                    break;
                case 'delete':
                    this.handlePurge(job);
                    break;
                case 'r':
                    this.refreshFile();
                    break;
                case 'd':
                    this.handleDownloadJCL();
                    break;
                case 'a':
                    this.handleDownloadALlFiles();
                    break;
                default:
                    break;
            }
            if (shortCuts.includes(e.key.toLowerCase())) {
                this.hideContextMenu();
            }
        }
    }

    handleSelectChange() {
        const { dispatch, job } = this.props;
        dispatch(invertJobSelectStatus(job.get('jobId')));
    }

    handleJobToggle() {
        const { dispatch, job } = this.props;
        if (!job.get('isToggled') && !job.get('files').length > 0) {
            dispatch(fetchJobFiles(job.get('jobName'), job.get('jobId')));
        } else {
            dispatch(toggleJob(job.get('jobId')));
        }
    }

    isFileOpen(fileLabel) {
        const { content } = this.props;
        return content.filter(x => { return x.label === fileLabel; }).size > 0;
    }

    findAndSwitchToContent(fileLabel) {
        const { content, dispatch } = this.props;
        content.forEach(x => {
            if (x.label === fileLabel) {
                dispatch(changeSelectedContent(content.indexOf(x)));
            }
        });
    }

    handleOpenAllFiles() {
        const { job, dispatch } = this.props;
        const fileLabel = getFileLabel(job.get('jobName'), job.get('jobId'));
        // Reset the debounce handling
        clearTimeout(this.state.singleClickTimeout);
        this.setState({ preventSingleClick: true });
        this.setState({ keyEnterCount: 0 });
        if (this.isFileOpen(fileLabel)) {
            this.findAndSwitchToContent(fileLabel);
        } else {
            dispatch(fetchConcatenatedJobFiles(job.get('jobName'), job.get('jobId')));
        }
    }

    refreshFile() {
        const { dispatch, job } = this.props;
        dispatch(fetchConcatenatedJobFiles(job.get('jobName'), job.get('jobId'), true));
    }

    handlePurge() {
        const { dispatch, job, jobs } = this.props;
        // If more than one jobs are selected
        if (getSelectedJobs(jobs).size && getSelectedJobs(jobs).size !== 1) {
            return dispatch(purgeJobs(jobs));
        }
        return dispatch(purgeJob(job.get('jobName'), job.get('jobId')));
    }

    handleCancel() {
        const { dispatch, job } = this.props;
        dispatch(cancelJob(job.get('jobName'), job.get('jobId')));
    }

    handleGetJCL() {
        const { dispatch, job } = this.props;
        const fileLabel = getFileLabel(job.get('jobId'), 'JCL');
        if (this.isFileOpen(fileLabel)) {
            this.findAndSwitchToContent(fileLabel);
        } else {
            dispatch(getJCL(job.get('jobName'), job.get('jobId')));
        }
    }

    handleDownloadJCL() {
        const { dispatch, job } = this.props;
        const url = `zosmf/restjobs/jobs/${encodeURLComponent(job.get('jobName'))}/${job.get('jobId')}/files/JCL/records`;
        downloadFile(job, 'JCL', url, dispatch);
    }

    handleDownloadALlFiles() {
        const { job, dispatch } = this.props;
        dispatch(downloadAllJobFiles(job.get('jobName'), job.get('jobId')));
    }

    renderJobStatus() {
        const { job } = this.props;
        const errorReturnCodes = ['abend', 'jcl error', 'sys fail', 'conv error', 'sec error'];
        const completeReturnCodes = ['cc', 'canceled'];
        const jobStatus = job.get('status');
        if (jobStatus) {
            if (jobStatus.toLowerCase().includes('output')) {
                const jobReturnCode = job.get('returnCode');
                if (jobReturnCode) {
                    const lowerCaseJobReturnCode = jobReturnCode.toLowerCase();
                    if (errorReturnCodes.find(errorReturnCode => { return lowerCaseJobReturnCode.includes(errorReturnCode); })) {
                        return (
                            <span className="job-status job-status--error">
                                <span className="job-status-dot" />
                                {jobReturnCode}
                            </span>
                        );
                    }
                    if (completeReturnCodes.find(completeReturnCode => { return lowerCaseJobReturnCode.includes(completeReturnCode); })) {
                        return (
                            <span className="job-status job-status--complete">
                                <span className="job-status-dot" />
                                {jobReturnCode}
                            </span>
                        );
                    }
                    return (
                        <span className="job-status job-status--complete">
                            <span className="job-status-dot" />
                            {jobReturnCode}
                        </span>
                    );
                }
                return (
                    <span className="job-status job-status--complete">
                        <span className="job-status-dot" />
                        {jobStatus}
                    </span>
                );
            }
            return (
                <span className="job-status job-status--active">
                    <span className="job-status-dot" />
                    {jobStatus}
                </span>
            );
        }
        return null;
    }

    renderJobFiles() {
        const { job, dispatch, showDD } = this.props;
        const files = job.get('files');
        return files.map(file => {
            return (<JobFile
                key={file.id}
                job={job}
                showDD={showDD}
                dispatch={dispatch}
                file={file}
            />);
        });
    }

    renderJobInstanceMenu() {
        const { job } = this.props;
        const menuItems = [
            <MenuItem key="open" onClick={() => { this.handleOpenAllFiles(job); }}>
                Open
            </MenuItem>,
            <MenuItem key="purge" onClick={() => { this.handlePurge(job); }}>
                Purge
            </MenuItem>,
            <MenuItem key="getJCL" onClick={() => { this.handleGetJCL(job); }}>
                Get JCL
            </MenuItem>,
            <MenuItem key="downloadJCL" onClick={() => { this.handleDownloadJCL(); }}>
                Download JCL
            </MenuItem>,
            <MenuItem key="downloadAllFiles" onClick={() => { this.handleDownloadALlFiles(); }}>
                Download All Files
            </MenuItem>,
        ];
        if (job.get('status').toLowerCase() === 'active') {
            menuItems.splice(
                1,
                0,
                <MenuItem key="cancel" onClick={() => { this.handleCancel(job); }}>
                    Cancel Job
                </MenuItem>,
            );
        }
        const fileLabel = getFileLabel(job.get('jobName'), job.get('jobId'));
        if (this.isFileOpen(fileLabel)) {
            menuItems.push(
                <MenuItem onClick={() => { return this.refreshFile(); }} key="refresh">
                    Refresh Content
                </MenuItem>,
            );
        }
        return (
            <ContextMenu
                id={job.get('label')}
                onShow={() => { this.setState({ menuVisible: true }); }}
                onHide={() => { this.setState({ menuVisible: false }); }}
            >
                {menuItems}
            </ContextMenu>
        );
    }

    render() {
        const { job } = this.props;
        const isToggled = job.get('isToggled');

        return (
            <div
                className="job-instance"
                role="none"
            >
                <li role="none">
                    <ContextMenuTrigger id={job.get('label')}>
                        <span
                            className="content-link job-row"
                            onClick={e => { this.handleSingleClick(e); }}
                            onContextMenu={e => { this.handleContextMenu(e); }}
                            onDoubleClick={() => { this.handleOpenAllFiles(); }}
                            tabIndex="0"
                            onKeyDown={this.handleKeyDown}
                            role="treeitem"
                            aria-expanded={isToggled.toString()}
                            aria-level="1"
                            aria-haspopup={true}
                            style={this.state.menuVisible ? { background: 'rgba(99, 102, 241, 0.1)' }
                                : job.get('selectionType') === 'selected' ? { background: 'rgba(99, 102, 241, 0.1)' }
                                    : job.get('selectionType') === 'highlighted' ? { background: 'rgba(99, 102, 241, 0.05)' }
                                        : null}
                        >
                            <span className="job-chevron">
                                {isToggled
                                    ? <ExpandMoreIcon className="chevron-icon" />
                                    : <ChevronRightIcon className="chevron-icon" />
                                }
                            </span>
                            <WorkOutlineIcon className="job-icon" />
                            <span className="job-label">
                                {job.get('label')}
                            </span>
                            {this.renderJobStatus()}
                        </span>
                    </ContextMenuTrigger>
                    {isToggled && (
                        <ul
                            role="group"
                            className="job-files-list"
                        >
                            {this.renderJobFiles(job)}
                        </ul>
                    )}
                </li>
                {this.renderJobInstanceMenu()}
            </div>
        );
    }
}

JobInstance.propTypes = {
    dispatch: PropTypes.func.isRequired,
    showDD: PropTypes.string,
    expand: PropTypes.bool,
    pos: PropTypes.number,
    job: PropTypes.instanceOf(Map).isRequired,
    jobs: PropTypes.instanceOf(List).isRequired,
    content: PropTypes.instanceOf(List),
};

function mapStateToProps(state) {
    const contentRoot = state.get('content');
    const filtersRoot = state.get('filters');
    const jobs = state.get('jobNodes');
    return {
        content: contentRoot.get('content'),
        jobs: jobs.get('jobs'),
        showDD: filtersRoot.get('showDD'),
    };
}

const ConnectedJobInstance = connect(mapStateToProps)(JobInstance);
export default ConnectedJobInstance;
