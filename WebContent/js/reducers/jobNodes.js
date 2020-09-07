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
    REQUEST_JOB_FILES,
    RECEIVE_JOB_FILES,
    INVALIDATE_JOBS,
    STOP_REFRESH_ICON,
} from '../actions/jobNodes';

const INITIAL_STATE = Map({
    jobs: List(),
    isFetching: false,
    controller: null,
});

function extractJobs(jobs) {
    return jobs.items.map(job => {
        return {
            jobName: job.jobName,
            jobId: job.jobId,
            label: `${job.jobName}:${job.jobId}`,
            returnCode: job.returnCode,
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
            jobName: job.jobName,
            jobId: job.jobId,
            label: `${job.jobName}:${job.jobId}`,
            returnCode: job.returnCode,
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

function extractJobFiles(jobFiles) {
    return jobFiles.items.map(file => {
        return {
            label: file.ddName,
            id: file.id,
        };
    });
}

function createJobWithFiles(jobs, jobId, jobFiles) {
    return jobs.get(findKeyOfJob(jobs, jobId)).set('files', extractJobFiles(jobFiles));
}

export default function JobNodes(state = INITIAL_STATE, action) {
    switch (action.type) {
        case REQUEST_JOBS:
            if (state.get('isFetching') && state.get('controller') != null) {
                state.get('controller').abort();
            }
            return state.merge({ isFetching: true, controller: action.controller });
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
        case REQUEST_JOB_FILES:
            return state.set('isFetching', true);
        case RECEIVE_JOB_FILES:
            return state.merge({
                jobs: state.get('jobs').set(findKeyOfJob(state.get('jobs'), action.jobId), createJobWithFiles(state.get('jobs'), action.jobId, action.jobFiles)),
            });
        case STOP_REFRESH_ICON:
            return state.set('isFetching', false);
        default:
            return state;
    }
}
