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
    REQUEST_CONTENT,
    RECEIVE_CONTENT,
    INVALIDATE_CONTENT,
} from '../actions/content';

const INITIAL_CONTENT_STATE = Map({
    content: null,
    isFetching: false,
    label: '',
});

const CONTENT_UNABLE_TO_RETRIEVE_MESSAGE = 'Unable to retrieve content';
const FETCH_CONTENT_LOADING_MESSAGE = 'Loading:';

export default function content(state = INITIAL_CONTENT_STATE, action) {
    switch (action.type) {
        case REQUEST_CONTENT:
            return state.merge({
                isFetching: true,
                label: `${FETCH_CONTENT_LOADING_MESSAGE} ${action.fileLabel}`,
            });
        case RECEIVE_CONTENT:
            return state.merge({
                label: `${action.jobName} - ${action.jobId} - ${action.fileLabel}`,
                content: action.content,
                isFetching: false,
            });
        case INVALIDATE_CONTENT:
            return state.merge({
                isFetching: false,
                label: CONTENT_UNABLE_TO_RETRIEVE_MESSAGE,
                content: CONTENT_UNABLE_TO_RETRIEVE_MESSAGE,
            });
        default:
            return state;
    }
}
