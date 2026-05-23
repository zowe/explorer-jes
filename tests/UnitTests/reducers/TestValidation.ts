/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2020
 */

import expect from 'expect';
import validation from '../../../WebContent/js/reducers/validation';
import * as validationActions from '../../../WebContent/js/actions/validation';
import * as validationResources from '../testResources/reducers/validation';

describe('Reducer: validation', () => {
    it('Should return the INITIAL_STATE', () => {
        expect(validation(undefined, {})).toEqual(validationResources.baseValidation);
    });

    it('Should handle REQUEST_VALIDATION and set requested to true', () => {
        const action = { type: validationActions.REQUEST_VALIDATION };
        expect(validation(validationResources.baseValidation, action)).toEqual(validationResources.requestedValidation);
    });

    it('Should handle RECEIVE_VALIDATION and set the username', () => {
        const action = { type: validationActions.RECEIVE_VALIDATION, username: 'dummyUser' };
        expect(validation(validationResources.requestedValidation, action)).toEqual(validationResources.receivedValidation);
    });

    it('Should handle RECEIVE_VALIDATION and set the username with special chars', () => {
        const action = { type: validationActions.RECEIVE_VALIDATION, username: "!@£$%^&*&^%$£@'test'{C}<I>[C]`S`汉语/漢語Wałęsa æøå" };
        expect(validation(validationResources.requestedValidation, action)).toEqual(validationResources.receivedSpecialCharsValidation);
    });

    it('Should handle INVALIDATE_VALIDATION and set validated to false after already validating', () => {
        const action = { type: validationActions.INVALIDATE_VALIDATION };
        expect(validation(validationResources.receivedValidation, action)).toEqual(validationResources.invalidatedValidation);
    });

    it('Should handle INVALIDATE_VALIDATION and set validated to false after requested', () => {
        const action = { type: validationActions.INVALIDATE_VALIDATION };
        expect(validation(validationResources.requestedValidation, action)).toEqual(validationResources.invalidatedValidationNoUser);
    });
});
