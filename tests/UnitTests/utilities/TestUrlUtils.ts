/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import expect from 'expect';
import { isValidJobName, isValidJobId, isValidFileId } from '../../../WebContent/js/utilities/urlUtils';

describe('Utility: urlUtils', () => {
    describe('isValidJobName', () => {
        ['DEMOJOB', 'A', 'IZUSVR1', '@JOB#1$', 'abcdefgh'].forEach(name => {
            it(`accepts ${name}`, () => expect(isValidJobName(name)).toBe(true));
        });
        ['', '..', '.', 'A/B', 'A?B', 'A%2FB', '1JOB', 'TOOLONGNAME', 'A B', undefined, null, 1].forEach(name => {
            it(`rejects ${String(name)}`, () => expect(isValidJobName(name)).toBe(false));
        });
    });

    describe('isValidJobId', () => {
        ['JOB12345', 'J0012345', 'STC00012', 'TSU01234', 'S0012345', 'T0001234'].forEach(id => {
            it(`accepts ${id}`, () => expect(isValidJobId(id)).toBe(true));
        });
        ['', '..', '../../../../?', 'JOB1/../x', 'JOB12345?a=b', 'JOB123456', '1JOB', 'J', undefined, null].forEach(id => {
            it(`rejects ${String(id)}`, () => expect(isValidJobId(id)).toBe(false));
        });
    });

    describe('isValidFileId', () => {
        ['1', '2', '102', 3].forEach(id => {
            it(`accepts ${id}`, () => expect(isValidFileId(id)).toBe(true));
        });
        ['', '..', '-1', '1.5', '1/records', '1?x', 'JCL', '12345678901', undefined, null, NaN].forEach(id => {
            it(`rejects ${String(id)}`, () => expect(isValidFileId(id)).toBe(false));
        });
    });
});
