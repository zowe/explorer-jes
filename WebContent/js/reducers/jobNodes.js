/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2019, 2020
 */

import { Map, List } from 'immutable';

import {
    REQUEST_JOBS,
    RECEIVE_JOBS,
    RECEIVE_SINGLE_JOB,
    TOGGLE_JOB,
    INVERT_JOB_SELECT_STATUS,
    UNSELECT_ALL_JOBS,
    UNSELECT_ALL_JOBS_FILES,
    SELECT_FILE,
    REQUEST_JOB_FILES,
    RECEIVE_JOB_FILES,
    RECEIVE_PURGE_JOB,
    RECEIVE_CANCEL_JOB,
    INVALIDATE_JOBS,
    STOP_REFRESH_ICON,
} from '../actions/jobNodes';

const INITIAL_STATE = Map({
    jobs: List(),
    isFetching: false,
});

function extractJobs(jobs) {
    return jobs.map(job => {
        return {
            jobName: job.jobname,
            jobId: job.jobid,
            label: `${job.jobname}:${job.jobid}`,
            returnCode: job.retcode,
            status: job.status,
            isToggled: false,
            isSelected: false,
            files: List(),
        };
    });
}

function extractJob(job) {
    return List([
        Map({
            jobName: job.jobname,
            jobId: job.jobid,
            label: `${job.jobname}:${job.jobid}`,
            returnCode: job.retcode,
            status: job.status,
            isToggled: false,
            isSelected: false,
            files: List(),
        }),
    ]);
}

function findKeyOfJob(jobs, jobId) {
    return jobs.findKey(job => {
        return job.get('jobId') === jobId;
    });
}

function toggleJob(jobs, jobId) {
    const jobKey = findKeyOfJob(jobs, jobId);
    return jobs.get(jobKey).set('isToggled', !jobs.get(jobKey).get('isToggled'));
}

function invertJobSelectStatus(jobs, jobId) {
    const jobKey = findKeyOfJob(jobs, jobId);
    return jobs.get(jobKey).set('isSelected', !jobs.get(jobKey).get('isSelected'));
}

function unselectAllJobs(jobs) {
    return jobs.map(job => {
        return job.set('isSelected', false);
    });
}

function unselectAllJobFiles(jobs) {
    return jobs.map(job => {
        if (job.get('files')) {
            job.set('files', job.get('files').forEach(jobFile => {
                const file = jobFile;
                file.isSelected = false;
            }));
        }
        return job;
    });
}

function selectFile(jobs, jobId, label) {
    return jobs.map(job => {
        if (job.get('files') && job.get('jobId') === jobId) {
            job.set('files', job.get('files').forEach(jobFile => {
                const file = jobFile;
                if (file.label === label) {
                    file.isSelected = true;
                }
            }));
        }
        return job;
    });
}

function extractJobFiles(jobFiles) {
    return jobFiles.map(file => {
        return {
            label: file.ddname,
            id: file.id,
            isSelected: false,
        };
    });
}

function createJobWithFiles(jobs, jobId, jobFiles) {
    return jobs.get(findKeyOfJob(jobs, jobId)).set('files', extractJobFiles(jobFiles));
}

export default function JobNodes(state = INITIAL_STATE, action) {
    switch (action.type) {
        case REQUEST_JOBS:
            return state.set('isFetching', true);
        case RECEIVE_JOBS:
            return state.merge({ jobs: extractJobs(action.jobs), isFetching: false });
        case RECEIVE_SINGLE_JOB:
            return state.merge({ jobs: extractJob(action.job), isFetching: false });
        case INVALIDATE_JOBS:
            return state.merge({ isFetching: false, jobs: List() });
        case TOGGLE_JOB:
            return state.merge({
                jobs: state.get('jobs').set(findKeyOfJob(state.get('jobs'), action.jobId), toggleJob(state.get('jobs'), action.jobId)),
            });
        case INVERT_JOB_SELECT_STATUS:
            return state.merge({
                jobs: state.get('jobs').set(findKeyOfJob(state.get('jobs'), action.jobId), invertJobSelectStatus(state.get('jobs'), action.jobId)),
            });
        case UNSELECT_ALL_JOBS:
            return state.merge({
                jobs: unselectAllJobs(state.get('jobs')),
            });
        case UNSELECT_ALL_JOBS_FILES:
            return state.merge({
                jobs: unselectAllJobFiles(state.get('jobs')),
            });
        case SELECT_FILE:
            return state.merge({
                jobs: selectFile(state.get('jobs'), action.jobId, action.label),
            });
        case REQUEST_JOB_FILES:
            return state.set('isFetching', true);
        case RECEIVE_JOB_FILES:
            return state.merge({
                jobs: state.get('jobs').set(findKeyOfJob(state.get('jobs'), action.jobId), createJobWithFiles(state.get('jobs'), action.jobId, action.jobFiles)),
            });
        case STOP_REFRESH_ICON:
            return state.set('isFetching', false);
        case RECEIVE_PURGE_JOB: {
            const jobs = state.get('jobs');
            return state.merge({
                jobs: jobs.remove(findKeyOfJob(jobs, action.jobId)),
            });
        }
        case RECEIVE_CANCEL_JOB: {
            const jobs = state.get('jobs');
            const jobKey = findKeyOfJob(jobs, action.jobId);
            return state.merge({
                jobs: jobs.set(jobKey, jobs.get(jobKey).set('status', 'CANCELED')),
            });
        }
        default:
            return state;
    }
}
