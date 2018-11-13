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

export const initialState = Map({
    jobs: List([]),
    isFetching: false,
});

export const requestedJobsState = Map({
    jobs: List([]),
    isFetching: true,
});

export const receivedJobsState = Map({
    jobs: List(
        [
            Map({
                jobName: 'TEST',
                jobId: 'JOB1234',
                label: 'TEST:JOB1234',
                returnCode: 'CC 0000',
                status: 'OUTPUT',
                isToggled: false,
                files: List([]),
                steps: List([]),
            }),
            Map({
                jobName: 'TEST1',
                jobId: 'TSU18689',
                label: 'TEST1:TSU18689',
                returnCode: 'ABEND S222',
                status: 'OUTPUT',
                isToggled: false,
                files: List([]),
                steps: List([]),
            }),
            Map({
                jobName: 'TEST1',
                jobId: 'TSU18516',
                label: 'TEST1:TSU18516',
                returnCode: 'ABEND S222',
                status: 'OUTPUT',
                isToggled: false,
                files: List([]),
                steps: List([]),
            }),
        ],
    ),
    isFetching: false,
});

export const toggledJobState = Map({
    jobs: List(
        [
            Map({
                jobName: 'TEST',
                jobId: 'JOB1234',
                label: 'TEST:JOB1234',
                returnCode: 'CC 0000',
                status: 'OUTPUT',
                isToggled: true,
                files: List([]),
                steps: List([]),
            }),
            Map({
                jobName: 'TEST1',
                jobId: 'TSU18689',
                label: 'TEST1:TSU18689',
                returnCode: 'ABEND S222',
                status: 'OUTPUT',
                isToggled: false,
                files: List([]),
                steps: List([]),
            }),
            Map({
                jobName: 'TEST1',
                jobId: 'TSU18516',
                label: 'TEST1:TSU18516',
                returnCode: 'ABEND S222',
                status: 'OUTPUT',
                isToggled: false,
                files: List([]),
                steps: List([]),
            }),
        ],
    ),
    isFetching: false,
});

export const receivedJobsStateSingleJobName = Map({
    jobs: List(
        [
            Map({
                jobName: 'TEST',
                jobId: 'JOB1234',
                label: 'TEST:JOB1234',
                returnCode: 'CC 0000',
                status: 'OUTPUT',
                isToggled: false,
                files: List([]),
                steps: List([]),
            }),
        ],
    ),
    isFetching: false,
});

export const requestStepsAndFilesState = receivedJobsStateSingleJobName.set('isFetching', true);

export const receivedJobFiles = Map({
    jobs: List(
        [
            Map({
                jobName: 'TEST',
                jobId: 'JOB1234',
                label: 'TEST:JOB1234',
                returnCode: 'CC 0000',
                status: 'OUTPUT',
                isToggled: false,
                files: [
                    {
                        label: 'JESMSGLG',
                        id: 2,
                    },
                    {
                        label: 'JESJCL',
                        id: 3,
                    },
                ],
                steps: List(),
            }),
        ],
    ),
    isFetching: true,
});

export const receivedJobSteps = Map({
    jobs: List(
        [
            Map({
                jobName: 'TEST',
                jobId: 'JOB1234',
                label: 'TEST:JOB1234',
                returnCode: 'CC 0000',
                status: 'OUTPUT',
                isToggled: false,
                files: [
                    {
                        label: 'JESMSGLG',
                        id: 2,
                    },
                    {
                        label: 'JESJCL',
                        id: 3,
                    },
                ],
                steps: [
                    {
                        label: 'STEP1:IEBGENER',
                        id: 1,
                    },
                    {
                        label: 'STEP2:AOPBATCH',
                        id: 2,
                    },
                    {
                        label: 'STEP3:IEBGENER',
                        id: 3,
                    },
                ],
            }),
        ],
    ),
    isFetching: true,
});

export const receivedFilesAndSteps = receivedJobSteps.set('isFetching', false);

