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
import { Map } from 'immutable';
import LabelIcon from 'material-ui/svg-icons/action/label';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { fetchJobFiles, toggleJob, purgeJob } from '../actions/jobNodes';
import JobFile from './JobFile';
import JobStep from './JobStep';


export default class JobInstance extends React.Component {
    handleJobToggle(job) {
        const { dispatch } = this.props;
        if (!job.get('isToggled') && !job.get('files').length > 0) {
            dispatch(fetchJobFiles(job.get('jobName'), job.get('jobId')));
        } else {
            dispatch(toggleJob(job.get('jobId')));
        }
    }

    handlePurge(job) {
        const { dispatch } = this.props;
        dispatch(purgeJob(job.get('jobName'), job.get('jobId')));
    }

    renderJobStatus() {
        const { job } = this.props;
        const statusStyleActive = { display: 'inline' };
        const statusStyleAbend = { color: 'red', display: 'inline' };
        const statusStyleComplete = { color: 'grey', display: 'inline' };
        if (job.get('returnCode')) {
            if (job.get('returnCode').toLowerCase().includes('abend') || job.get('returnCode').toLowerCase().includes('jcl error')) {
                return (<div style={statusStyleAbend}> [{job.get('returnCode')}]</div>);
            }
            if (job.get('returnCode').toLowerCase().includes('cc') || job.get('returnCode').toLowerCase().includes('canceled')) {
                return (<div style={statusStyleComplete}> [{job.get('returnCode')}]</div>);
            }
            return (<div style={statusStyleActive}> [{job.get('returnCode')}]</div>);
        } else if (job.get('status')) {
            return <div style={statusStyleActive}>[{job.get('status')}]</div>;
        }
        return null;
    }

    renderJobFiles() {
        const { job, dispatch } = this.props;
        return job.get('files').map(file => {
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
        return (
            <ContextMenu id={job.get('label')}>
                <MenuItem onClick={() => { this.handlePurge(job); }}>
                    Purge Job
                </MenuItem>
            </ContextMenu>
        );
    }

    render() {
        const { job } = this.props;

        return (
            <div className="job-instance">
                <li>
                    <ContextMenuTrigger id={job.get('label')}>
                        <span className="content-link" onClick={() => { this.handleJobToggle(job); }}>
                            <LabelIcon className="node-icon" />
                            <span className="job-label">
                                {job.get('label')}
                                {this.renderJobStatus()}
                            </span>
                        </span>
                    </ContextMenuTrigger>
                </li>
                <ul>
                    {job.get('isToggled') && this.renderJobFiles(job)}
                </ul>
                {this.renderJobInstanceMenu()}
            </div>);
    }
}

JobInstance.propTypes = {
    dispatch: PropTypes.func.isRequired,
    job: PropTypes.instanceOf(Map).isRequired,
};
