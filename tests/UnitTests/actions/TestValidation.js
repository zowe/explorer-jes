/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2020
 */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import expect from 'expect';
import * as validation from '../../../WebContent/js/actions/validation';
import * as validationResources from '../testResources/actions/validation';
import {
    LOCAL_HOST_SERVER_WITH_PROTOCOL,
} from '../testResources/hostConstants';

describe('Action: validation', () => {
    afterEach(() => {
        nock.cleanAll();
    });

    const middlewares = [thunk];
    const mockStore = configureMockStore(middlewares);

    describe('validateUser', () => {
        it('Should create an action to request and then receive validation along with grabbing username', () => {
            const expectedActions = [
                {
                    type: validation.REQUEST_VALIDATION,
                },
                {
                    type: validation.RECEIVE_VALIDATION,
                    username: validationResources.testUsername,
                },
            ];
            nock(LOCAL_HOST_SERVER_WITH_PROTOCOL)
                .get('/api/v1/gateway/auth/query')
                .reply(200, validationResources.validationQueryResponse);

            const store = mockStore();

            return store.dispatch(validation.validateUser())
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });

        it('Should create an action to request and then invalidate', () => {
            const expectedActions = [
                { type: validation.REQUEST_VALIDATION },
                {
                    type: validation.INVALIDATE_VALIDATION,
                    message: validation.constructValidationErrorMessage(validationResources.validationQueryInvalidTokenResponse.messages[0]),
                },
            ];

            nock(LOCAL_HOST_SERVER_WITH_PROTOCOL)
                .get('/api/v1/gateway/auth/query')
                .reply(401, validationResources.validationQueryInvalidTokenResponse);

            const store = mockStore();

            return store.dispatch(validation.validateUser())
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });
    });

    describe('loginUser', () => {
        it('Should create an action to request and then receive validation along with setting username', () => {
            const expectedActions = [
                {
                    type: validation.REQUEST_VALIDATION,
                },
                {
                    type: validation.RECEIVE_VALIDATION,
                    username: validationResources.testUsername,
                },
            ];

            nock(LOCAL_HOST_SERVER_WITH_PROTOCOL)
                .post('/api/v1/gateway/auth/login')
                .reply(201, '');

            const store = mockStore();

            return store.dispatch(validation.loginUser(validationResources.testUsername, 'dummypass'))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });

        it('Should create an action to request but not receive due to invalid credentials', () => {
            const expectedActions = [
                {
                    type: validation.REQUEST_VALIDATION,
                },
                {
                    type: validation.INVALIDATE_VALIDATION,
                    message: validation.constructValidationErrorMessage(validationResources.validationLoginInvalidPasswordResponse.messages[0]),
                },
            ];

            nock(LOCAL_HOST_SERVER_WITH_PROTOCOL)
                .post('/api/v1/gateway/auth/login')
                .reply(401, validationResources.validationLoginInvalidPasswordResponse);

            const store = mockStore();

            return store.dispatch(validation.loginUser(validationResources.testUsername, 'dummypass'))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                });
        });
    });
});
