/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2019
 */

import { Map } from 'immutable';

import {
    SET_TITLE,
    RESET_TITLE,
} from '../actions/windowTitle';

export const DEFAULT_TITLE = 'JES Explorer';
const INITIAL_CONTENT_STATE = Map({
    title: DEFAULT_TITLE,
});

export default function content(state = INITIAL_CONTENT_STATE, action) {
    switch (action.type) {
        case SET_TITLE:
            return state.merge({
                title: action.title,
            });
        case RESET_TITLE:
            return state.merge({
                title: DEFAULT_TITLE,
            });
        default:
            return state;
    }
}
