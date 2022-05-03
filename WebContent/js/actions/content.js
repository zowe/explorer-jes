/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2020
 */

import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { encodeURLComponent, atlasFetch } from '../utilities/urlUtils';
import { constructAndPushMessage } from './snackbarNotifications';
import { checkForValidationFailure } from './validation';

export const REQUEST_CONTENT = 'REQUEST_CONTENT';
export const REFRESH_CONTENT = 'REFRESH_CONTENT';
export const RECEIVE_CONTENT = 'RECEIVE_CONTENT';
export const REMOVE_CONTENT = 'REMOVE_CONTENT';
export const UPDATE_CONTENT = 'UPDATE_CONTENT';
export const CHANGE_SELECTED_CONTENT = 'CHANGE_SELECTED_CONTENT';
export const INVALIDATE_CONTENT = 'INVALIDATE_CONTENT';

export const REQUEST_SUBMIT_JCL = 'REQUEST_SUBMIT_JCL';
export const RECEIVE_SUBMIT_JCL = 'RECEIVE_SUBMIT_JCL';
export const INVALIDATE_SUBMIT_JCL = 'INVALIDATE_SUBMIT_JCL';

export const NO_CONTENT_IN_RESPONSE_ERROR_MESSAGE = 'No Content in response from API';

function requestContent(jobName, jobId, fileName, fileId, fileLabel, refreshFile) {
    return {
        type: refreshFile ? REFRESH_CONTENT : REQUEST_CONTENT,
        jobName,
        jobId,
        fileName,
        fileId,
        fileLabel,
    };
}

function receiveContent(jobName, jobId, fileName, fileId, content, fileLabel, readOnly = true) {
    return {
        type: RECEIVE_CONTENT,
        jobName,
        jobId,
        content,
        fileName,
        fileId,
        fileLabel,
        readOnly,
    };
}

export function invalidateContent(fileLabel, fileId) {
    return {
        type: INVALIDATE_CONTENT,
        fileLabel,
        fileId,
    };
}

export function getFileLabel(jobId, fileName = '') {
    return `${jobId}-${fileName}`;
}

function checkResponse(response) {
    if (response.ok) {
        return response.text();
    }
    return response.json().then(e => { throw Error(e.message); });
}

function dispatchReceiveContent(dispatch, jobName, jobId, fileName, fileId, fileLabel, text, readOnly = true) {
    if (text || text === '') {
        return dispatch(receiveContent(jobName, jobId, fileName, fileId, text, fileLabel, readOnly));
    }
    throw Error(text || NO_CONTENT_IN_RESPONSE_ERROR_MESSAGE);
}

export function fetchJobFile(jobName, jobId, fileName, fileId, refreshFile) {
    return dispatch => {
        const fileLabel = getFileLabel(jobId, fileName);
        dispatch(requestContent(jobName, jobId, fileName, fileId, fileLabel, refreshFile));
        return atlasFetch(`zosmf/restjobs/jobs/${encodeURLComponent(jobName)}/${encodeURLComponent(jobId)}/files/${fileId}/records`, { credentials: 'include', headers: { 'X-CSRF-ZOSMF-HEADER': '*' } })
            .then(response => {
                return dispatch(checkForValidationFailure(response));
            })
            .then(response => {
                return checkResponse(response);
            })
            .then(text => {
                return dispatchReceiveContent(dispatch, jobName, jobId, fileName, fileId, getFileLabel(jobId, fileName), text);
            })
            .catch(e => {
                dispatch(constructAndPushMessage(`${e.message} - ${jobName}:${jobId}:${fileName}`));
                return dispatch(invalidateContent(fileLabel, fileId));
            });
    };
}

export function fetchConcatenatedJobFiles(jobName, jobId, refreshFile) {
    return dispatch => {
        const fileLabel = getFileLabel(jobName, jobId);
        dispatch(requestContent(jobName, jobId, jobId, jobId, fileLabel, refreshFile));
        return atlasFetch(`zosmf/restjobs/jobs/${encodeURLComponent(jobName)}/${encodeURLComponent(jobId)}/files`, { credentials: 'include', headers: { 'X-CSRF-ZOSMF-HEADER': '*' } })
            .then(response => {
                return dispatch(checkForValidationFailure(response));
            })
            .then(response => { return response.text(); })
            .then(text => {
                let concatenatedText = '';
                let index = 0;
                const jobFiles = JSON.parse(text);
                if (jobFiles && jobFiles.constructor === Array) {
                    jobFiles.forEach(job => {
                        return atlasFetch(`zosmf/restjobs/jobs/${encodeURLComponent(job.jobname)}/${encodeURLComponent(job.jobid)}/files/${job.id}/records`,
                            { credentials: 'include', headers: { 'X-CSRF-ZOSMF-HEADER': '*' } })
                            .then(response => {
                                return dispatch(checkForValidationFailure(response));
                            })
                            .then(response => {
                                return checkResponse(response);
                            })
                            .then(response => {
                                concatenatedText += `\n ${response}`;
                                index += 1;
                                if (index === jobFiles.length) {
                                    return dispatchReceiveContent(dispatch, job.jobname, job.jobid, job.jobid, job.jobid, fileLabel, concatenatedText);
                                }
                                return true;
                            });
                    });
                }
            })
            .catch(e => {
                return dispatch(constructAndPushMessage(e.message));
            });
    };
}

export function downloadAllJobFiles(jobName, jobId) {
    return dispatch => {
        // fetch the list of files for a Job
        return atlasFetch(`zosmf/restjobs/jobs/${encodeURLComponent(jobName)}/${encodeURLComponent(jobId)}/files`, { credentials: 'include', headers: { 'X-CSRF-ZOSMF-HEADER': '*' } })
            .then(response => {
                return dispatch(checkForValidationFailure(response));
            })
            .then(response => { return response.text(); })
            .then(text => {
                let index = 0;
                const jobFiles = JSON.parse(text);
                const zip = new JSZip();
                // fetch the content of each file and download these respective files in a zip file format
                if (jobFiles && jobFiles.constructor === Array) {
                    jobFiles.forEach(job => {
                        return atlasFetch(`zosmf/restjobs/jobs/${encodeURLComponent(job.jobname)}/${encodeURLComponent(job.jobid)}/files/${job.id}/records`,
                            { credentials: 'include', headers: { 'X-CSRF-ZOSMF-HEADER': '*' } })
                            .then(response => {
                                return dispatch(checkForValidationFailure(response));
                            })
                            .then(response => {
                                return checkResponse(response);
                            })
                            .then(response => {
                                zip.file(job.ddname, response);
                                index += 1;
                                if (index === jobFiles.length) {
                                    zip.generateAsync({ type: 'blob' })
                                        .then(content => {
                                            saveAs(content, `${jobName}-${jobId}`);
                                        });
                                }
                                return true;
                            });
                    });
                }
            })
            .catch(e => {
                return dispatch(constructAndPushMessage(e.message));
            });
    };
}

function getFileNameFromJob(jobName, jobId, fileId) {
    const contentPath = `zosmf/restjobs/jobs/${encodeURLComponent(jobName)}/${encodeURLComponent(jobId)}/files`;
    return atlasFetch(contentPath, { credentials: 'include', headers: { 'X-CSRF-ZOSMF-HEADER': '*' } })
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            return response.json().then(e => { throw Error(e.message); });
        })
        .then(text => {
            const jobFiles = JSON.parse(text);
            return jobFiles.find(file => {
                return parseInt(file.id, 10) === parseInt(fileId, 10);
            });
        })
        .then(file => {
            return file.ddname;
        });
}

export function fetchJobFileNoName(jobName, jobId, fileId) {
    return dispatch => {
        const contentPath = `zosmf/restjobs/jobs/${encodeURLComponent(jobName)}/${encodeURLComponent(jobId)}/files/${fileId}/records`;
        dispatch(requestContent(jobName, jobId, '', fileId, getFileLabel(jobId)));
        return atlasFetch(contentPath, { credentials: 'include', headers: { 'X-CSRF-ZOSMF-HEADER': '*' } })
            .then(response => {
                return dispatch(checkForValidationFailure(response));
            })
            .then(response => {
                return checkResponse(response);
            })
            .then(text => {
                if (text || text === '') {
                    return getFileNameFromJob(jobName, jobId, fileId)
                        .then(
                            fileName => {
                                if (fileName) {
                                    return dispatchReceiveContent(dispatch, jobName, jobId, fileName, fileId, getFileLabel(jobId, fileName), text);
                                }
                                throw Error(fileName);
                            },
                        ).catch(e => {
                            throw Error(e);
                        });
                }
                throw Error(text.message || NO_CONTENT_IN_RESPONSE_ERROR_MESSAGE);
            })
            .catch(e => {
                dispatch(constructAndPushMessage(`${e.message} - ${jobName}:${jobId}:${fileId}`));
                return dispatch(invalidateContent());
            });
    };
}

export function removeContent(index) {
    return {
        type: REMOVE_CONTENT,
        index,
    };
}

export function updateContent(content) {
    return {
        type: UPDATE_CONTENT,
        content,
    };
}

export function changeSelectedContent(index) {
    return {
        type: CHANGE_SELECTED_CONTENT,
        newSelectedContent: index,
    };
}

export function getJCL(jobName, jobId) {
    return dispatch => {
        const fileLabel = getFileLabel(jobId, 'JCL');
        dispatch(requestContent(jobName, jobId, 'JCL', 0, fileLabel));
        return atlasFetch(`zosmf/restjobs/jobs/${encodeURLComponent(jobName)}/${encodeURLComponent(jobId)}/files/JCL/records`, { credentials: 'include', headers: { 'X-CSRF-ZOSMF-HEADER': '*' } })
            .then(response => {
                return dispatch(checkForValidationFailure(response));
            })
            .then(response => {
                return checkResponse(response);
            })
            .then(json => {
                return dispatchReceiveContent(dispatch, jobName, jobId, 'JCL', 0, fileLabel, json, false);
            })
            .catch(e => {
                dispatch(constructAndPushMessage(`${e.message} - ${jobName}:${jobId}:JCL`));
                return dispatch(invalidateContent(fileLabel));
            });
    };
}

function requestSubmitJCL() {
    return {
        type: REQUEST_SUBMIT_JCL,
        isSubmittingJCL: true,
    };
}

function receiveSubmitJCL(jobName, jobId) {
    return {
        type: RECEIVE_SUBMIT_JCL,
        jobName,
        jobId,
        isSubmittingJCL: false,
    };
}

function invalidateSubmitJCL() {
    return {
        type: INVALIDATE_SUBMIT_JCL,
        isSubmittingJCL: false,
    };
}

export function submitJCL(content) {
    return dispatch => {
        dispatch(requestSubmitJCL());
        return atlasFetch('zosmf/restjobs/jobs',
            {
                credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'text/plain', 'X-CSRF-ZOSMF-HEADER': '*' },
                body: content,
            })
            .then(response => {
                return dispatch(checkForValidationFailure(response));
            })
            .then(response => {
                return checkResponse(response);
            })
            .then(response => {
                // convert the response to JSON
                const json = JSON.parse(response);
                dispatch(receiveSubmitJCL(json.jobname, json.jobid));
                dispatch(constructAndPushMessage(`${json.jobname}:${json.jobid} Submitted`));
            })
            .catch(e => {
                dispatch(invalidateSubmitJCL());
                dispatch(constructAndPushMessage(`${e.message}`));
            });
    };
}

export function createAndDownloadElement(blob, fileName) {
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = fileName;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
}

export function downloadFile(job, file, url, dispatch) {
    atlasFetch(url, { credentials: 'include', headers: { 'X-CSRF-ZOSMF-HEADER': '*' } })
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            return dispatch(constructAndPushMessage('Unable to download file'));
        })
        .then(text => {
            const blob = new Blob([text], { type: 'text/plain' });
            const fileName = `${job.get('jobName')}-${job.get('jobId')}-${file}`;
            if (window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveBlob(blob, fileName);
            } else {
                createAndDownloadElement(blob, fileName);
            }
        });
}
