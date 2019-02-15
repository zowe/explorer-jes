/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */

import { Record } from 'immutable';

export const BASE_FILTER_RECORD =
    Record({
        prefix: '*',
        owner: '',
        status: '',
        jobId: '*',
        isToggled: false,
        userId: '',
    });

export const USER_SET_FILTER_RECORD =
    Record({
        prefix: '*',
        owner: 'JCAIN',
        status: '',
        jobId: '*',
        isToggled: true,
        userId: 'JCAIN',
    });

export const OWNER_SET_FILTER_RECORD =
    Record({
        prefix: '*',
        owner: 'JCAIN',
        status: '',
        jobId: '*',
        isToggled: false,
        userId: '',
    });

export const TOGGLED_FILTER_RECORD =
    Record({
        prefix: '*',
        owner: '',
        status: '',
        jobId: '*',
        isToggled: true,
        userId: '',
    });

export const PREFIXED_FILTER_RECORD =
    Record({
        prefix: 'test',
        owner: '',
        status: '',
        jobId: '*',
        isToggled: false,
        userId: '',
    });

export const FULLY_SET_FILTER_RECORD =
    Record({
        prefix: 'test',
        owner: 'user',
        status: 'ACTIVE',
        jobId: '*',
        isToggled: true,
        userId: 'JCAIN',
    });

export const SPECIAL_CHARS_FILTER_RECORD =
    Record({
        prefix: '"test"',
        owner: "!@£$%^&*&^%$£@'test'",
        status: 'ACTIVE',
        jobId: '*',
        isToggled: true,
        userId: "!@£$%^&*&^%$£@'test'汉语/漢語Wałęsa æøå",
    });

export const USER_SPECIAL_CHARS_FILTER_RECORD =
    Record({
        prefix: '*',
        owner: "!@£$%^&*&^%$£@'test'{C}<I>[C]`S`汉语/漢語Wałęsa æøå",
        status: '',
        jobId: '*',
        isToggled: true,
        userId: "!@£$%^&*&^%$£@'test'{C}<I>[C]`S`汉语/漢語Wałęsa æøå",
    });

export const LOADING_FILTER_RECORD =
    Record({
        prefix: '*',
        owner: 'Loading...',
        status: '',
        jobId: '*',
        isToggled: false,
        userId: '',
    });
