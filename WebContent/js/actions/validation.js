/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2020
 */

import { whichServer } from '../utilities/urlUtils';

export const REQUEST_VALIDATION = 'REQUEST_VALIDATION';
export const RECEIVE_VALIDATION = 'RECEIVE_VALIDATION';
export const INVALIDATE_VALIDATION = 'INVALIDATE_VALIDATION';
export const SET_SERVER = 'SET_SERVER';

export const VALIDATION_FAILURE_MESSAGE = 'Check for validation failed';

function requestValidation() {
    return {
        type: REQUEST_VALIDATION,
    };
}

function receiveValidation(username) {
    return {
        type: RECEIVE_VALIDATION,
        username,
    };
}

function invalidateValidation(message) {
    return {
        type: INVALIDATE_VALIDATION,
        message,
    };
}

export function checkForValidationFailure(response) {
    return dispatch => {
        if (response.status === 401) {
            dispatch(invalidateValidation());
            throw Error(VALIDATION_FAILURE_MESSAGE);
        }
        return response;
    };
}

export function constructValidationErrorMessage(errorMessageObject) {
    return `${errorMessageObject.messageNumber} : ${errorMessageObject.messageContent}`;
}

function checkResponse(response) {
    if (response.ok) {
        return response.json();
    }
    return response.json()
        .then(error => {
            throw Error(constructValidationErrorMessage(error.messages[0]));
        });
}

export function validateUser() {
    return dispatch => {
        dispatch(requestValidation());
        return fetch(
            `https://${whichServer()}/gateway/api/v1/auth/query`,
            { credentials: 'include',
                'Access-Control-Allow-Credentials': 'true' },
        )
            .then(response => {
                return checkResponse(response);
            })
            .then(json => {
                return dispatch(receiveValidation(json.userId));
            })
            .catch(error => {
                return dispatch(invalidateValidation(error.message));
            });
    };
}

export function loginUser(username, password) {
    return dispatch => {
        dispatch(requestValidation());
        return fetch(
            `https://${whichServer()}/gateway/api/v1/auth/login`,
            { method: 'POST',
                credentials: 'include',
                'Access-Control-Allow-Credentials': 'true',
                body: JSON.stringify({ username, password }) },
        )
            .then(response => {
                if (response.ok) {
                    return dispatch(receiveValidation(username));
                }
                return checkResponse(response);
            })
            .catch(error => {
                return dispatch(invalidateValidation(error.message));
            });
    };
}
