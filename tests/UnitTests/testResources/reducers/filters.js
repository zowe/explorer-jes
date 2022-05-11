/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2020
 */

import { Record } from 'immutable';

export const DEFAULT_USER = 'JCAIN';

export const BASE_FILTER_RECORD =
    Record({
        prefix: '*',
        owner: '',
        status: '',
        jobId: '*',
        expand: false,
        showDD: '',
        isToggled: false,
    });

export const USER_SET_FILTER_RECORD =
    Record({
        prefix: '*',
        owner: DEFAULT_USER,
        status: '',
        jobId: '*',
        expand: false,
        showDD: '',
        isToggled: true,
    });

export const OWNER_SET_FILTER_RECORD =
    Record({
        prefix: '*',
        owner: DEFAULT_USER,
        status: '',
        jobId: '*',
        isToggled: false,
    });

export const TOGGLED_FILTER_RECORD =
    Record({
        prefix: '*',
        owner: '',
        status: '',
        jobId: '*',
        expand: false,
        showDD: '',
        isToggled: true,
    });

export const PREFIXED_FILTER_RECORD =
    Record({
        prefix: 'test',
        owner: '',
        status: '',
        jobId: '*',
        expand: false,
        showDD: '',
        isToggled: false,
    });

export const FULLY_SET_FILTER_RECORD =
    Record({
        prefix: 'test',
        owner: DEFAULT_USER,
        status: 'ACTIVE',
        jobId: '*',
        expand: false,
        showDD: '',
        isToggled: true,
    });

export const SPECIAL_CHARS_FILTER_RECORD =
    Record({
        prefix: '"test"',
        owner: "!@£$%^&*&^%$£@'test'",
        status: 'ACTIVE',
        jobId: '*',
        expand: false,
        showDD: '',
        isToggled: true,
    });

export const USER_SPECIAL_CHARS_FILTER_RECORD =
    Record({
        prefix: '*',
        owner: "!@£$%^&*&^%$£@'test'{C}<I>[C]`S`汉语/漢語Wałęsa æøå",
        status: '',
        jobId: '*',
        isToggled: true,
    });

export const LOADING_FILTER_RECORD =
    Record({
        prefix: '*',
        owner: '',
        status: '',
        jobId: '*',
        isToggled: false,
    });
