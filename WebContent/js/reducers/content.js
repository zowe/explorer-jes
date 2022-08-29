/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2020
 */

import { Map, List } from 'immutable';
import {
    REQUEST_CONTENT,
    REFRESH_CONTENT,
    RECEIVE_CONTENT,
    REMOVE_CONTENT,
    UPDATE_CONTENT,
    CHANGE_SELECTED_CONTENT,
    REQUEST_SUBMIT_JCL,
    RECEIVE_SUBMIT_JCL,
    INVALIDATE_SUBMIT_JCL,
    INVALIDATE_CONTENT,
    ADD_ACTIVE_REQUEST,
    REMOVE_ACTIVE_REQUEST,
} from '../actions/content';

export const DEFAULT_TITLE = 'JES Explorer';

// content List()
// label - label of tab in content viewer
// id - unique id for contant tab
// content - text content
// isFetching - boolean value of is content still being fetched

const INITIAL_CONTENT_STATE = Map({
    content: List(),
    selectedContent: 0, // Index of the current active tab content
    isSubmittingJCL: false,
    title: DEFAULT_TITLE,
    contentRequests: [],
    list: List([])
});

function getIndexOfContentFromId(contentList, label, fileId) {
    return contentList.indexOf(
        contentList.filter(contentItem => {
            return contentItem.id === label + fileId;
        }).first());
}

export default function content(state = INITIAL_CONTENT_STATE, action) {
    switch (action.type) {
        case REQUEST_CONTENT:
            return state.merge({
                content: state.get('content').push({
                    label: action.fileLabel,
                    id: action.fileLabel + action.fileId,
                    content: '',
                    isFetching: true,
                }),
            });
        case REFRESH_CONTENT:
            return state.merge({
                content: state.get('content').set(getIndexOfContentFromId(state.get('content'), action.fileLabel, action.fileId),
                    {
                        label: action.fileLabel,
                        id: action.fileLabel + action.fileId,
                        content: '',
                        isFetching: true,
                    }),
            });
        case RECEIVE_CONTENT:
            return state.merge({
                title: `${DEFAULT_TITLE} [${action.fileLabel}]`,
                content: state.get('content').set(getIndexOfContentFromId(state.get('content'), action.fileLabel, action.fileId),
                    {
                        label: action.fileLabel,
                        content: `${state.get('content').get(0).content}` + action.content,
                        id: action.fileLabel + action.fileId,
                        isFetching: false,
                        readOnly: action.readOnly,
                    }),
            });
        case REMOVE_CONTENT:
            return state.merge({
                title: `${DEFAULT_TITLE}`,
                content: state.get('content').delete(action.index),
            });
        case UPDATE_CONTENT:
            return state.merge({
                content: state.get('content').set(state.get('selectedContent'), {
                    label: state.get('content').get(state.get('selectedContent')).label,
                    content: action.content,
                    id: state.get('content').get(state.get('selectedContent')).id,
                    isFetching: state.get('content').get(state.get('selectedContent')).isFetching,
                    readOnly: state.get('content').get(state.get('selectedContent')).readOnly,
                }),
            });
        case CHANGE_SELECTED_CONTENT:
            return state.merge({
                selectedContent: action.newSelectedContent,
                title: `${DEFAULT_TITLE} [${state.get('content').get(action.newSelectedContent).label}]`,
            });
        case REQUEST_SUBMIT_JCL:
            return state.merge({
                isSubmittingJCL: true,
            });
        case RECEIVE_SUBMIT_JCL:
            return state.merge({
                isSubmittingJCL: false,
            });
        case INVALIDATE_SUBMIT_JCL:
            return state.merge({
                isSubmittingJCL: false,
            });
        case INVALIDATE_CONTENT:
            return state.merge({
                content: state.get('content').delete(getIndexOfContentFromId(state.get('content'), action.fileLabel, action.fileId)),
            });
        case ADD_ACTIVE_REQUEST:
            console.log('adding:' + action.fileLabel + ' old list was '+ state.get('list'))
            return state.merge({
                list: state.get('list').set(state.get('list').size, action.fileLabel),
            });
        case REMOVE_ACTIVE_REQUEST:
            console.log('removing:' + action.fileLabel + ' old list was '+ state.get('list'))
            return state.merge({
                list: state.get('list').delete(state.get('list').indexOf(action.fileLabel)),
            });
            
        default:
            return state;
    }
}
