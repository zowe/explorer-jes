import { DEFAULT_TITLE } from '../reducers/windowTitle';

/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2019
 */
export const SET_TITLE = 'SET_TITLE';
export const RESET_TITLE = 'RESET_TITLE';

function setTitle(title) {
    return {
        type: SET_TITLE,
        title,
    };
}

function resetTitle() {
    return {
        type: RESET_TITLE,
    };
}

export function updateTitle(title = DEFAULT_TITLE) {
    return dispatch => {
        document.title = title;

        if (title === DEFAULT_TITLE) {
            return dispatch(resetTitle(title));
        }
        return dispatch(setTitle(title));
    };
}
