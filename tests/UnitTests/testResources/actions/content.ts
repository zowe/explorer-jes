/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */

export const jobFileContents = '//TSTJIMS  JOB (ADL),ATLAS,MSGCLASS=0,CLASS=A,TIME=1440\n'
+ '//*        THIS JOB SIMULATES AN IMS REGION FOR 60 SECONDS\n'
+ '//IMS      EXEC PGM=DFSMVRC0\n'
+ '//STEPLIB  DD DSN=ATLAS.TEST.LOAD,DISP=SHR\n'
+ '//SYSPRINT DD SYSOUT=*\n'
+ '//SYSOUT   DD SYSOUT=*\n'
+ '//*\n';

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
export const fileId = '2';
export const fileName = 'JESMSGLG';

export const fileList = [{
    recfm: 'UA',
    'records-url': 'https://TVT5011.svl.ibm.com:443/zosmf/restjobs/jobs/J0004074TVT5011.DA48EC13.......%3A/files/2/records',
    stepname: 'JES2',
    subsystem: 'JES2',
    'job-correlator': 'J0004074TVT5011.DA48EC13.......:',
    'byte-count': 1445,
    lrecl: 133,
    jobid: 'JOB04074',
    ddname: 'JESMSGLG',
    id: 2,
    'record-count': 24,
    class: 'X',
    jobname: 'ZWEACTPJ',
    procstep: null,
},
{
    recfm: 'V',
    'records-url': 'https://TVT5011.svl.ibm.com:443/zosmf/restjobs/jobs/J0004074TVT5011.DA48EC13.......%3A/files/3/records',
    stepname: 'JES2',
    subsystem: 'JES2',
    'job-correlator': 'J0004074TVT5011.DA48EC13.......:',
    'byte-count': 2063,
    lrecl: 136,
    jobid: 'JOB04074',
    dname: 'JESJCL',
    id: 3,
    'record-count': 29,
    class: 'X',
    jobname: 'ZWEACTPJ',
    procstep: null,
}];

export const jobJCL = '//TESTJOBX JOB (),MSGCLASS=H EXEC PGM=IEFBR14';

export const submitJCLResponse = {
    owner: 'JCAIN',
    phase: 130,
    subsystem: 'JES2',
    'phase-name': 'Job is actively converting',
    'job-correlator': 'J0004091TVT5011.DA4A133D.......:',
    type: 'JOB',
    url: 'https://TVT5011.svl.ibm.com:443/zosmf/restjobs/jobs/J0004091TVT5011.DA4A133D.......%3A',
    jobid: 'JOB12345',
    class: 'A',
    'files-url': 'https://TVT5011.svl.ibm.com:443/zosmf/restjobs/jobs/J0004091TVT5011.DA4A133D.......%3A/files',
    jobname: 'DEMOJOB',
    status: 'INPUT',
    retcode: null,
};
