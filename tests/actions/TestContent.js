/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018
 */

import configureMockStore from 'redux-mock-store';
import nock from 'nock';
import thunk from 'redux-thunk';
import expect from 'expect';
import rewire from 'rewire';
import { fromJS, Map } from 'immutable';
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

    const rewiredContent = rewire('../../WebContent/js/actions/content');
    const getContentFailMessage = rewiredContent.__get__('GET_CONTENT_FAIL_MESSAGE');

    describe('openContentIfAvailbable', () => {
        const expectedNodeId = 'DummyId';
        let node = Map({
            childNodesURI: expectedNodeId,
            id: expectedNodeId,
            hasContent: true,
        });
        it('Should call fetch content causing a request action and recieve action', () => {
            const expectedActions = [
                {
                    type: contentActions.REQUEST_CONTENT,
                    nodeId: 'DummyId',
                },
                contentResources.content,
            ];

            nock(BASE_URL)
                .get(`/${expectedNodeId}`)
                .reply(200, contentResources.content);

            const store = mockStore(fromJS({
                treeNodesJobs: {
                    DummyId: node,
                },
            }));
            return store.dispatch(contentActions.openContentIfAvailable(expectedNodeId))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });

        it('Should not load content as the nodeID hasContent = false', () => {
            const expectedAction = [
                {
                    type: contentActions.REQUEST_CONTENT,
                    nodeId: expectedNodeId,
                },
                {
                    type: snackbarNotifications.PUSH_NOTIFICATION_MESSAGE,
                    message: Map({
                        message: `${getContentFailMessage} ${expectedNodeId}`,
                    }),
                },
                {
                    type: contentActions.INVALIDATE_CONTENT,
                },
            ];

            const store = mockStore(fromJS({
                treeNodesJobs: {
                    DummyId: node,
                },
            }));

            nock(BASE_URL)
                .get(`/${expectedNodeId}`)
                .reply(500, null);

            return store.dispatch(contentActions.openContentIfAvailable(expectedNodeId))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedAction);
                });
        });

        it('Should not load content as the api request will fail, should also generate invalid content action', () => {
            const expectedAction = [
                {
                    type: contentActions.INVALIDATE_CONTENT,
                }];

            node = node.set('hasContent', false);

            const store = mockStore(fromJS({
                treeNodesJobs: {
                    DummyId: node,
                },
            }));

            store.dispatch(contentActions.openContentIfAvailable(expectedNodeId));
            expect(store.getActions()).toEqual(expectedAction);
        });
    });

    describe('openRealtimeContent', () => {
        it('Should create a request and recieve action', () => {
            const expectedNodeId = 'DummyId';

            const node = new Map();
            node.set('childNodesURI', expectedNodeId);
            node.set('id', expectedNodeId);

            const expectedActions = [
                {
                    type: contentActions.REQUEST_CONTENT,
                    nodeId: expectedNodeId,
                },
                {
                    type: contentActions.RECEIVE_CONTENT,
                    label: `Real-time tail of ${node.get('label')}`,
                    content: '',
                    sourceId: expectedNodeId,
                    isContentHTML: false,
                    isContentRealtime: true,
                },
            ];

            const store = mockStore(fromJS({
                treeNodesJobs: {
                    DummyId: node,
                },
            }));

            store.dispatch(contentActions.openRealtimeContent(expectedNodeId));
            expect(store.getActions()).toEqual(expectedActions);
        });
    });

    describe.only('fetchContentNoNode', () => {
        it('Should create a request and receive action', () => {
            const nodeURI = `jobs/${contentResources.jobName}/ids/${contentResources.jobId}/files/${contentResources.fileId}`;
            const nodeNameURI = `jobs/${contentResources.jobName}/ids/${contentResources.jobId}/files`;
            const expectedActions = [
                {
                    type: contentActions.REQUEST_CONTENT,
                    nodeId: nodeURI,
                },
                {
                    type: contentActions.RECEIVE_CONTENT,
                    label: `${contentResources.jobName} - ${contentResources.jobId} - ${contentResources.fileName}`,
                    content: contentResources.DSMemberContent,
                    sourceId: nodeURI,
                    isContentHTML: false,
                    isContentRealtime: false,
                },
            ];
            const store = mockStore();

            nock(BASE_URL)
                .get(`/${nodeURI}`)
                .reply(200, contentResources.content);

            nock(BASE_URL)
                .get(`/${nodeNameURI}`)
                .reply(200, [{ ddname: contentResources.fileName, id: contentResources.fileId }]);

            return store.dispatch(contentActions.fetchContentNoNode(contentResources.jobName, contentResources.jobId, contentResources.fileId))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });

        it('Should create a request but not receive action due to no file content', () => {
            const nodeURI = `jobs/${contentResources.jobName}/ids/${contentResources.jobId}/files/${contentResources.fileId}`;
            const expectedActions = [
                {
                    type: contentActions.REQUEST_CONTENT,
                    nodeId: nodeURI,
                },
                {
                    type: snackbarNotifications.PUSH_NOTIFICATION_MESSAGE,
                    message: Map({
                        message: `${getContentFailMessage} ${nodeURI}`,
                    }),
                },
                {
                    type: contentActions.INVALIDATE_CONTENT,
                },
            ];
            const store = mockStore();

            nock(BASE_URL)
                .get(`/${nodeURI}`)
                .reply(404, null);

            return store.dispatch(contentActions.fetchContentNoNode(contentResources.jobName, contentResources.jobId, contentResources.fileId))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });

        it('Should create a request but not receive action due to no file name match', () => {
            const nodeURI = `jobs/${contentResources.jobName}/ids/${contentResources.jobId}/files/${contentResources.fileId}`;
            const nodeNameURI = `jobs/${contentResources.jobName}/ids/${contentResources.jobId}/files`;
            const expectedActions = [
                {
                    type: contentActions.REQUEST_CONTENT,
                    nodeId: nodeURI,
                },
                {
                    type: snackbarNotifications.PUSH_NOTIFICATION_MESSAGE,
                    message: Map({
                        message: `${getContentFailMessage} ${nodeURI}`,
                    }),
                },
                {
                    type: contentActions.INVALIDATE_CONTENT,
                },
            ];
            const store = mockStore();

            nock(BASE_URL)
                .get(`/${nodeURI}`)
                .reply(200, contentResources.content);

            nock(BASE_URL)
                .get(`/${nodeNameURI}`)
                .reply(500, null);

            return store.dispatch(contentActions.fetchContentNoNode(contentResources.jobName, contentResources.jobId, contentResources.fileId))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });
    });
});
