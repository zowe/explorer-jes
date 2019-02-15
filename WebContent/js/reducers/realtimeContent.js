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
    REQUEST_REALTIME_CONTENT,
    RECEIVE_REALTIME_CONTENT,
    INVALIDATE_REALTIME_CONTENT,
    MARK_REALTIME_CONTENT_READ,
} from '../actions/realtimeContent';

const INITIAL_CONTENT_STATE = Map({
    content: null,
    isFetching: false,
    unreadLines: 0,
});


function countLines(actionContent) {
    let numLines = 0;
    if (actionContent && actionContent.length > 0) {
        numLines = actionContent.split(/\r\n|\r|\n/).length;
    }
    return numLines;
}

export default function realtimeContent(state = INITIAL_CONTENT_STATE, action) {
    switch (action.type) {
        case REQUEST_REALTIME_CONTENT:
            return state.set('isFetching', true);
        case RECEIVE_REALTIME_CONTENT:
            return state.merge({
                content: `${(state.get('content') || '') + action.content}`,
                unreadLines: state.get('unreadLines') + countLines(action.content),
                isFetching: false,
            });
        case INVALIDATE_REALTIME_CONTENT:
            return INITIAL_CONTENT_STATE;
        case MARK_REALTIME_CONTENT_READ:
            return state.set('unreadLines', 0);
        default:
            return state;
    }
}

