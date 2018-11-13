/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018
 */

export const jobFetchResponse = [
    {
        name: 'TEST',
        jobInstances: [
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
        ] },
    {
        name: 'TEST1',
        jobInstances: [
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
        ],
    },
];

export const jobFetchResponseSingleJobName = [
    {
        name: 'TEST',
        jobInstances: [
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
        ],
    },
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

export const jobSteps = [
    {
        name: 'STEP1',
        program: 'IEBGENER',
        step: 1,
    },
    {
        name: 'STEP2',
        program: 'AOPBATCH',
        step: 2,
    },
    {
        name: 'STEP3',
        program: 'IEBGENER',
        step: 3,
    },
];
