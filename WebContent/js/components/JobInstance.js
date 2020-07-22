/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2019
 */

import PropTypes from 'prop-types';
import React from 'react';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import LabelIcon from '@material-ui/icons/Label';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { fetchJobFiles, toggleJob, invertJobSelectStatus, unselectAllJobs, cancelJob, purgeJob, purgeJobs } from '../actions/jobNodes';
import { getJCL, getFileLabel, changeSelectedContent, fetchConcatenatedJobFiles } from '../actions/content';
import JobFile from './JobFile';
import JobStep from './JobStep';


class JobInstance extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            singleClickTimeout: 0,
            preventSingleClick: false,
            keyEnterCount: 0,
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    handleSingleClick(e) {
        const { dispatch } = this.props;
        if (e && e.metaKey) {
            this.handleSelectChange();
        } else {
            dispatch(unselectAllJobs());
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

    handleKeyDown(e) {
        const { job } = this.props;
        if (e.key === 'Enter') {
            this.setState({ keyEnterCount: 1 });

            if (this.state.keyEnterCount === 0) {
                // single click on single enter
                this.handleSingleClick();
            } else {
                // double click action - on quick multiple presses
                this.handleOpenAllFiles(job);
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

    findAndSwitchToContent(job, fileLabel) {
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
            this.findAndSwitchToContent(job, fileLabel);
        } else {
            dispatch(fetchConcatenatedJobFiles(job.get('jobName'), job.get('jobId')));
        }
    }

    handlePurge() {
        const { dispatch, job, jobs } = this.props;
        // If only one job is selected
        if (!job.get('isSelected')) {
            return dispatch(purgeJob(job.get('jobName'), job.get('jobId')));
        }
        return dispatch(purgeJobs(jobs));
    }

    handleCancel(job) {
        const { dispatch } = this.props;
        dispatch(cancelJob(job.get('jobName'), job.get('jobId')));
    }

    handleGetJCL(job) {
        const { dispatch } = this.props;
        const fileLabel = getFileLabel(job.get('jobId'), 'JCL');
        if (this.isFileOpen(fileLabel)) {
            this.findAndSwitchToContent(job, fileLabel);
        } else {
            dispatch(getJCL(job.get('jobName'), job.get('jobId')));
        }
    }

    renderJobStatus() {
        const { job } = this.props;
        const statusStyleActive = { display: 'inline' };
        const statusStyleAbend = { color: 'red', display: 'inline' };
        const statusStyleComplete = { color: 'grey', display: 'inline' };
        const errorReturnCodes = ['abend', 'jcl error', 'sys fail', 'conv error', 'sec error'];
        const completeReturnCodes = ['cc', 'canceled'];
        const jobStatus = job.get('status');
        if (jobStatus) {
            if (jobStatus.toLowerCase().includes('output')) {
                const jobReturnCode = job.get('returnCode');
                if (jobReturnCode) {
                    const lowerCaseJobReturnCode = jobReturnCode.toLowerCase();
                    if (errorReturnCodes.find(errorReturnCode => { return lowerCaseJobReturnCode.includes(errorReturnCode); })) {
                        return (<div style={statusStyleAbend}> [{jobReturnCode}]</div>);
                    }
                    if (completeReturnCodes.find(completeReturnCode => { return lowerCaseJobReturnCode.includes(completeReturnCode); })) {
                        return (<div style={statusStyleComplete}> [{jobReturnCode}]</div>);
                    }
                    return (<div style={statusStyleComplete}> [{jobReturnCode}]</div>);
                }
                return (<div style={statusStyleComplete}> [{jobStatus}]</div>);
            }
            return <div style={statusStyleActive}> [{jobStatus}]</div>;
        }
        return <div style={statusStyleActive}> []</div>;
    }

    renderJobFiles() {
        const { job, dispatch } = this.props;
        const files = job.get('files');
        return files.map(file => {
            return (<JobFile key={file.id} job={job} dispatch={dispatch} file={file} />);
        });
    }

    renderJobSteps() {
        const { job } = this.props;
        return job.get('steps').map(step => {
            return (<JobStep key={step.id} step={step} />);
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
                Get JCL (SJ)
            </MenuItem>,
        ];
        if (job.get('status').toLowerCase() === 'active') {
            menuItems.splice(1, 0,
                <MenuItem key="cancel" onClick={() => { this.handleCancel(job); }}>
                    Cancel Job
                </MenuItem>);
        }
        return (
            <ContextMenu id={job.get('label')} style={{ zIndex: '100' }}>
                {menuItems}
            </ContextMenu>
        );
    }

    render() {
        const { job } = this.props;

        return (
            <div
                className="job-instance"
                role="none"
                style={job.get('isSelected') ? { background: '#dedede' } : null}
            >
                <li role="none">
                    <ContextMenuTrigger id={job.get('label')}>
                        <span
                            className="content-link"
                            onClick={e => { this.handleSingleClick(e); }}
                            onDoubleClick={() => { this.handleOpenAllFiles(); }}
                            tabIndex="0"
                            onKeyDown={this.handleKeyDown}
                            role="treeitem"
                            aria-expanded={job.get('isToggled').toString()}
                            aria-level="1"
                            aria-haspopup={true}
                        >
                            <LabelIcon className="node-icon" />
                            <span className="job-label">
                                {job.get('label')}
                                {this.renderJobStatus()}
                            </span>
                        </span>
                    </ContextMenuTrigger>
                    <ul role="group">
                        {job.get('isToggled') && this.renderJobFiles(job)}
                    </ul>
                </li>
                {this.renderJobInstanceMenu()}
            </div>);
    }
}

JobInstance.propTypes = {
    dispatch: PropTypes.func.isRequired,
    job: PropTypes.instanceOf(Map).isRequired,
    jobs: PropTypes.instanceOf(List).isRequired,
    content: PropTypes.instanceOf(List),
};

function mapStateToProps(state) {
    const contentRoot = state.get('content');
    const jobs = state.get('jobNodes');
    return {
        content: contentRoot.get('content'),
        jobs: jobs.get('jobs'),
    };
}

const ConnectedJobInstance = connect(mapStateToProps)(JobInstance);
export default ConnectedJobInstance;
