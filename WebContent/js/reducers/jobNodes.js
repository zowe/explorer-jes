/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2019
 */

import { Map, List } from 'immutable';

import {
    REQUEST_JOBS,
    RECEIVE_JOBS,
    RECEIVE_SINGLE_JOB,
    TOGGLE_JOB,
    REQUEST_JOB_FILES,
    RECEIVE_JOB_FILES,
    INVALIDATE_JOBS,
    STOP_REFRESH_ICON,
} from '../actions/jobNodes';

/**
jobs: [
    {
        jobName: MYJOB,
        jobID: JOB1234,
        label: MYJOB:JOB1234,
        files: [
            {
                label: JESMSG,
                id: 102,
            },
        ]
        steps: [
            {
                label: TODODODODO
            },
        ]
    }
]
*/

const INITIAL_STATE = Map({
    jobs: List(),
    isFetching: false,
});

function extractJobs(jobs) {
    return jobs.map(job => {
        return {
            jobName: job.jobName,
            jobId: job.jobId,
            label: `${job.jobName}:${job.jobId}`,
            returnCode: job.returnCode,
            status: job.status,
            isToggled: false,
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

function extractJobFiles(jobFiles) {
    return jobFiles.map(file => {
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
