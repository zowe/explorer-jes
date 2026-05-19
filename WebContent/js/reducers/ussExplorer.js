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
    SET_USS_PATH,
    REQUEST_USS_CHILDREN, RECEIVE_USS_CHILDREN, INVALIDATE_USS_CHILDREN, RESET_USS_CHILDREN,
    REQUEST_DIR_CHILDREN, RECEIVE_DIR_CHILDREN, INVALIDATE_DIR_CHILDREN,
    TOGGLE_DIRECTORY, RESET_DIR_CHILDREN,
    REQUEST_USS_CONTENT, RECEIVE_USS_CONTENT, INVALIDATE_USS_CONTENT,
    UPDATE_USS_CONTENT, UPDATE_USS_CHECKSUM,
    REQUEST_USS_SAVE, RECEIVE_USS_SAVE, INVALIDATE_USS_SAVE,
    REQUEST_CREATE_USS, RECEIVE_CREATE_USS, INVALIDATE_CREATE_USS,
    REQUEST_DELETE_USS, RECEIVE_DELETE_USS, INVALIDATE_DELETE_USS,
} from '../actions/ussExplorer';

const INITIAL_STATE = Map({
    // Tree state
    USSPath: '/u',
    children: List([]),
    isFetchingChildren: false,
    childrenError: null,

    // Directory expansion state
    dirChildren: Map({}),    // Map<path, List<items>>
    toggledDirs: Map({}),    // Map<path, boolean>
    isFetchingDir: false,

    // Editor state
    file: null,
    content: null,
    checksum: null,
    isFetchingContent: false,
    contentError: null,

    // Save state
    isSaving: false,
    saveError: null,

    // CRUD state
    isCreating: false,
    isDeleting: false,
});

export default function ussExplorer(state = INITIAL_STATE, action) {
    switch (action.type) {
        // ─── USS Tree ───
        case SET_USS_PATH:
            return state.set('USSPath', action.path);

        case REQUEST_USS_CHILDREN:
            return state.set('isFetchingChildren', true).set('childrenError', null);

        case RECEIVE_USS_CHILDREN:
            return state
                .set('isFetchingChildren', false)
                .set('children', List(action.items.map(item => Map(item))));

        case INVALIDATE_USS_CHILDREN:
            return state.set('isFetchingChildren', false).set('childrenError', action.error);

        case RESET_USS_CHILDREN:
            return state.set('children', List([])).set('dirChildren', Map({})).set('toggledDirs', Map({}));

        // ─── Directory Expansion ───
        case REQUEST_DIR_CHILDREN:
            return state.set('isFetchingDir', true);

        case RECEIVE_DIR_CHILDREN:
            return state
                .set('isFetchingDir', false)
                .setIn(['dirChildren', action.path], List(action.items.map(item => Map(item))))
                .setIn(['toggledDirs', action.path], true);

        case INVALIDATE_DIR_CHILDREN:
            return state.set('isFetchingDir', false);

        case TOGGLE_DIRECTORY:
            return state.setIn(['toggledDirs', action.path],
                !state.getIn(['toggledDirs', action.path]));

        case RESET_DIR_CHILDREN:
            return state.set('dirChildren', Map({})).set('toggledDirs', Map({}));

        // ─── Editor Content ───
        case REQUEST_USS_CONTENT:
            return state.set('isFetchingContent', true).set('file', action.file).set('contentError', null);

        case RECEIVE_USS_CONTENT:
            return state
                .set('isFetchingContent', false)
                .set('file', action.file)
                .set('content', action.content)
                .set('checksum', action.checksum);

        case INVALIDATE_USS_CONTENT:
            return state.set('isFetchingContent', false).set('contentError', action.error);

        case UPDATE_USS_CONTENT:
            return state.set('content', action.content);

        case UPDATE_USS_CHECKSUM:
            return state.set('checksum', action.checksum);

        // ─── Save ───
        case REQUEST_USS_SAVE:
            return state.set('isSaving', true).set('saveError', null);

        case RECEIVE_USS_SAVE:
            return state.set('isSaving', false).set('checksum', action.checksum);

        case INVALIDATE_USS_SAVE:
            return state.set('isSaving', false).set('saveError', action.error);

        // ─── Create ───
        case REQUEST_CREATE_USS:
            return state.set('isCreating', true);

        case RECEIVE_CREATE_USS:
            return state.set('isCreating', false);

        case INVALIDATE_CREATE_USS:
            return state.set('isCreating', false);

        // ─── Delete ───
        case REQUEST_DELETE_USS:
            return state.set('isDeleting', true);

        case RECEIVE_DELETE_USS:
            return state.set('isDeleting', false);

        case INVALIDATE_DELETE_USS:
            return state.set('isDeleting', false);

        // ─── File invalidation ───
        case 'INVALIDATE_USS_FILE':
            return state.set('file', null).set('content', null).set('checksum', null);

        default:
            return state;
    }
}
