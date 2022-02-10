/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2020
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
                returnCode: 'CANCELED',
                status: 'OUTPUT',
                isToggled: false,
                isSelected: false,
                files: List([]),
            }),
            Map({
                jobName: 'TEST1',
                jobId: 'TSU18689',
                label: 'TEST1:TSU18689',
                returnCode: 'ABEND S222',
                status: 'OUTPUT',
                isToggled: false,
                isSelected: false,
                files: List([]),
            }),
            Map({
                jobName: 'TEST1',
                jobId: 'TSU18516',
                label: 'TEST1:TSU18516',
                returnCode: 'ABEND S222',
                status: 'OUTPUT',
                isToggled: false,
                isSelected: false,
                files: List([]),
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
                returnCode: 'CANCELED',
                status: 'OUTPUT',
                isToggled: true,
                isSelected: false,
                files: List([]),
            }),
            Map({
                jobName: 'TEST1',
                jobId: 'TSU18689',
                label: 'TEST1:TSU18689',
                returnCode: 'ABEND S222',
                status: 'OUTPUT',
                isToggled: false,
                isSelected: false,
                files: List([]),
            }),
            Map({
                jobName: 'TEST1',
                jobId: 'TSU18516',
                label: 'TEST1:TSU18516',
                returnCode: 'ABEND S222',
                status: 'OUTPUT',
                isToggled: false,
                isSelected: false,
                files: List([]),
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
                returnCode: 'CANCELED',
                status: 'OUTPUT',
                isToggled: false,
                isSelected: false,
                files: List([]),
            }),
        ],
    ),
    isFetching: false,
});

export const selectedSignleJobState = Map({
    jobs: List(
        [
            Map({
                jobName: 'TEST',
                jobId: 'JOB1234',
                label: 'TEST:JOB1234',
                returnCode: 'CANCELED',
                status: 'OUTPUT',
                isToggled: false,
                isSelected: true,
                files: List([]),
            }),
        ],
    ),
    isFetching: false,
});

export const oneSelectedJobs = Map({
    jobs: List(
        [
            Map({
                jobName: 'TEST',
                jobId: 'JOB1234',
                label: 'TEST:JOB1234',
                returnCode: 'CANCELED',
                status: 'OUTPUT',
                isToggled: false,
                isSelected: true,
                files: List([]),
            }),
            Map({
                jobName: 'TEST1',
                jobId: 'TSU18689',
                label: 'TEST1:TSU18689',
                returnCode: 'ABEND S222',
                status: 'OUTPUT',
                isToggled: false,
                isSelected: false,
                files: List([]),
            }),
            Map({
                jobName: 'TEST1',
                jobId: 'TSU18516',
                label: 'TEST1:TSU18516',
                returnCode: 'ABEND S222',
                status: 'OUTPUT',
                isToggled: false,
                isSelected: false,
                files: List([]),
            }),
        ],
    ),
    isFetching: false,
});

export const allSelectedJobs = Map({
    jobs: List(
        [
            Map({
                jobName: 'TEST',
                jobId: 'JOB1234',
                label: 'TEST:JOB1234',
                returnCode: 'CANCELED',
                status: 'OUTPUT',
                isToggled: false,
                isSelected: true,
                files: List([]),
            }),
            Map({
                jobName: 'TEST1',
                jobId: 'TSU18689',
                label: 'TEST1:TSU18689',
                returnCode: 'ABEND S222',
                status: 'OUTPUT',
                isToggled: false,
                isSelected: true,
                files: List([]),
            }),
            Map({
                jobName: 'TEST1',
                jobId: 'TSU18516',
                label: 'TEST1:TSU18516',
                returnCode: 'ABEND S222',
                status: 'OUTPUT',
                isToggled: false,
                isSelected: true,
                files: List([]),
            }),
        ],
    ),
    isFetching: false,
});

export const requestFilesState = receivedJobsStateSingleJobName.set('isFetching', true);

export const receivedJobFiles = Map({
    jobs: List(
        [
            Map({
                jobName: 'TEST',
                jobId: 'JOB1234',
                label: 'TEST:JOB1234',
                returnCode: 'CANCELED',
                status: 'OUTPUT',
                isToggled: false,
                isSelected: false,
                files: [
                    {
                        label: 'JESMSGLG',
                        isSelected: false,
                        id: 2,
                    },
                    {
                        label: 'JESJCL',
                        isSelected: false,
                        id: 3,
                    },
                ],
            }),
        ],
    ),
    isFetching: true,
});

export const receivedFiles = receivedJobFiles.set('isFetching', false);
