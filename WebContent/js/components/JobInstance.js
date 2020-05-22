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
import { fetchJobFiles, toggleJob, purgeJob } from '../actions/jobNodes';
import { getJCL, getFileLabel, changeSelectedContent, fetchConcatenatedJobFiles } from '../actions/content';
import JobFile from './JobFile';
import JobStep from './JobStep';


class JobInstance extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            singleClickTimeout: 0,
            preventSingleClick: false,
            keyEnter: 0,
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    handleSingleClick(job) {
        this.state.singleClickTimeout = setTimeout(() => {
            if (!this.state.preventSingleClick) {
                this.handleJobToggle(job);
            }
            this.setState({ preventSingleClick: false });
            this.setState({ keyEnter: 0 });
        }, 500);
    }

    handleKeyDown(e) {
        const { job } = this.props;
        if (e.key === 'Enter') {
            this.setState({ keyEnter: 1 });
            if (this.state.keyEnter === 0) {
                this.handleSingleClick(job);
            } else {
                this.handleOpenAllFiles(job);
            }
        }
    }

    handleJobToggle(job) {
        const { dispatch } = this.props;
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

    handleOpenAllFiles(job) {
        const { dispatch } = this.props;
        const fileLabel = getFileLabel(job.get('jobName'), job.get('jobId'));
        // Reset the debounce handling
        clearTimeout(this.state.singleClickTimeout);
        this.setState({ preventSingleClick: true });
        this.setState({ keyEnter: 0 });
        if (this.isFileOpen(fileLabel)) {
            this.findAndSwitchToContent(job, fileLabel);
        } else {
            dispatch(fetchConcatenatedJobFiles(job.get('jobName'), job.get('jobId')));
        }
    }

    handlePurge(job) {
        const { dispatch } = this.props;
        dispatch(purgeJob(job.get('jobName'), job.get('jobId')));
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
        return files.map((file, index) => {
            return (<JobFile key={file.id} job={job} dispatch={dispatch} file={file} pos={index} size={files.size} />);
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
        return (
            <ContextMenu id={job.get('label')}>
                <MenuItem onClick={() => { this.handleOpenAllFiles(job); }}>
                    Open
                </MenuItem>
                <MenuItem onClick={() => { this.handlePurge(job); }}>
                    Purge Job
                </MenuItem>
                <MenuItem onClick={() => { this.handleGetJCL(job); }}>
                    Get JCL (SJ)
                </MenuItem>
            </ContextMenu>
        );
    }

    render() {
        const { job, pos, size } = this.props;

        return (
            <div className="job-instance" role="none">
                <li role="none">
                    <ContextMenuTrigger id={job.get('label')}>
                        <span
                            className="content-link"
                            onClick={() => { this.handleSingleClick(job); }}
                            onDoubleClick={() => { this.handleOpenAllFiles(job); }}
                            tabIndex="0"
                            onKeyDown={this.handleKeyDown}
                            role="treeitem"
                            aria-expanded={job.get('isToggled').toString()}
                            aria-level="1"
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
    size: PropTypes.number.isRequired,
    pos: PropTypes.number.isRequired,
    content: PropTypes.instanceOf(List),
};

function mapStateToProps(state) {
    const contentRoot = state.get('content');
    return {
        content: contentRoot.get('content'),
    };
}

const ConnectedJobInstance = connect(mapStateToProps)(JobInstance);
export default ConnectedJobInstance;
