/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2018
 */

import { Map } from 'immutable';
import {
    REQUEST_CONTENT,
    RECEIVE_CONTENT,
    INVALIDATE_CONTENT,
    INVALIDATE_CONTENT_IF_OPEN,
} from '../actions/content';

const INITIAL_CONTENT_STATE = Map({
    sourceId: null,
    content: null,
    isContentHTML: false,
    isContentRealtime: false,
    isFetching: false,
    label: '',
});

const CONTENT_NOT_AVAILABLE_MESSAGE = 'Content not available';
const CONTENT_UNABLE_TO_RETRIEVE_MESSAGE = 'Unable to retrieve content';

export default function content(state = INITIAL_CONTENT_STATE, action) {
    switch (action.type) {
        case REQUEST_CONTENT:
            return state.merge({
                isFetching: true,
            });
        case RECEIVE_CONTENT:
            return state.merge({
                sourceId: action.sourceId,
                label: action.label,
                content: action.content,
                isContentHTML: !!action.isContentHTML,
                isContentRealtime: !!action.isContentRealtime,
                isFetching: false,
            });
        case INVALIDATE_CONTENT:
            return state.merge({
                isFetching: false,
                sourceId: undefined,
                label: CONTENT_UNABLE_TO_RETRIEVE_MESSAGE,
                content: CONTENT_UNABLE_TO_RETRIEVE_MESSAGE,
                isContentHTML: undefined,
                isContentRealtime: undefined,
            });
        case INVALIDATE_CONTENT_IF_OPEN:
            if (action.path === state.label) {
                return state.merge({
                    isFetching: false,
                    sourceId: undefined,
                    label: CONTENT_NOT_AVAILABLE_MESSAGE,
                    content: CONTENT_NOT_AVAILABLE_MESSAGE,
                    isContentHTML: undefined,
                    isContentRealtime: undefined,
                });
            }
            return state;
        default:
            return state;
    }
}
