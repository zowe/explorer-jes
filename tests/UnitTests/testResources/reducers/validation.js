/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2020
 */

import { Map } from 'immutable';

export const baseValidation = Map({
    validated: false,
    isValidating: false,
    username: '',
    message: '',
});

export const requestedValidation = Map({
    validated: false,
    isValidating: true,
    username: '',
    message: '',
});

export const receivedValidation = Map({
    validated: true,
    isValidating: false,
    username: 'dummyUser',
    message: '',
});

export const invalidatedValidation = Map({
    validated: false,
    isValidating: false,
    username: 'dummyUser',
    message: '',
});

export const receivedSpecialCharsValidation = Map({
    validated: true,
    isValidating: false,
    username: "!@£$%^&*&^%$£@'test'{C}<I>[C]`S`汉语/漢語Wałęsa æøå",
    message: '',
});
