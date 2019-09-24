/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2019
 */

import { Map, List } from 'immutable';
import {
    REQUEST_CONTENT,
    RECEIVE_CONTENT,
    REMOVE_CONTENT,
    CHANGE_SELECTED_CONTENT,
} from '../actions/content';

const INITIAL_CONTENT_STATE = Map({
    content: List(),
    selectedContent: 0, // Index of the current active tab content
});

function getIndexOfContentFromLabel(contentList, label) {
    return contentList.indexOf(
        contentList.filter(contentItem => {
            return contentItem.label === label;
        }).first());
}

export default function content(state = INITIAL_CONTENT_STATE, action) {
    switch (action.type) {
        case REQUEST_CONTENT:
            return state.merge({
                content: state.get('content').push({
                    label: action.fileLabel,
                    content: '',
                    isFetching: true,
                }),
            });
        case RECEIVE_CONTENT:
            return state.merge({
                content: state.get('content').set(getIndexOfContentFromLabel(state.get('content'), action.fileLabel),
                    {
                        label: action.fileLabel,
                        content: action.content,
                        isFetching: false,
                        readOnly: action.readOnly,
                    }),
            });
        case REMOVE_CONTENT:
            return state.merge({
                content: state.get('content').delete(action.index),
            });
        case CHANGE_SELECTED_CONTENT:
            return state.merge({
                selectedContent: action.newSelectedContent,
            });
        default:
            return state;
    }
}
