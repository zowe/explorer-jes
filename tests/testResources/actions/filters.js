/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018
 */

// Filters used for tree nodes tests
export const filters = {
    prefix: '',
    owner: 'JCAIN',
    returnCode: '',
    status: '',
    type: '',
    isToggled: false,
    userId: 'JCAIN',
};

export const fullyQualifiedFilters = {
    prefix: 'ATL*',
    owner: 'JCAIN',
    returnCode: '200',
    status: 'SUCCESS',
    type: 'JOB',
    isToggled: false,
    userId: 'JCAIN',
};

export const defaultFilter = {
    prefix: '*',
    owner: 'JCAIN',
    returnCode: '200',
    status: 'SUCCESS',
    type: 'JOB',
    isToggled: false,
    userId: 'JCAIN',
};

// Filters for actual filters tests
export const filterValues = {
    prefix: 'pref',
    owner: 'own',
    status: 'stat',
    type: 'type',
    isToggled: false,
    userId: 'me',
};

export const filterValuesSpecialChars = {
    prefix: '*pre*f',
    owner: "'ow'n%",
    status: '@sta`t`',
    type: 'typePO+`get`',
    isToggled: false,
    userId: 'm',
};
