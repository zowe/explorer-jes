/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2020
 */

import { List, Map } from 'immutable';

export const jobFetchResponse = [{
    owner: 'JCAIN',
    phase: 20,
    subsystem: 'JES2',
    'phase-name': 'Job is on the hard copy queue',
    'job-correlator': 'J0004089TVT5011.DA4A12D8.......: ',
    type: 'JOB',
    url: 'https://TVT5011.svl.ibm.com:443/zosmf/restjobs/jobs/J0004089TVT5011.DA4A12D8.......%3A',
    jobid: 'JOB1234',
    class: 'A',
    'files-url': 'https://TVT5011.svl.ibm.com:443/zosmf/restjobs/jobs/J0004089TVT5011.DA4A12D8.......%3A/files',
    jobname: 'TEST',
    status: 'OUTPUT',
    retcode: 'CANCELED',
},
{
    owner: 'JCAIN',
    phase: 20,
    subsystem: 'JES2',
    'phase-name': 'Job is on the hard copy queue',
    'job-correlator': 'J0004026TVT5011.DA47BBDA.......: ',
    type: 'JOB',
    url: 'https://TVT5011.svl.ibm.com:443/zosmf/restjobs/jobs/J0004026TVT5011.DA47BBDA.......%3A',
    jobid: 'TSU18689',
    class: 'A',
    'files-url': 'https://TVT5011.svl.ibm.com:443/zosmf/restjobs/jobs/J0004026TVT5011.DA47BBDA.......%3A/files',
    jobname: 'TEST1',
    status: 'OUTPUT',
    retcode: 'ABEND S222',
},
{
    owner: 'JCAIN',
    phase: 20,
    subsystem: 'JES2',
    'phase-name': 'Job is on the hard copy queue',
    'job-correlator': 'T0003683TVT5011.DA4158FF.......: ',
    type: 'TSU',
    url: 'https://TVT5011.svl.ibm.com:443/zosmf/restjobs/jobs/T0003683TVT5011.DA4158FF.......%3A',
    jobid: 'TSU18516',
    class: 'TSU',
    'files-url': 'https://TVT5011.svl.ibm.com:443/zosmf/restjobs/jobs/T0003683TVT5011.DA4158FF.......%3A/files',
    jobname: 'TEST1',
    status: 'OUTPUT',
    retcode: 'ABEND S222',
}];

export const jobFetchResponseSingleJobName = [{
    owner: 'JCAIN',
    phase: 20,
    subsystem: 'JES2',
    'phase-name': 'Job is on the hard copy queue',
    'job-correlator': 'J0004092TVT5011.DA4A17D2.......: ',
    type: 'JOB',
    url: 'https://TVT5011.svl.ibm.com:443/zosmf/restjobs/jobs/J0004092TVT5011.DA4A17D2.......%3A',
    jobid: 'JOB1234',
    class: 'A',
    'files-url': 'https://TVT5011.svl.ibm.com:443/zosmf/restjobs/jobs/J0004092TVT5011.DA4A17D2.......%3A/files',
    jobname: 'TEST',
    status: 'OUTPUT',
    retcode: 'CANCELED',
}];

export const jobFiles = [{
    recfm: 'UA',
    'records-url': 'https://TVT5011.svl.ibm.com:443/zosmf/restjobs/jobs/J0004076TVT5011.DA48EE8E.......%3A/files/2/records',
    stepname: 'JES2',
    subsystem: 'JES2',
    'job-correlator': 'J0004076TVT5011.DA48EE8E.......: ',
    'byte-count': 1445,
    lrecl: 133,
    jobid: 'JOB04076',
    ddname: 'JESMSGLG',
    id: 2,
    'record-count': 24,
    class: 'X',
    jobname: 'ZWEACTPJ',
    procstep: null,
},
{
    recfm: 'V',
    'records-url': 'https://TVT5011.svl.ibm.com:443/zosmf/restjobs/jobs/J0004076TVT5011.DA48EE8E.......%3A/files/3/records',
    stepname: 'JES2',
    subsystem: 'JES2',
    'job-correlator': 'J0004076TVT5011.DA48EE8E.......: ',
    'byte-count': 2063,
    lrecl: 136,
    jobid: 'JOB04076',
    ddname: 'JESJCL',
    id: 3,
    'record-count': 29,
    class: 'X',
    jobname: 'ZWEACTPJ',
    procstep: null,
}];

export const jobName = 'TESTJOB';
export const jobId = 'JOB1234';
export const jobName2 = 'TESTJOB2';
export const jobId2 = 'JOB12345';
/**
 * Unneccessary elements removed from jobs
 * (label, returnCode, status, isToggled, files)
 */
export const jobsStateWithOneJobSelected = List([
    new Map({
        jobName,
        jobId,
        isSelected: false,
    }),
    new Map({
        jobName: jobName2,
        jobId: jobId2,
        isSelected: true,
    }),
]);
