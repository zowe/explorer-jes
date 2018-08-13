/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018
 */

import expect from 'expect';
import filter from '../../WebContent/js/reducers/filters';
import * as filterActions from '../../WebContent/js/actions/filters';
import * as filterResources from '../testResources/reducers/filters';

describe('Reducer: filters', () => {
    // As we are using an immutable Record the toEqual method is not sufficent for comparison,
    // using JSON.stringify will allow objects to be compared successfully

    function prepareRecord(record) {
        return JSON.stringify(record);
    }

    it('Should return the INITIAL_STATE', () => {
        expect(prepareRecord(filter(undefined, {}))).toEqual(prepareRecord(new filterResources.BASE_FILTER_RECORD()));
    });

    it('Should handle TOGGLE_FILTERS to true', () => {
        const action = { type: filterActions.TOGGLE_FILTERS, isToggled: true };
        expect(prepareRecord(filter(new filterResources.BASE_FILTER_RECORD(), action))).toEqual(prepareRecord(new filterResources.TOGGLED_FILTER_RECORD()));
    });

    it('Should handle TOGGLE_FILTERS to false', () => {
        const action = { type: filterActions.TOGGLE_FILTERS, isToggled: false };
        expect(prepareRecord(filter(new filterResources.TOGGLED_FILTER_RECORD(), action))).toEqual(prepareRecord(new filterResources.BASE_FILTER_RECORD()));
    });

    it('Should handle SET_FILTERS individual value prefix', () => {
        const action = {
            type: filterActions.SET_FILTERS,
            filters: { prefix: 'test' },
        };
        expect(prepareRecord(filter(new filterResources.BASE_FILTER_RECORD(), action))).toEqual(prepareRecord(new filterResources.PREFIXED_FILTER_RECORD()));
    });

    it('Should handle SET_FILTERS individual value prefix overwrite', () => {
        const action = {
            type: filterActions.SET_FILTERS,
            filters: { prefix: '*' },
        };
        expect(prepareRecord(filter(new filterResources.PREFIXED_FILTER_RECORD(), action))).toEqual(prepareRecord(new filterResources.BASE_FILTER_RECORD()));
    });

    it('Should handle SET_FILTERS all values', () => {
        const action = {
            type: filterActions.SET_FILTERS,
            filters: new filterResources.FULLY_SET_FILTER_RECORD(),
        };
        expect(prepareRecord(filter(new filterResources.BASE_FILTER_RECORD(), action))).toEqual(prepareRecord(new filterResources.FULLY_SET_FILTER_RECORD()));
    });

    it('Should handle SET_FILTERS with special characters', () => {
        const action = {
            type: filterActions.SET_FILTERS,
            filters: new filterResources.SPECIAL_CHARS_FILTER_RECORD(),
        };
        expect(prepareRecord(filter(new filterResources.BASE_FILTER_RECORD(), action))).toEqual(prepareRecord(new filterResources.SPECIAL_CHARS_FILTER_RECORD()));
    });

    it('Should handle RESET_FILTERS', () => {
        const action = {
            type: filterActions.RESET_FILTERS,
            filters: new filterResources.USER_SET_FILTER_RECORD(),
        };
        expect(prepareRecord(filter(new filterResources.FULLY_SET_FILTER_RECORD(), action))).toEqual(prepareRecord(new filterResources.USER_SET_FILTER_RECORD()));
    });

    it('Should handle RESET_FILTERS no userId', () => {
        const action = {
            type: filterActions.RESET_FILTERS,
            filters: new filterResources.OWNER_SET_FILTER_RECORD(),
        };
        expect(prepareRecord(filter(new filterResources.OWNER_SET_FILTER_RECORD(), action))).toEqual(prepareRecord(new filterResources.BASE_FILTER_RECORD()));
    });

    it('Should handle REQUEST_USER_ID and set owner to Loading...', () => {
        const action = { type: filterActions.REQUEST_USER_ID };
        expect(prepareRecord(filter(new filterResources.BASE_FILTER_RECORD(), action))).toEqual(prepareRecord(new filterResources.LOADING_FILTER_RECORD()));
    });

    it('Should handle RECEIVE_USER_ID and set owner and userId', () => {
        const action = {
            type: filterActions.RECEIVE_USER_ID,
            userId: 'JCAIN',
            owner: 'JCAIN',
        };
        expect(prepareRecord(filter(new filterResources.TOGGLED_FILTER_RECORD(), action))).toEqual(prepareRecord(new filterResources.USER_SET_FILTER_RECORD()));
    });

    it('Should handle RECEIVE_USER_ID and set owner and userId with special chars', () => {
        const action = {
            type: filterActions.RECEIVE_USER_ID,
            userId: "!@£$%^&*&^%$£@'test'{C}<I>[C]`S`汉语/漢語Wałęsa æøå",
            owner: "!@£$%^&*&^%$£@'test'{C}<I>[C]`S`汉语/漢語Wałęsa æøå",
        };
        expect(prepareRecord(filter(new filterResources.TOGGLED_FILTER_RECORD(), action))).toEqual(prepareRecord(new filterResources.USER_SPECIAL_CHARS_FILTER_RECORD()));
    });
});
