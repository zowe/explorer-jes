/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2018
 */

/* global fetch */
import { atlasFetch } from '../utilities/urlUtils';
import { constructAndPushMessage } from './snackbarNotifications';

export const TOGGLE_JOB = 'TOGGLE_JOB';

export const REQUEST_JOBS = 'REQUEST_JOBS';
export const RECEIVE_JOBS = 'RECEIVE_JOBS';
export const INVALIDATE_JOBS = 'INVALIDATE_JOBS';

export const REQUEST_JOB_FILES = 'REQUEST_JOB_FILES';
export const RECEIVE_JOB_FILES = 'RECEIVE_JOB_FILES';
export const INVALIDATE_JOB_FILES = 'INVALIDATE_JOB_FILES';

export const REQUEST_JOB_STEPS = 'REQUEST_JOB_STEPS';
export const RECEIVE_JOB_STEPS = 'RECEIVE_JOB_STEPS';
export const INVALIDATE_JOB_STEPS = 'INVALIDATE_JOB_STEPS';

export const REQUEST_PURGE_JOB = 'REQUEST_PURGE_JOB';
export const RECEIVE_PURGE_JOB = 'RECEIVE_PURGE_JOB';
export const INVALIDATE_PURGE_JOB = 'INVALIDATE_PURGE_JOB';

const FETCH_JOBS_FAIL_MESSAGE = 'Fetch failed for';
const FETCH_JOB_FILES_FAIL_MESSAGE = 'Fetch files failed for';
const PURGE_JOB_SUCCESS_MESSAGE = 'Purge request succeeded for';
const PURGE_JOB_FAIL_MESSAGE = 'Purge request failed for';

function requestJobs(filters) {
    return {
        type: REQUEST_JOBS,
        filters,
    };
}

function receiveJobs(jobs, autoExpandChildren) {
    return {
        type: RECEIVE_JOBS,
        jobs,
        autoExpandChildren,
    };
}

function invalidateJobs() {
    return {
        type: INVALIDATE_JOBS,
    };
}


export function toggleJob(jobId) {
    return {
        type: TOGGLE_JOB,
        jobId,
    };
}

function requestJobFiles(jobName, jobId) {
    return {
        type: REQUEST_JOB_FILES,
        jobName,
        jobId,
    };
}

function receiveJobFiles(jobName, jobId, jobFiles) {
    return {
        type: RECEIVE_JOB_FILES,
        jobName,
        jobId,
        jobFiles,
    };
}

function invalidateJobFiles(jobName, jobId) {
    return {
        type: INVALIDATE_JOB_FILES,
        jobName,
        jobId,
    };
}

function requestPurge(jobName, jobId) {
    return {
        type: REQUEST_PURGE_JOB,
        jobName,
        jobId,
    };
}

function receivePurge(jobName, jobId) {
    return {
        type: RECEIVE_PURGE_JOB,
        jobName,
        jobId,
    };
}

function invalidatePurge(jobName, jobId) {
    return {
        type: INVALIDATE_PURGE_JOB,
        jobName,
        jobId,
    };
}

function getURIQuerry(filters) {
    let query = `?owner=${filters.owner ? filters.owner : '*'}&prefix=${filters.prefix ? filters.prefix : '*'}`;

    if (filters.status && filters.status !== '*') {
        query += `&status=${filters.status}`;
    }
    return query;
}

export function fetchJobs(filters) {
    return dispatch => {
        dispatch(requestJobs(filters));
        return atlasFetch(`jobs${getURIQuerry(filters)}`, { credentials: 'include' })
            .then(response => { return response.json(); })
            .then(json => {
                const autoExpandChildren = ('jobId' in filters && filters.jobId !== '*');
                dispatch(receiveJobs(json, autoExpandChildren));
            })
            .catch(() => {
                dispatch(constructAndPushMessage(FETCH_JOBS_FAIL_MESSAGE));
                dispatch(invalidateJobs());
            });
    };
}

export function fetchJobFilesAndSteps(jobName, jobId) {
    return dispatch => {
        dispatch(requestJobFiles(jobName, jobId));
        dispatch(toggleJob(jobId));
        return atlasFetch(`jobs/${jobName}/ids/${jobId}/files`, { credentials: 'include' })
            .then(response => { return response.json(); })
            .then(json => {
                dispatch(receiveJobFiles(jobName, jobId, json));
            })
            .catch(() => {
                dispatch(constructAndPushMessage(`${FETCH_JOB_FILES_FAIL_MESSAGE} ${jobName}:${jobId}`));
                dispatch(invalidateJobFiles(jobName, jobId));
            });
        // .then(() => {
        //     return atlasFetch(`jobs/${jobName}/ids/${jobId}/steps`, { credentials: 'include' })
        //         .then(response => { return response.json(); })
        //         .then(json => {
        //             dispatch(receiveJobSteps(jobName, jobId, json));
        //         });
        // });
    };
}

export function purgeJob(jobName, jobId) {
    return dispatch => {
        dispatch(requestPurge(jobName, jobId));
        return atlasFetch(`${jobName}/${jobId}`,
            {
                credentials: 'include',
                method: 'DELETE',
            },
        ).then(response => {
            if (response.ok) {
                return response.text();
            }
            throw Error(response.statusText);
        }).then(() => {
            dispatch(constructAndPushMessage(`${PURGE_JOB_SUCCESS_MESSAGE} ${jobName}/${jobId}`));
            return dispatch(receivePurge(jobName, jobId));
        }).catch(() => {
            dispatch(constructAndPushMessage(`${PURGE_JOB_FAIL_MESSAGE} ${jobName}/${jobId}`));
            dispatch(invalidatePurge(jobName, jobId));
        });
    };
}
