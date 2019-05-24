/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */

import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import { Filters } from '../../WebContent/js/containers/Filters';

// window really exists at runtime, but the tests don't know this, so we mock it here for app2app use downstream
global.window = {};
global.window.addEventListener = () => {};

function setUpOwnerAndPrefix(owner, prefix) {
    const props = {
        prefix,
        owner,
        returnCode: '',
        status: '',
        type: '',
        jobId: '',
        userId: '',
        isToggled: true,
        dispatch: () => {},
    };

    return shallow(<Filters {...props} />);
}

function testOwnerAndPrefixError(owner, prefix, expectedWild, expectedMessageEmpty) {
    const filters = setUpOwnerAndPrefix(owner, prefix);
    it(`isOwnerAndPrefixWild should be ${expectedWild}`, () => {
        expect(filters.instance().isOwnerAndPrefixWild()).toEqual(expectedWild);
    });

    it(`getOwnerAndPrefixErrorText should ${!expectedMessageEmpty ? 'not' : ''} be empty`, () => {
        expect(filters.instance().getOwnerAndPrefixErrorText() === '').toEqual(expectedMessageEmpty);
    });
}

describe('Container: Filters', () => {
    describe('When owner and prefix are both *', () => {
        testOwnerAndPrefixError('*', '*', true, false);
    });

    describe('When only owner is *', () => {
        testOwnerAndPrefixError('*', 'junk', false, true);
        testOwnerAndPrefixError('*', '*junk*', false, true);
    });

    describe('When only prefix is *', () => {
        testOwnerAndPrefixError('junk', '*', false, true);
        testOwnerAndPrefixError('*junk*', '*', false, true);
    });

    describe('When neither owner or prefix is *', () => {
        testOwnerAndPrefixError('junk', 'junk', false, true);
        testOwnerAndPrefixError('*junk*', '*junk*', false, true);
    });
});
