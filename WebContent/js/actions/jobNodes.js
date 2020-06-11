/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2020
 */

import { atlasFetch } from '../utilities/urlUtils';
import { constructAndPushMessage } from './snackbarNotifications';
import { checkForValidationFailure } from './validation';

export const TOGGLE_JOB = 'TOGGLE_JOB';

export const REQUEST_JOBS = 'REQUEST_JOBS';
export const RECEIVE_JOBS = 'RECEIVE_JOBS';
export const RECEIVE_SINGLE_JOB = 'RECEIVE_SINGLE_JOB';
export const INVALIDATE_JOBS = 'INVALIDATE_JOBS';

export const REQUEST_JOB_FILES = 'REQUEST_JOB_FILES';
export const RECEIVE_JOB_FILES = 'RECEIVE_JOB_FILES';
export const INVALIDATE_JOB_FILES = 'INVALIDATE_JOB_FILES';
export const STOP_REFRESH_ICON = 'STOP_REFRESH_ICON';

export const REQUEST_CANCEL_JOB = 'REQUEST_CANCEL_JOB';
export const RECEIVE_CANCEL_JOB = 'RECEIVE_CANCEL_JOB';
export const INVALIDATE_CANCEL_JOB = 'INVALIDATE_CANCEL_JOB';
export const REQUEST_PURGE_JOB = 'REQUEST_PURGE_JOB';
export const RECEIVE_PURGE_JOB = 'RECEIVE_PURGE_JOB';
export const INVALIDATE_PURGE_JOB = 'INVALIDATE_PURGE_JOB';

const NO_JOBS_FOUND_MESSAGE = 'No Jobs found for filter parameters';
const CANCEL_JOB_SUCCESS_MESSAGE = 'Cancel request succeeded for';
const CANCEL_JOB_FAIL_MESSAGE = 'Cancel request failed for';
const PURGE_JOB_SUCCESS_MESSAGE = 'Purge request succeeded for';
const PURGE_JOB_FAIL_MESSAGE = 'Purge request failed for';

function requestJobs(filters) {
    return {
        type: REQUEST_JOBS,
        filters,
    };
}

function receiveJobs(jobs) {
    return {
        type: RECEIVE_JOBS,
        jobs,
    };
}

function receiveSingleJob(job) {
    return {
        type: RECEIVE_SINGLE_JOB,
        job,
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

function stopRefreshIcon() {
    return {
        type: STOP_REFRESH_ICON,
    };
}

function requestCancel(jobName, jobId) {
    return {
        type: REQUEST_CANCEL_JOB,
        jobName,
        jobId,
    };
}

function receiveCancel(jobName, jobId) {
    return {
        type: RECEIVE_CANCEL_JOB,
        jobName,
        jobId,
    };
}

function invalidateCancel(jobName, jobId) {
    return {
        type: INVALIDATE_CANCEL_JOB,
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

function getURIQuery(filters) {
    let query = `?owner=${filters.owner ? filters.owner : '*'}&prefix=${filters.prefix ? filters.prefix : '*'}`;

    if (filters.status && filters.status !== '*') {
        query += `&status=${filters.status}`;
    }
    return query;
}

function filterByJobId(json, jobId, dispatch) {
    // filter for job Id as api doesn't support
    let jobFound = false;
    json.items.forEach(job => {
        if (job.jobId === jobId) {
            jobFound = true;
            dispatch(receiveSingleJob(job));
        }
    });
    if (!jobFound) {
        dispatch(invalidateJobs());
    }
}

export function fetchJobs(filters) {
    return dispatch => {
        dispatch(requestJobs(filters));
        return atlasFetch(`jobs${getURIQuery(filters)}`, { credentials: 'include' })
            .then(response => {
                return dispatch(checkForValidationFailure(response));
            })
            .then(response => { return response.json(); })
            .then(json => {
                if (json.items && json.items.constructor === Array) {
                    if (json.items.length > 0) {
                        if ('jobId' in filters && filters.jobId !== '*') {
                            filterByJobId(json, filters.jobId, dispatch);
                        } else {
                            dispatch(receiveJobs(json));
                        }
                    } else {
                        throw Error(NO_JOBS_FOUND_MESSAGE);
                    }
                } else if (json.message) {
                    throw Error(json.message);
                }
            })
            .catch(e => {
                dispatch(constructAndPushMessage(e.message));
                dispatch(invalidateJobs());
            });
    };
}

function getJobFiles(jobName, jobId) {
    return dispatch => {
        return atlasFetch(`jobs/${jobName}/${jobId}/files`, { credentials: 'include' })
            .then(response => {
                return dispatch(checkForValidationFailure(response));
            })
            .then(response => { return response.json(); })
            .then(json => {
                if (json.items && json.items.constructor === Array) {
                    return dispatch(receiveJobFiles(jobName, jobId, json));
                }
                throw Error(json.message);
            })
            .catch(e => {
                return dispatch(constructAndPushMessage(e.message));
            });
    };
}

function issueFetchFiles(jobName, jobId) {
    return dispatch => {
        return dispatch(getJobFiles(jobName, jobId)).then(() => {
            return dispatch(stopRefreshIcon());
        });
    };
}

export function fetchJobFiles(jobName, jobId) {
    return dispatch => {
        dispatch(requestJobFiles(jobName, jobId));
        dispatch(toggleJob(jobId));
        return dispatch(issueFetchFiles(jobName, jobId));
    };
}

export function cancelJob(jobName, jobId) {
    return dispatch => {
        dispatch(requestCancel(jobName, jobId));
        return atlasFetch(`jobs/${jobName}/${jobId}`,
            {
                credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: 'cancel' }),
            })
            .then(response => {
                return dispatch(checkForValidationFailure(response));
            })
            .then(response => {
                if (response.ok) {
                    return response.text().then(() => {
                        dispatch(constructAndPushMessage(`${CANCEL_JOB_SUCCESS_MESSAGE} ${jobName}/${jobId}`));
                        return dispatch(receiveCancel(jobName, jobId));
                    });
                }
                return response.json().then(json => { throw Error(json && json.message ? json.message : ''); });
            }).catch(e => {
                dispatch(constructAndPushMessage(`${CANCEL_JOB_FAIL_MESSAGE} ${jobName}/${jobId} : ${e.message}`));
                dispatch(invalidateCancel(jobName, jobId));
            });
    };
}

export function purgeJob(jobName, jobId) {
    return dispatch => {
        dispatch(requestPurge(jobName, jobId));
        return atlasFetch(`jobs/${jobName}/${jobId}`,
            {
                credentials: 'include',
                method: 'DELETE',
            },
        )
            .then(response => {
                return dispatch(checkForValidationFailure(response));
            })
            .then(response => {
                if (response.ok) {
                    return response.text().then(() => {
                        dispatch(constructAndPushMessage(`${PURGE_JOB_SUCCESS_MESSAGE} ${jobName}/${jobId}`));
                        return dispatch(receivePurge(jobName, jobId));
                    });
                }
                return response.json().then(json => { throw Error(json && json.message ? json.message : ''); });
            }).catch(e => {
                dispatch(constructAndPushMessage(`${PURGE_JOB_FAIL_MESSAGE} ${jobName}/${jobId} : ${e.message}`));
                dispatch(invalidatePurge(jobName, jobId));
            });
    };
}
