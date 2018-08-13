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
import thunk from 'redux-thunk';
import nock from 'nock';
import expect from 'expect';
import * as validation from '../../WebContent/js/actions/validation';
import {
    LOCAL_HOST_ENDPOINT,
    LOCAL_HOST_SERVER_WITH_PROTOCOL,
} from '../testResources/hostConstants';
import portConfig from '../../WebContent/portConfig.json';

describe('Action: validation', () => {
    afterEach(() => {
        nock.cleanAll();
    });

    const middlewares = [thunk];
    const mockStore = configureMockStore(middlewares);

    describe('validateUser', () => {
        it('Should create an action to request and then receive validation along with grabbing and setting port', () => {
            const username = { username: 'JCAIN' };
            const expectedActions = [
                {
                    type: validation.REQUEST_VALIDATION,
                },
                {
                    type: validation.RECEIVE_VALIDATION,
                    username: 'JCAIN',
                },
            ];
            nock(`${LOCAL_HOST_SERVER_WITH_PROTOCOL}`)
                .get('/ZLUX/plugins/com.ibm.atlas.atlasMVS/web/portConfig.json')
                .reply(200, portConfig);

            nock(LOCAL_HOST_ENDPOINT)
                .get('/zos/username')
                .reply(200, username);

            const store = mockStore();

            return store.dispatch(validation.validateUser())
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });

        it('Should create an action to request and then invalidate as no data is received', () => {
            const expectedActions = [
                { type: validation.REQUEST_VALIDATION },
                { type: validation.INVALIDATE_VALIDATION },
            ];

            nock(LOCAL_HOST_ENDPOINT)
                .get('/zos/username')
                .reply(500, '');

            const store = mockStore();

            return store.dispatch(validation.validateUser())
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });
    });
});
