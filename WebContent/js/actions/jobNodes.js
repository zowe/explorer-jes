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
import { checkForValidationFailure, VALIDATION_FAILURE_MESSAGE } from './validation';

export const TOGGLE_JOB = 'TOGGLE_JOB';

export const REQUEST_JOBS = 'REQUEST_JOBS';
export const RECEIVE_JOBS = 'RECEIVE_JOBS';
export const RECEIVE_SINGLE_JOB = 'RECEIVE_SINGLE_JOB';
export const INVALIDATE_JOBS = 'INVALIDATE_JOBS';
export const INVERT_JOB_SELECT_STATUS = 'INVERT_JOB_SELECT_STATUS';
export const UNSELECT_ALL_JOBS = 'UNSELECT_ALL_JOBS';
export const UNSELECT_ALL_JOBS_FILES = 'UNSELECT_ALL_JOBS_FILES';
export const HIGHLIGHT_SELECTED = 'HIGHLIGHT_SELECTED';
export const SELECT_FILE = 'SELECT_FILE';

export const REQUEST_JOB_FILES = 'REQUEST_JOB_FILES';
export const RECEIVE_JOB_FILES = 'RECEIVE_JOB_FILES';
export const INVALIDATE_JOB_FILES = 'INVALIDATE_JOB_FILES';
export const STOP_REFRESH_ICON = 'STOP_REFRESH_ICON';

export const REQUEST_CANCEL_JOB = 'REQUEST_CANCEL_JOB';
export const RECEIVE_CANCEL_JOB = 'RECEIVE_CANCEL_JOB';
export const INVALIDATE_CANCEL_JOB = 'INVALIDATE_CANCEL_JOB';
export const REQUEST_PURGE_JOB = 'REQUEST_PURGE_JOB';
export const REQUEST_PURGE_MULTIPLE_JOBS = 'REQUEST_PURGE_MULTIPLE_JOBS';
export const RECEIVE_PURGE_MULTIPLE_JOBS = 'RECEIVE_PURGE_MULTIPLE_JOBS';
export const RECEIVE_PURGE_JOB = 'RECEIVE_PURGE_JOB';
export const INVALIDATE_PURGE_JOB = 'INVALIDATE_PURGE_JOB';

const NO_JOBS_FOUND_MESSAGE = 'No Jobs found for filter parameters';
const CANCEL_JOB_SUCCESS_MESSAGE = 'Cancel request succeeded for';
const CANCEL_JOB_FAIL_MESSAGE = 'Cancel request failed for';
const CANCEL_JOB_CANCEL_MESSAGE = 'Cancel request canceled for';
const PURGE_JOB_SUCCESS_MESSAGE = 'Purge request succeeded for';
const PURGE_JOBS_SUCCESS_MESSAGE = 'Purge request succeeded for selected jobs';
const PURGE_JOB_CANCEL_MESSAGE = 'Purge request canceled for';
const PURGE_JOBS_CANCEL_MESSAGE = 'Purge request canceled for selected jobs';
const PURGE_JOB_FAIL_MESSAGE = 'Purge request failed for';
const PURGE_JOBS_FAIL_MESSAGE = 'Purge request failed for the following selected jobs';

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

export function invertJobSelectStatus(jobId) {
    return {
        type: INVERT_JOB_SELECT_STATUS,
        jobId,
    };
}

export function unselectAllJobs() {
    return {
        type: UNSELECT_ALL_JOBS,
    };
}

export function unselectAllJobFiles() {
    return {
        type: UNSELECT_ALL_JOBS_FILES,
    };
}

export function highlightSelected() {
    return {
        type: HIGHLIGHT_SELECTED,
    };
}
export function selectFile(jobId, label) {
    return {
        type: SELECT_FILE,
        jobId,
        label,
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

function requestPurgeMultipleJobs() {
    return {
        type: REQUEST_PURGE_MULTIPLE_JOBS,
    };
}

function receivePurge(jobName, jobId) {
    return {
        type: RECEIVE_PURGE_JOB,
        jobName,
        jobId,
    };
}

function receivePurgeMultipleJobs() {
    return {
        type: RECEIVE_PURGE_MULTIPLE_JOBS,
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

function filterByJobId(jobs, jobid, dispatch) {
    // filter for job Id as api doesn't support
    let jobFound = false;
    let jobArr = [...jobs];
    if (jobid[jobid.length - 1] === '*') { // [...]* search case
        const pattern = jobid.substring(0, jobid.length - 1);
        jobs.forEach(job => {
            if (job.jobid.indexOf(pattern) !== 0) { // Remove any non-matches
                jobArr.splice(jobArr.indexOf(job), 1);
            }
        });
    } else if (jobid[0] === '*') { // *[...] search case
        const pattern = jobid.substring(1, jobid.length);
        const patternLength = pattern.length;
        jobs.forEach(job => {
            const lastIndexOf = job.jobid.lastIndexOf(pattern);
            if (lastIndexOf && (lastIndexOf + patternLength !== job.jobid.length)) {
                jobArr.splice(jobArr.indexOf(job), 1); // Remove any non-matches
            }
        });
    } else {
        jobArr = [];
        /* eslint-disable */
        jobs.forEach(job => {
            if (job.jobid === jobid) { // [...] search case
                jobFound = true;
                jobArr = [job];
                return dispatch(receiveSingleJob(jobArr[0])); // Cancel the rest of the search, we found first instance
            }
        });
        /* eslint-enable */
    }
    if (jobArr.length > 0) {
        if (jobArr.length > 1) {
            dispatch(receiveJobs(jobArr));
        } else {
            dispatch(receiveSingleJob(jobArr[0]));
        }
    } else if (!jobFound) {
        dispatch(invalidateJobs());
    }
}

export function fetchJobs(filters) {
    return dispatch => {
        dispatch(requestJobs(filters));
        return atlasFetch(`zosmf/restjobs/jobs${getURIQuery(filters)}`, { credentials: 'include', headers: { 'X-CSRF-ZOSMF-HEADER': '*' } })
            .then(response => {
                return dispatch(checkForValidationFailure(response));
            })
            .then(response => { return response.text(); })
            .then(text => {
                // convert the text response to an array of jobs
                const jobs = JSON.parse(text);
                if (jobs && jobs.constructor === Array) {
                    if (jobs.length > 0) {
                        if ('jobId' in filters && filters.jobId !== '*') {
                            filterByJobId(jobs, filters.jobId, dispatch);
                        } else {
                            dispatch(receiveJobs(jobs));
                        }
                    } else {
                        throw Error(NO_JOBS_FOUND_MESSAGE);
                    }
                } else if (jobs.message) {
                    throw Error(jobs.message);
                }
            })
            .catch(e => {
                dispatch(constructAndPushMessage(e.message));
                // Don't clear the jobs as auth token may have expired just requiring re login
                if (e.message !== VALIDATION_FAILURE_MESSAGE) {
                    return dispatch(invalidateJobs());
                }
                return dispatch(stopRefreshIcon());
            });
    };
}

function getJobFiles(jobName, jobId) {
    return dispatch => {
        return atlasFetch(`zosmf/restjobs/jobs/${jobName}/${jobId}/files`, { credentials: 'include', headers: { 'X-CSRF-ZOSMF-HEADER': '*' } })
            .then(response => {
                return dispatch(checkForValidationFailure(response));
            })
            .then(response => { return response.text(); })
            .then(text => {
                const jobFiles = JSON.parse(text);
                if (jobFiles && jobFiles.constructor === Array) {
                    return dispatch(receiveJobFiles(jobName, jobId, jobFiles));
                }
                throw Error(jobFiles.message);
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
    const confirmCancel = confirm(`Cancel the job ${jobName}/${jobId}?`);
    if (confirmCancel === false) {
        return dispatch => { dispatch(constructAndPushMessage(`${CANCEL_JOB_CANCEL_MESSAGE} ${jobName}/${jobId}`)); };
    }
    return dispatch => {
        dispatch(requestCancel(jobName, jobId));
        return atlasFetch(`zosmf/restjobs/jobs/${jobName}/${jobId}`,
            {
                credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-ZOSMF-HEADER': '*' },
                body: JSON.stringify({ request: 'cancel' }),
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
    const confirmPurge = confirm(`Purge the job ${jobName}/${jobId}?`);
    if (confirmPurge === false) {
        return dispatch => { dispatch(constructAndPushMessage(`${PURGE_JOB_CANCEL_MESSAGE} ${jobName}/${jobId}`)); };
    }
    return dispatch => {
        dispatch(requestPurge(jobName, jobId));
        return atlasFetch(`zosmf/restjobs/jobs/${jobName}/${jobId}`,
            {
                credentials: 'include',
                method: 'DELETE',
                headers: { 'X-CSRF-ZOSMF-HEADER': '*' },
            },
        )
            .then(response => {
                return dispatch(checkForValidationFailure(response));
            })
            .then(response => {
                if (response.ok) {
                    return response.text().then(() => {
                        dispatch(constructAndPushMessage(`${PURGE_JOB_SUCCESS_MESSAGE} ${jobName}/${jobId}`));
                        dispatch(unselectAllJobs());
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

export function getSelectedJobs(jobs) {
    return jobs.filter(job => { return job.get('selectionType'); });
}

export function purgeJobs(jobs) {
    const confirmPurge = confirm('Purge the jobs?');
    if (confirmPurge === false) {
        return dispatch => { dispatch(constructAndPushMessage(`${PURGE_JOBS_CANCEL_MESSAGE}`)); };
    }
    return dispatch => {
        dispatch(requestPurgeMultipleJobs());
        const selectedJobs = getSelectedJobs(jobs);
        const jobsToPurge = selectedJobs.map(job => {
            // eslint-disable-next-line quote-props, quotes
            return { "jobName": job.get('jobName'), "jobId": job.get('jobId') };
        });
        const mapSize = jobsToPurge.size;
        let iteration = 0;
        let failedJobs = '';
        jobsToPurge.every(value => {
            const jobName = value.jobName;
            const jobId = value.jobId;
            return atlasFetch(`zosmf/restjobs/jobs/${jobName}/${jobId}`,
                {
                    credentials: 'include',
                    method: 'DELETE',
                    headers: { 'X-CSRF-ZOSMF-HEADER': '*' },
                },
            )
                .then(response => {
                    return dispatch(checkForValidationFailure(response));
                })
                .then(response => {
                    iteration += 1;
                    if (!response.ok) {
                        failedJobs += `${jobName}/${jobId}, `;
                    } else {
                        dispatch(receivePurge(jobName, jobId));
                    }
                    // Check if any job Purge has failed during the operation and display the appropriate message accordingly
                    if (iteration === mapSize) {
                        if (failedJobs !== '') {
                            dispatch(constructAndPushMessage(`${PURGE_JOBS_FAIL_MESSAGE} : ${failedJobs}`));
                            dispatch(invalidatePurge());
                        } else {
                            dispatch(constructAndPushMessage(`${PURGE_JOBS_SUCCESS_MESSAGE}`));
                            dispatch(unselectAllJobs());
                            return dispatch(receivePurgeMultipleJobs());
                        }
                    }
                    return true;
                });
        });
    };
}
