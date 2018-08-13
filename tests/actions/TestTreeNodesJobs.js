/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018
 */

/* eslint-env mocha */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import expect from 'expect';
import rewire from 'rewire';
import { fromJS, List, Map } from 'immutable';
import * as treeNodesJobs from '../../WebContent/js/actions/treeNodesJobs';
import * as snackbar from '../../WebContent/js/actions/snackbarNotifications';
import { ROOT_NODE_ID, JOB_INSTANCE_NODE_TYPE } from '../../WebContent/js/reducers/treeNodesJobs';
import { LOCAL_HOST_ENDPOINT as BASE_URL } from '../testResources/hostConstants';

import * as treeNodesJobsResources from '../testResources/actions/treeNodesJobs';
import * as filtersResources from '../testResources/actions/filters';

describe('Action: treeNode', () => {
    afterEach(() => {
        nock.cleanAll();
    });

    // Use Rewire to export private functions
    const rewiredTreeNodesJobs = rewire('../../WebContent/js/actions/treeNodesJobs');
    const rewiredShouldFetchChildren = rewiredTreeNodesJobs.__get__('shouldFetchChildren');
    const rewiredconstructFullyQualifiedURI = rewiredTreeNodesJobs.__get__('constructFullyQualifiedURI');
    const rewiredFindAllNodesToRefresh = rewiredTreeNodesJobs.__get__('findAllNodesToRefresh');
    const rewiredFetchFailed = rewiredTreeNodesJobs.__get__('FETCH_CHILDREN_FAIL_MESSAGE');

    const middlewares = [thunk];
    const mockStore = configureMockStore(middlewares);

    describe('selectNode', () => {
        it('Should create an action to show a specific node has been selected', () => {
            const expectedNodeId = 'DummyNodeID';
            const expectedAction = {
                type: treeNodesJobs.SELECT_NODE,
                nodeId: expectedNodeId,
            };
            expect(treeNodesJobs.selectNode(expectedNodeId)).toEqual(expectedAction);
        });
    });

    describe('toggle', () => {
        it('Should create an action to show a node has been toggled', () => {
            const expectedNodeId = 'DummyNodeID';
            const expectedAction = {
                type: treeNodesJobs.TOGGLE_NODE,
                nodeId: expectedNodeId,
            };
            expect(treeNodesJobs.toggle(expectedNodeId)).toEqual(expectedAction);
        });
    });

    describe('shouldFetchChildren', () => {
        it("Should return true as childIds is empty list, childNodesURI exists and isn't currently fetching children", () => {
            const node = Map({
                childNodesURI: 'sampleURI',
                childIds: List([]),
                isFetchingChildren: false,
            });

            expect(rewiredShouldFetchChildren(node)).toEqual(true);
        });

        it("Should return false as there's no childNodesURI", () => {
            const node = Map({
                childNodesURI: '',
                childIds: List([]),
                isFetchingChildren: false,
            });

            expect(rewiredShouldFetchChildren(node)).toEqual(false);
        });

        it("Should return false as childIds is not empty thus it's already fetched stuff", () => {
            const node = Map({
                childNodesURI: 'sampleURI',
                childIds: List(['sample']),
                isFetchingChildren: false,
            });

            expect(rewiredShouldFetchChildren(node)).toEqual(false);
        });

        it("Should return false as it's already set to be fetching children", () => {
            const node = Map({
                childNodesURI: 'sampleURI',
                childIds: List([]),
                isFetchingChildren: true,
            });

            expect(rewiredShouldFetchChildren(node)).toEqual(false);
        });
    });

    describe('constructURI', () => {
        it('Should return a string of a uri with all api parameters set even thought they havent been set in the filters', () => {
            const baseURI = 'jobs?owner=';
            const expectedURI =
                `${baseURI + filtersResources.filters.owner}&prefix=*&returnCode=*&type=*`;

            expect(rewiredconstructFullyQualifiedURI(baseURI, filtersResources.filters)).toEqual(expectedURI);
        });

        it('Should return a string of a uri with all api parameters set even thought they havent been set in the filters', () => {
            const baseURI = 'jobs?owner=';
            const expectedURI =
                `${baseURI + filtersResources.fullyQualifiedFilters.owner
                }&prefix=${filtersResources.fullyQualifiedFilters.prefix
                }&returnCode=${filtersResources.fullyQualifiedFilters.returnCode
                }&type=${filtersResources.fullyQualifiedFilters.type
                }&status=${filtersResources.fullyQualifiedFilters.status}`;

            expect(rewiredconstructFullyQualifiedURI(baseURI, filtersResources.fullyQualifiedFilters)).toEqual(expectedURI);
        });
    });

    describe('toggleAndFetchChildrenIfNeeded', () => {
        it('Should create 3 Actions, TOGGLE_NODE, REQUEST_CHILDREN, RECEIVE_CHILDREN.' +
            'childData should also be recieved in the RECEIVE_CHILDREN action', () => {
            const expectedNodeId = 'DummyId';
            const expectedActions = [
                {
                    type: treeNodesJobs.TOGGLE_NODE,
                    nodeId: expectedNodeId,
                },
                {
                    type: treeNodesJobs.REQUEST_CHILDREN,
                    nodeId: expectedNodeId,
                },
                {
                    type: treeNodesJobs.RECEIVE_CHILDREN,
                    nodeId: expectedNodeId,
                    childData: treeNodesJobsResources.children,
                    autoExpandChildren: false,
                },
            ];
            const childNodesURI = 'jobs/ATLJ0001/ids/DummyJob/files';

            const node = Map({
                childNodesURI,
                id: expectedNodeId,
                childIds: List([]),
                isFetchingChildren: false,
            });

            nock(BASE_URL)
                .get(`/${childNodesURI}`)
                .reply(200, treeNodesJobsResources.children);

            const store = mockStore(fromJS({
                treeNodesJobs: {
                    DummyId: node,
                },
            }));

            return store.dispatch(treeNodesJobs.toggleAndFetchChildrenIfNeeded(expectedNodeId, {}))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });

        it('Should create 3 Actions, TOGGLE_NODE, REQUEST_CHILDREN, INVALIDATE_CHILDREN as no child data is returned', () => {
            const expectedNodeId = 'DummyId';
            const expectedActions = [
                {
                    type: treeNodesJobs.TOGGLE_NODE,
                    nodeId: expectedNodeId,
                },
                {
                    type: treeNodesJobs.REQUEST_CHILDREN,
                    nodeId: expectedNodeId,
                },
                {
                    type: snackbar.PUSH_NOTIFICATION_MESSAGE,
                    message: Map({
                        message: `${rewiredFetchFailed} ${expectedNodeId}`,
                    }),
                },
                {
                    type: treeNodesJobs.INVALIDATE_CHILDREN,
                    nodeId: expectedNodeId,
                },
            ];
            const childNodesURI = 'jobs/ATLJ0001/ids/DummyJob/files';

            const node = Map({
                childNodesURI,
                id: expectedNodeId,
                childIds: List([]),
                isFetchingChildren: false,
            });

            nock(BASE_URL)
                .get(`/${childNodesURI}`)
                .reply(500, null);

            const store = mockStore(fromJS({
                treeNodesJobs: {
                    DummyId: node,
                },
            }));

            return store.dispatch(treeNodesJobs.toggleAndFetchChildrenIfNeeded(expectedNodeId, {}))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });
    });

    // The only difference here is fetchChildren no check doesn't toggle or check if the node will have children
    describe('fetchChildrenNoCheck', () => {
        it('Should create an action to request and then receive children based on default filters ', () => {
            const expectedNodeId = ROOT_NODE_ID;
            const expectedActions = [
                {
                    type: treeNodesJobs.REQUEST_CHILDREN,
                    nodeId: expectedNodeId,
                },
                {
                    type: treeNodesJobs.RECEIVE_CHILDREN,
                    nodeId: expectedNodeId,
                    childData: treeNodesJobsResources.children,
                    autoExpandChildren: false,
                },
            ];
            const childNodesURI = 'jobs?owner=';

            const node = Map({
                childNodesURI,
                id: expectedNodeId,
                childIds: List([]),
                isFetchingChildren: false,
            });

            nock(BASE_URL)
                .get(`/${childNodesURI}JCAIN&prefix=*&returnCode=200&type=JOB&status=SUCCESS`)
                .reply(200, treeNodesJobsResources.children);

            const store = mockStore(fromJS({
                treeNodesJobs: {
                    jobs: node,
                },
            }));

            return store.dispatch(treeNodesJobs.fetchChildrenNoCheck(filtersResources.defaultFilter))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });
    });

    describe('findAllNodesTorefresh', () => {
        it('Should return an array of nodes for refreshing based on them having children and the nodeType', () => {
            const expectedNodes = ['jobs', 'jobs/JCAIN/ids/TSU01314'];
            expect(rewiredFindAllNodesToRefresh(treeNodesJobsResources.state, 'jobs')).toEqual(expectedNodes);
        });
    });

    describe('purgeJobs', () => {
        it('Should create an action to request a job purge and then receive validation', () => {
            const purgeFail = rewiredTreeNodesJobs.__get__('PURGE_JOB_SUCCESS_MESSAGE');
            const expectedJobName = 'ATLJ0001';
            const expectedJobId = 'jobID3748';

            const expectedActions = [{
                type: treeNodesJobs.REQUEST_PURGE_JOB,
                jobName: expectedJobName,
                jobId: expectedJobId,
            },
            {
                type: snackbar.PUSH_NOTIFICATION_MESSAGE,
                message: Map({
                    message: `${purgeFail} ${expectedJobName}/${expectedJobId}`,
                }),
            },
            {
                type: treeNodesJobs.RECEIVE_PURGE_JOB,
                jobName: expectedJobName,
                jobId: expectedJobId,
            }];

            const node = new Map();
            node.set('nodeType', JOB_INSTANCE_NODE_TYPE);
            node.set('label', expectedJobId);


            const store = mockStore(fromJS({
                treeNodesJobs: {
                    jobs: node,
                },
            }));

            nock(BASE_URL)
                .delete(`/${expectedJobName}/${expectedJobId}`)
                .reply(200, '');

            return store.dispatch(treeNodesJobs.purgeJob(expectedJobName, expectedJobId))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });

        it('Should create an action to request a job purge and then invalidate', () => {
            const purgeFail = rewiredTreeNodesJobs.__get__('PURGE_JOB_FAIL_MESSAGE');
            const expectedJobName = 'ATLJ0001';
            const expectedJobId = 'jobID3748';

            const expectedActions = [{
                type: treeNodesJobs.REQUEST_PURGE_JOB,
                jobName: expectedJobName,
                jobId: expectedJobId,
            },
            {
                type: snackbar.PUSH_NOTIFICATION_MESSAGE,
                message: Map({
                    message: `${purgeFail} ${expectedJobName}/${expectedJobId}`,
                }),
            },
            {
                type: treeNodesJobs.INVALIDATE_PURGE_JOB,
                jobName: expectedJobName,
                jobId: expectedJobId,
            }];

            const node = new Map();
            node.set('nodeType', JOB_INSTANCE_NODE_TYPE);
            node.set('label', expectedJobId);


            const store = mockStore(fromJS({
                treeNodesJobs: {
                    jobs: node,
                },
            }));

            nock(BASE_URL)
                .delete(`${expectedJobName}/${expectedJobId}`)
                .reply(404, '');

            return store.dispatch(treeNodesJobs.purgeJob(expectedJobName, expectedJobId))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });
    });
});
