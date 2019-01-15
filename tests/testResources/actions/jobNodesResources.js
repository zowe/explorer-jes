/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */

export const jobFetchResponse = [
    {
        jobId: 'JOB1234',
        jobName: 'TEST',
        owner: 'IBMUSER',
        type: 'JOB',
        status: 'OUTPUT',
        returnCode: 'CC 0000',
        subsystem: 'JES2',
        executionClass: 'A',
        phaseName: 'Job is on the hard copy queue' },
    {
        jobId: 'TSU18689',
        jobName: 'TEST1',
        owner: 'USER',
        type: 'TSU',
        status: 'OUTPUT',
        returnCode: 'ABEND S222',
        subsystem: 'JES2',
        executionClass: 'TSU',
        phaseName: 'Job is on the hard copy queue',
    },
    {
        jobId: 'TSU18516',
        jobName: 'TEST1',
        owner: 'USER',
        type: 'TSU',
        status: 'OUTPUT',
        returnCode: 'ABEND S222',
        subsystem: 'JES2',
        executionClass: 'TSU',
        phaseName: 'Job is on the hard copy queue',
    },
];

export const jobFetchResponseSingleJobName = [
    {
        jobId: 'JOB1234',
        jobName: 'TEST',
        owner: 'IBMUSER',
        type: 'JOB',
        status: 'OUTPUT',
        returnCode: 'CC 0000',
        subsystem: 'JES2',
        executionClass: 'A',
        phaseName: 'Job is on the hard copy queue' },
];

export const jobName = 'TESTJOB';
export const jobId = 'JOB1234';

export const jobFiles = [
    {
        ddname: 'JESMSGLG',
        recfm: 'UA',
        lrecl: 133,
        byteCount: 1609,
        recordCount: 24,
        id: 2,
    },
    {
        ddname: 'JESJCL',
        recfm: 'V',
        lrecl: 136,
        byteCount: 981,
        recordCount: 19,
        id: 3,
    },
];
