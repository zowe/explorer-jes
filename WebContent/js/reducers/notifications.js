/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { Map, List } from 'immutable';
import {
    PUSH_NOTIFICATION, POP_NOTIFICATION, CLEAR_NOTIFICATIONS,
} from '../actions/notifications';

const INITIAL_STATE = Map({
    messages: List([]),
});

export default function notifications(state = INITIAL_STATE, action) {
    switch (action.type) {
        case PUSH_NOTIFICATION:
            return state.set('messages', state.get('messages').push(Map(action.notification)));

        case POP_NOTIFICATION:
            return state.set('messages', state.get('messages').shift());

        case CLEAR_NOTIFICATIONS:
            return state.set('messages', List([]));

        default:
            return state;
    }
}
