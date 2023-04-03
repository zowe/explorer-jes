/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2020
 */

export const testUsername = 'ibmuser';

export const validationQueryResponse = {
    domain: 'SAFRealm',
    userId: testUsername,
    creation: '2020-01-31T19:11:47.000+0000',
    expiration: '2020-02-01T19:11:47.000+0000',
};

export const validationQueryInvalidTokenResponse = {
    messages: [
        {
            messageType: 'ERROR',
            messageNumber: 'ZWEAG130E',
            messageContent: "Token is not valid for URL '/gateway/api/v1/auth/query'",
            messageKey: 'apiml.security.query.invalidToken',
        }],
};

export const validationLoginInvalidPasswordResponse = {
    messages: [
        {
            messageType: 'ERROR',
            messageNumber: 'ZWEAG120E',
            messageContent: "Invalid username or password for URL '/gateway/api/v1/auth/login'",
            messageKey: 'apiml.security.login.invalidCredentials',
        },
    ],
};
