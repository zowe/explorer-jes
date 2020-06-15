/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */

/* eslint-env mocha */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import expect from 'expect';
import rewire from 'rewire';
import { fromJS, Map } from 'immutable';
import * as JobNodes from '../../../WebContent/js/actions/jobNodes';
import * as snackbar from '../../../WebContent/js/actions/snackbarNotifications';
import { LOCAL_HOST_ENDPOINT as BASE_URL } from '../testResources/hostConstants';

import * as jobNodesResources from '../testResources/actions/jobNodesResources';
import * as filtersResources from '../testResources/actions/filters';

describe('Action: jobNodes', () => {
    afterEach(() => {
        nock.cleanAll();
    });

    // Use Rewire to export private functions
    const rewiredJobNodes = rewire('../../../WebContent/js/actions/jobNodes');

    const middlewares = [thunk];
    const mockStore = configureMockStore(middlewares);

    describe('toggle', () => {
        it('Should create an action to invert isToggled of a job', () => {
            const expectedJobId = 'JOB1234';
            const expectedAction = {
                type: JobNodes.TOGGLE_JOB,
                jobId: expectedJobId,
            };
            expect(JobNodes.toggleJob(expectedJobId)).toEqual(expectedAction);
        });
    });

    describe('fetchJobs', () => {
        it('Should create an action to request and receive jobs given valid filters', () => {
            const expectedActions = [
                {
                    type: JobNodes.REQUEST_JOBS,
                    filters: filtersResources.filters,
                },
                {
                    type: JobNodes.RECEIVE_JOBS,
                    jobs: jobNodesResources.jobFetchResponse,
                },
            ];

            const rewiredGetURIQuery = rewiredJobNodes.__get__('getURIQuery');
            nock(BASE_URL)
                .get(`/jobs${rewiredGetURIQuery(filtersResources.filters)}`)
                .reply(200, jobNodesResources.jobFetchResponse);
            const store = mockStore();
            return store.dispatch(JobNodes.fetchJobs(filtersResources.filters))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });

        it('Should create an action to request and invalidate jobs due to failed fetch', () => {
            const apiResponseMessage = 'Request to fetch failed';
            const expectedActions = [
                {
                    type: JobNodes.REQUEST_JOBS,
                    filters: filtersResources.filters,
                },
                {
                    type: snackbar.PUSH_NOTIFICATION_MESSAGE,
                    message: Map({
                        message: apiResponseMessage,
                    }),
                },
                {
                    type: JobNodes.INVALIDATE_JOBS,
                },
            ];

            const rewiredGetURIQuery = rewiredJobNodes.__get__('getURIQuery');
            nock(BASE_URL)
                .get(`/jobs${rewiredGetURIQuery(filtersResources.filters)}`)
                .reply(500, { message: apiResponseMessage });
            const store = mockStore();
            return store.dispatch(JobNodes.fetchJobs(filtersResources.filters))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });
    });

    describe('fetchJobFiles', () => {
        it('Should create actions to request files, toggle job and received files', () => {
            const expectedActions = [
                {
                    type: JobNodes.REQUEST_JOB_FILES,
                    jobName: jobNodesResources.jobName,
                    jobId: jobNodesResources.jobId,
                },
                {
                    type: JobNodes.TOGGLE_JOB,
                    jobId: jobNodesResources.jobId,
                },
                {
                    type: JobNodes.RECEIVE_JOB_FILES,
                    jobName: jobNodesResources.jobName,
                    jobId: jobNodesResources.jobId,
                    jobFiles: jobNodesResources.jobFiles,
                },
                {
                    type: JobNodes.STOP_REFRESH_ICON,
                },
            ];

            nock(BASE_URL)
                .get(`/jobs/${jobNodesResources.jobName}/${jobNodesResources.jobId}/files`)
                .reply(200, jobNodesResources.jobFiles);

            const store = mockStore();
            return store.dispatch(JobNodes.fetchJobFiles(jobNodesResources.jobName, jobNodesResources.jobId)).then(() => {
                expect(store.getActions()).toEqual(expectedActions);
            });
        });

        it('Should create actions to request files, toggle job and push message due to server error on files', () => {
            const apiResponseMessage = `Request to fetch failed ${jobNodesResources.jobName}:${jobNodesResources.jobId}`;
            const expectedActions = [
                {
                    type: JobNodes.REQUEST_JOB_FILES,
                    jobName: jobNodesResources.jobName,
                    jobId: jobNodesResources.jobId,
                },
                {
                    type: JobNodes.TOGGLE_JOB,
                    jobId: jobNodesResources.jobId,
                },
                {
                    type: snackbar.PUSH_NOTIFICATION_MESSAGE,
                    message: Map({
                        message: `${apiResponseMessage}`,
                    }),
                },
                {
                    type: JobNodes.STOP_REFRESH_ICON,
                },
            ];

            nock(BASE_URL)
                .get(`/jobs/${jobNodesResources.jobName}/${jobNodesResources.jobId}/files`)
                .reply(500, { message: apiResponseMessage });

            const store = mockStore();
            return store.dispatch(JobNodes.fetchJobFiles(jobNodesResources.jobName, jobNodesResources.jobId)).then(() => {
                expect(store.getActions()).toEqual(expectedActions);
            });
        });
    });

    describe('purgeJob', () => {
        it('Should create an action to request a job purge and then receive validation', () => {
            const purgeSuccessMessage = rewiredJobNodes.__get__('PURGE_JOB_SUCCESS_MESSAGE');

            const expectedActions = [{
                type: JobNodes.REQUEST_PURGE_JOB,
                jobName: jobNodesResources.jobName,
                jobId: jobNodesResources.jobId,
            },
            {
                type: snackbar.PUSH_NOTIFICATION_MESSAGE,
                message: Map({
                    message: `${purgeSuccessMessage} ${jobNodesResources.jobName}/${jobNodesResources.jobId}`,
                }),
            },
            {
                type: JobNodes.RECEIVE_PURGE_JOB,
                jobName: jobNodesResources.jobName,
                jobId: jobNodesResources.jobId,
            }];

            const node = new Map();
            node.set('label', jobNodesResources.jobId);


            const store = mockStore(fromJS({
                treeNodesJobs: {
                    jobs: node,
                },
            }));

            nock(BASE_URL)
                .delete(`/jobs/${jobNodesResources.jobName}/${jobNodesResources.jobId}`)
                .reply(200, '');

            return store.dispatch(JobNodes.purgeJob(jobNodesResources.jobName, jobNodesResources.jobId))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });

        it('Should create an action to request a job purge and then invalidate', () => {
            const purgeFail = rewiredJobNodes.__get__('PURGE_JOB_FAIL_MESSAGE');
            const fetchResponseMessage = 'Job Not found';
            const expectedActions = [{
                type: JobNodes.REQUEST_PURGE_JOB,
                jobName: jobNodesResources.jobName,
                jobId: jobNodesResources.jobId,
            },
            {
                type: snackbar.PUSH_NOTIFICATION_MESSAGE,
                message: Map({
                    message: `${purgeFail} ${jobNodesResources.jobName}/${jobNodesResources.jobId} : ${fetchResponseMessage}`,
                }),
            },
            {
                type: JobNodes.INVALIDATE_PURGE_JOB,
                jobName: jobNodesResources.jobName,
                jobId: jobNodesResources.jobId,
            }];

            const node = new Map();
            node.set('label', jobNodesResources.jobId);


            const store = mockStore(fromJS({
                treeNodesJobs: {
                    jobs: node,
                },
            }));

            nock(BASE_URL)
                .delete(`/jobs/${jobNodesResources.jobName}/${jobNodesResources.jobId}`)
                .reply(404, { message: fetchResponseMessage });

            return store.dispatch(JobNodes.purgeJob(jobNodesResources.jobName, jobNodesResources.jobId))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });
    });

    describe('cancelJob', () => {
        it('Should create an action to request a job cancel and then receive validation', () => {
            const cancelSuccessMessage = rewiredJobNodes.__get__('CANCEL_JOB_SUCCESS_MESSAGE');

            const expectedActions = [{
                type: JobNodes.REQUEST_CANCEL_JOB,
                jobName: jobNodesResources.jobName,
                jobId: jobNodesResources.jobId,
            },
            {
                type: snackbar.PUSH_NOTIFICATION_MESSAGE,
                message: Map({
                    message: `${cancelSuccessMessage} ${jobNodesResources.jobName}/${jobNodesResources.jobId}`,
                }),
            },
            {
                type: JobNodes.RECEIVE_CANCEL_JOB,
                jobName: jobNodesResources.jobName,
                jobId: jobNodesResources.jobId,
            }];

            const node = new Map();
            node.set('label', jobNodesResources.jobId);


            const store = mockStore(fromJS({
                treeNodesJobs: {
                    jobs: node,
                },
            }));

            nock(BASE_URL)
                .put(`/jobs/${jobNodesResources.jobName}/${jobNodesResources.jobId}`)
                .reply(200, '');

            return store.dispatch(JobNodes.cancelJob(jobNodesResources.jobName, jobNodesResources.jobId))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });

        it('Should create an action to request a job cancel and then invalidate', () => {
            const cancelFail = rewiredJobNodes.__get__('CANCEL_JOB_FAIL_MESSAGE');
            const fetchResponseMessage = 'Job Not found';
            const expectedActions = [{
                type: JobNodes.REQUEST_CANCEL_JOB,
                jobName: jobNodesResources.jobName,
                jobId: jobNodesResources.jobId,
            },
            {
                type: snackbar.PUSH_NOTIFICATION_MESSAGE,
                message: Map({
                    message: `${cancelFail} ${jobNodesResources.jobName}/${jobNodesResources.jobId} : ${fetchResponseMessage}`,
                }),
            },
            {
                type: JobNodes.INVALIDATE_CANCEL_JOB,
                jobName: jobNodesResources.jobName,
                jobId: jobNodesResources.jobId,
            }];

            const node = new Map();
            node.set('label', jobNodesResources.jobId);


            const store = mockStore(fromJS({
                treeNodesJobs: {
                    jobs: node,
                },
            }));

            nock(BASE_URL)
                .put(`/jobs/${jobNodesResources.jobName}/${jobNodesResources.jobId}`)
                .reply(404, { message: fetchResponseMessage });

            return store.dispatch(JobNodes.cancelJob(jobNodesResources.jobName, jobNodesResources.jobId))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });
    });
});
