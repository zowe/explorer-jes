/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018
 */

import { Map, List } from 'immutable';

export const children = [
    {
        ddname: 'JESMSGLG',
        recfm: 'UA',
        lrecl: 133,
        byteCount: 1710,
        recordCount: 26,
        id: 2,
    },
    {
        ddname: 'JESJCL',
        recfm: 'V',
        lrecl: 136,
        byteCount: 430,
        recordCount: 8,
        id: 3,
    },
    {
        ddname: 'JESYSMSG',
        recfm: 'VA',
        lrecl: 137,
        byteCount: 6265,
        recordCount: 119,
        id: 4,
    },
    {
        ddname: 'SYSOUT',
        recfm: 'FBA',
        lrecl: 121,
        byteCount: 290,
        recordCount: 3,
        id: 102,
    },
    {
        ddname: 'CEEDUMP',
        recfm: 'FBA',
        lrecl: 133,
        byteCount: 29055,
        recordCount: 391,
        id: 103,
    },
    {
        ddname: 'IDIREPRT',
        recfm: 'VB',
        lrecl: 137,
        byteCount: 118798,
        recordCount: 2366,
        id: 104,
    },
];

export const state = Map({
    'jobs/JCAIN/ids/TSU01150':
    Map({
        isToggled: false,
        jobName: 'JCAIN',
        faultAnalyzerReportURI: null,
        isFetchingChildren: false,
        status: 'OUTPUT',
        owner: 'JCAIN',
        label: 'TSU01150',
        type: 'TSU',
        id: 'jobs/JCAIN/ids/TSU01150',
        nodeType: 'JOB_INSTANCE',
        childIds: List([
            'jobs/JCAIN/ids/TSU01150/steps',
            'jobs/JCAIN/ids/TSU01150/files']),
        returnCode: 'ABEND S222',
    }),
    'jobs/JCAIN/ids/TSU01158/steps':
    Map({
        isToggled: false,
        jobName: 'JCAIN',
        isFetchingChildren: false,
        owner: 'JCAIN',
        label: 'Steps',
        childNodesURI: 'jobs/JCAIN/ids/TSU01158/steps',
        type: 'TSU',
        id: 'jobs/JCAIN/ids/TSU01158/steps',
        nodeType: 'JOB_STEP_PARENT',
        childIds: List([]),
    }),
    'jobs/JCAIN/ids/TSU01314/steps':
    Map({
        isToggled: false,
        jobName: 'JCAIN',
        isFetchingChildren: false,
        owner: 'JCAIN',
        label: 'Steps',
        childNodesURI: 'jobs/JCAIN/ids/TSU01314/steps',
        type: 'TSU',
        id: 'jobs/JCAIN/ids/TSU01314/steps',
        nodeType: 'JOB_STEP_PARENT',
        childIds: List([]),
    }),
    'jobs/JCAIN/ids/TSU01150/files':
    Map({
        isToggled: false,
        jobName: 'JCAIN',
        isFetchingChildren: false,
        status: 'OUTPUT',
        owner: 'JCAIN',
        label: 'Files',
        childNodesURI: 'jobs/JCAIN/ids/TSU01150/files',
        type: 'TSU',
        id: 'jobs/JCAIN/ids/TSU01150/files',
        nodeType: 'JOB_OUTPUT_FILE_PARENT',
        childIds: List([]),
    }),
    'jobs/JCAIN/ids/TSU01158':
    Map({
        isToggled: false,
        jobName: 'JCAIN',
        faultAnalyzerReportURI: null,
        isFetchingChildren: false,
        status: 'OUTPUT',
        owner: 'JCAIN',
        label: 'TSU01158',
        type: 'TSU',
        id: 'jobs/JCAIN/ids/TSU01158',
        nodeType: 'JOB_INSTANCE',
        childIds: List([
            'jobs/JCAIN/ids/TSU01158/steps',
            'jobs/JCAIN/ids/TSU01158/files']),
        returnCode: 'ABEND S222',
    }),
    'jobs/JCAIN/ids/TSU01314':
    Map({
        isToggled: false,
        jobName: 'JCAIN',
        faultAnalyzerReportURI: null,
        isFetchingChildren: false,
        status: 'OUTPUT',
        owner: 'JCAIN',
        label: 'TSU01314',
        type: 'TSU',
        id: 'jobs/JCAIN/ids/TSU01314',
        nodeType: 'JOB_STEP_PARENT',
        childIds: List([
            'jobs/JCAIN/ids/TSU01314/steps',
            'jobs/JCAIN/ids/TSU01314/files']),
        returnCode: 'ABEND S222',
    }),
    'jobs/JCAIN':
    Map({
        id: 'jobs/JCAIN',
        label: 'JCAIN',
        nodeType: 'JOB_NAME',
        isFetchingChildren: false,
        childIds: List([
            'jobs/JCAIN/ids/TSU01150',
            'jobs/JCAIN/ids/TSU01158',
            'jobs/JCAIN/ids/TSU01314']),
        childNodesURI: 'jobs/JCAIN/ids',
        jobName: 'JCAIN',
        isToggled: false,
    }),
    jobs:
    Map({
        id: 'jobs',
        label: 'JES Jobs',
        nodeType: 'ROOT',
        childNodesURI: 'jobs?owner=',
        childIds: List(['jobs/JCAIN']),
        isFetchingChildren: false,
        isToggled: true,
        jobName: '',
    }),
    'jobs/JCAIN/ids/TSU01158/files':
    Map({
        isToggled: false,
        jobName: 'JCAIN',
        isFetchingChildren: false,
        status: 'OUTPUT',
        owner: 'JCAIN',
        label: 'Files',
        childNodesURI: 'jobs/JCAIN/ids/TSU01158/files',
        type: 'TSU',
        id: 'jobs/JCAIN/ids/TSU01158/files',
        nodeType: 'JOB_OUTPUT_FILE_PARENT',
        childIds: List([]),
    }),
    'jobs/JCAIN/ids/TSU01314/files':
    Map({
        isToggled: false,
        jobName: 'JCAIN',
        isFetchingChildren: false,
        status: 'OUTPUT',
        owner: 'JCAIN',
        label: 'Files',
        childNodesURI: 'jobs/JCAIN/ids/TSU01314/files',
        type: 'TSU',
        id: 'jobs/JCAIN/ids/TSU01314/files',
        nodeType: 'JOB_OUTPUT_FILE_PARENT',
        childIds: List([]),
    }),
    'jobs/JCAIN/ids/TSU01150/steps':
    Map({
        isToggled: false,
        jobName: 'JCAIN',
        isFetchingChildren: false,
        owner: 'JCAIN',
        label: 'Steps',
        childNodesURI: 'jobs/JCAIN/ids/TSU01150/steps',
        type: 'TSU',
        id: 'jobs/JCAIN/ids/TSU01150/steps',
        nodeType: 'JOB_STEP_PARENT',
        childIds: List([]),
    }),
});
