/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */

export const jobFileContents = { content: "//TSTJIMS  JOB (ADL),'ATLAS',MSGCLASS=0,CLASS=A,TIME=1440\n" +
'//*        THIS JOB SIMULATES AN IMS REGION FOR 60 SECONDS\n' +
'//IMS      EXEC PGM=DFSMVRC0\n' +
'//STEPLIB  DD DSN=ATLAS.TEST.LOAD,DISP=SHR\n' +
'//SYSPRINT DD SYSOUT=*\n' +
'//SYSOUT   DD SYSOUT=*\n' +
'//*\n' };

export const jobFileFetchResponse = {
    content: jobFileContents,
};

export const DSRequestFailed = "Request for content using z/OSMF failed for dataset 'ATLAS.TEST.JCL(TSTJIS)'";

export const USSContent = 'Hello world';

export const USSChecksum = 'wugbwaskdugfasudfu';

export const USSFetchResponse = {
    content: USSContent,
    checksum: USSChecksum,
};

export const USSRequestFailed = "Could not read content from file '/u/jcain//hello1.txt':";

export const jobName = 'DEMOJOB';
export const jobId = 'JOB12345';
export const fileId = '102';
export const fileName = 'JESMSGLG';

export const fileList = { items: [
    {
        ddName: 'JESMSGLG',
        recordFormat: 'UA',
        recordLength: 133,
        byteCount: 1609,
        recordCount: 24,
        id: 102,
    },
    {
        ddName: 'JESJCL',
        recordFormat: 'V',
        recordLength: 136,
        byteCount: 981,
        recordCount: 19,
        id: 3,
    },
] };

export const jobJCL = { content: '//TESTJOBX JOB (),MSGCLASS=H EXEC PGM=IEFBR14' };

export const submitJCLResponse = {
    jobId: 'JOB12345',
    jobName: 'DEMOJOB',
    owner: 'JORDAN',
    type: 'JOB',
    status: 'INPUT',
    returnCode: null,
    subsystem: 'JES2',
    executionClass: 'A',
    phaseName: 'Job is actively converting',
};
