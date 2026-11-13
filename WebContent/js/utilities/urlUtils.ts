/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2020
 */

export function encodeURLComponent(URL: string) {
    return encodeURIComponent(URL);
}

// z/OS job name: 1-8 chars, first alphabetic or national (@ # $), rest alphanumeric or national
const JOB_NAME_PATTERN = /^[A-Z@#$][A-Z0-9@#$]{0,7}$/i;
// JES job id, e.g. JOB12345, J0012345, STC00012, TSU01234
const JOB_ID_PATTERN = /^[A-Z][A-Z0-9]{1,7}$/i;
// JES spool file id: a non-negative integer
const FILE_ID_PATTERN = /^\d{1,10}$/;

export function isValidJobName(jobName: unknown): boolean {
    return typeof jobName === 'string' && JOB_NAME_PATTERN.test(jobName);
}

export function isValidJobId(jobId: unknown): boolean {
    return typeof jobId === 'string' && JOB_ID_PATTERN.test(jobId);
}

export function isValidFileId(fileId: unknown): boolean {
    return (typeof fileId === 'string' || typeof fileId === 'number') && FILE_ID_PATTERN.test(String(fileId));
}

export function whichServer() {
    const server = location.host;    
    return server;
}

export function atlasFetch(endpoint: string, content) {
    return fetch(`https://${whichServer()}/ibmzosmf/api/v1/${endpoint}`, content);
}
