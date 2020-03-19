import { fetchJobs } from './jobNodes';

/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2020
 */

export const TOGGLE_FILTERS = 'TOGGLE_FILTERS';
export const SET_FILTERS = 'SET_FILTERS';
export const RESET_FILTERS = 'RESET_FILTERS';

export function setFilters(filters) {
    return {
        type: SET_FILTERS,
        filters,
    };
}

export function resetFilters(username) {
    return {
        type: RESET_FILTERS,
        username,
    };
}

export function setOwnerAndFetchJobs(username, filters) {
    return dispatch => {
        dispatch(setFilters({ owner: username.toUpperCase() }));
        dispatch(fetchJobs({ ...filters, ...{ owner: username.toUpperCase() } }));
    };
}
