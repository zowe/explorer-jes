/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */

import configureMockStore from 'redux-mock-store';
import nock from 'nock';
import thunk from 'redux-thunk';
import expect from 'expect';
import { Map } from 'immutable';
import * as contentActions from '../../WebContent/js/actions/content';
import * as snackbarNotifications from '../../WebContent/js/actions/snackbarNotifications';
import { LOCAL_HOST_ENDPOINT as BASE_URL } from '../testResources/hostConstants';
import * as contentResources from '../testResources/actions/content';

describe('Action: content', () => {
    afterEach(() => {
        nock.cleanAll();
    });

    const middlewares = [thunk];
    const mockStore = configureMockStore(middlewares);
    const errorMessage = 'Internal Server Error';

    describe('fetchJobFile', () => {
        it('Should create an action to request and receive content', () => {
            const expectedActions = [
                {
                    type: contentActions.REQUEST_CONTENT,
                    jobName: contentResources.jobName,
                    jobId: contentResources.jobId,
                    fileLabel: contentResources.fileName,
                    fileId: contentResources.fileId,
                },
                {
                    type: contentActions.RECEIVE_CONTENT,
                    jobName: contentResources.jobName,
                    jobId: contentResources.jobId,
                    content: contentResources.jobFileContents,
                    fileLabel: contentResources.fileName,
                    fileId: contentResources.fileId,
                },
            ];

            nock(BASE_URL)
                .get(`/jobs/${contentResources.jobName}/${contentResources.jobId}/files/${contentResources.fileId}/content`)
                .reply(200, contentResources.jobFileFetchResponse);

            const store = mockStore();
            return store.dispatch(contentActions.fetchJobFile(contentResources.jobName, contentResources.jobId, contentResources.fileName, contentResources.fileId))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });

        it('Should create an action to request but not receive due to no response and create error', () => {
            const expectedActions = [
                {
                    type: contentActions.REQUEST_CONTENT,
                    jobName: contentResources.jobName,
                    jobId: contentResources.jobId,
                    fileLabel: contentResources.fileName,
                    fileId: contentResources.fileId,
                },
                {
                    type: snackbarNotifications.PUSH_NOTIFICATION_MESSAGE,
                    message: Map({
                        message: `${errorMessage} - ${contentResources.jobName}:${contentResources.jobId}:${contentResources.fileName}`,
                    }),
                },
                {
                    type: contentActions.INVALIDATE_CONTENT,
                },
            ];

            nock(BASE_URL)
                .get(`/jobs/${contentResources.jobName}/${contentResources.jobId}/files/${contentResources.fileId}/content`)
                .reply(500, { status: 'INTERNAL_SERVER_ERROR', message: errorMessage });

            const store = mockStore();
            return store.dispatch(contentActions.fetchJobFile(contentResources.jobName, contentResources.jobId, contentResources.fileName, contentResources.fileId))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });
    });

    describe('fetchJobFileNoName', () => {
        it('Should create a request and receive action', () => {
            const expectedActions = [
                {
                    type: contentActions.REQUEST_CONTENT,
                    jobName: contentResources.jobName,
                    jobId: contentResources.jobId,
                    fileLabel: '',
                    fileId: contentResources.fileId,
                },
                {
                    type: contentActions.RECEIVE_CONTENT,
                    jobName: contentResources.jobName,
                    jobId: contentResources.jobId,
                    content: contentResources.jobFileContents,
                    fileLabel: contentResources.fileName,
                    fileId: contentResources.fileId,
                },
            ];

            const store = mockStore();
            nock(BASE_URL)
                .get(`/jobs/${contentResources.jobName}/${contentResources.jobId}/files/${contentResources.fileId}/content`)
                .reply(200, contentResources.jobFileFetchResponse);
            nock(BASE_URL)
                .get(`/jobs/${contentResources.jobName}/${contentResources.jobId}/files`)
                .reply(200, contentResources.fileList);

            return store.dispatch(contentActions.fetchJobFileNoName(contentResources.jobName, contentResources.jobId, contentResources.fileId))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });

        it('Should create a request but not receive action due to no file content', () => {
            const expectedActions = [
                {
                    type: contentActions.REQUEST_CONTENT,
                    jobName: contentResources.jobName,
                    jobId: contentResources.jobId,
                    fileLabel: '',
                    fileId: contentResources.fileId,
                },
                {
                    type: snackbarNotifications.PUSH_NOTIFICATION_MESSAGE,
                    message: Map({
                        message: `${errorMessage} - ${contentResources.jobName}:${contentResources.jobId}:${contentResources.fileId}`,
                    }),
                },
                {
                    type: contentActions.INVALIDATE_CONTENT,
                },
            ];

            const store = mockStore();
            nock(BASE_URL)
                .get(`/jobs/${contentResources.jobName}/${contentResources.jobId}/files/${contentResources.fileId}/content`)
                .reply(500, { status: 'INTERNAL_SERVER_ERROR', message: errorMessage });

            return store.dispatch(contentActions.fetchJobFileNoName(contentResources.jobName, contentResources.jobId, contentResources.fileId))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });

        it('Should create a request but not receive action due to no file name match', () => {
            const nodeURI = `jobs/${contentResources.jobName}/${contentResources.jobId}/files/${contentResources.fileId}/content`;
            const nodeNameURI = `jobs/${contentResources.jobName}/${contentResources.jobId}/files`;
            const expectedActions = [
                {
                    type: contentActions.REQUEST_CONTENT,
                    jobName: contentResources.jobName,
                    jobId: contentResources.jobId,
                    fileLabel: '',
                    fileId: contentResources.fileId,
                },
                {
                    type: snackbarNotifications.PUSH_NOTIFICATION_MESSAGE,
                    message: Map({
                        message: `Error: ${errorMessage} - ${contentResources.jobName}:${contentResources.jobId}:${contentResources.fileId}`,
                    }),
                },
                {
                    type: contentActions.INVALIDATE_CONTENT,
                },
            ];
            const store = mockStore();

            nock(BASE_URL)
                .get(`/${nodeURI}`)
                .reply(200, contentResources.jobFileContents);

            nock(BASE_URL)
                .get(`/${nodeNameURI}`)
                .reply(500, { status: 'INTERNAL_SERVER_ERROR', message: errorMessage });

            return store.dispatch(contentActions.fetchJobFileNoName(contentResources.jobName, contentResources.jobId, contentResources.fileId))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });
    });
});
