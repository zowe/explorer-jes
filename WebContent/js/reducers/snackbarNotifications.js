/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2018
 */

import { Map, List } from 'immutable';
import { PUSH_NOTIFICATION_MESSAGE, POP_NOTIFICATION_MESSAGE } from '../actions/snackbarNotifications';

const INITIAL_STATE = Map({
    messages: new List([]),
});

export default function snackbarNotifications(state = INITIAL_STATE, action) {
    switch (action.type) {
        case PUSH_NOTIFICATION_MESSAGE:
            return state.set('messages', state.get('messages').push(action.message));
        case POP_NOTIFICATION_MESSAGE:
            return state.set('messages', state.get('messages').pop());
        default:
            return state;
    }
}
