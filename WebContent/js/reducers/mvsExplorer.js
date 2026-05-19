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
    SET_MVS_PATH,
    REQUEST_DS_CHILDREN, RECEIVE_DS_CHILDREN, INVALIDATE_DS_CHILDREN,
    RESET_DS_CHILDREN, REMOVE_DATASET, RENAME_DATASET,
    REQUEST_DS_MEMBERS, RECEIVE_DS_MEMBERS, INVALIDATE_DS_MEMBERS, TOGGLE_DS_NODE,
    REQUEST_MVS_CONTENT, RECEIVE_MVS_CONTENT, INVALIDATE_MVS_CONTENT, INVALIDATE_MVS_FILE,
    UPDATE_MVS_CONTENT, UPDATE_MVS_ETAG,
    REQUEST_MVS_SAVE, RECEIVE_MVS_SAVE, INVALIDATE_MVS_SAVE,
    REQUEST_CREATE_DATASET, RECEIVE_CREATE_DATASET, INVALIDATE_CREATE_DATASET,
    REQUEST_CREATE_MEMBER, RECEIVE_CREATE_MEMBER, INVALIDATE_CREATE_MEMBER,
    REQUEST_DELETE_DATASET, RECEIVE_DELETE_DATASET, INVALIDATE_DELETE_DATASET,
    REQUEST_JOB_SUBMIT, RECEIVE_JOB_SUBMIT, INVALIDATE_JOB_SUBMIT,
} from '../actions/mvsExplorer';

const INITIAL_STATE = Map({
    // Tree state
    DSPath: '',
    datasets: List([]),
    isFetchingDatasets: false,
    datasetsError: null,

    // Members state (keyed by dataset name)
    members: Map({}),
    isFetchingMembers: false,
    toggledDatasets: Map({}),

    // Editor state
    file: null,
    content: null,
    etag: null,
    isFetchingContent: false,
    contentError: null,

    // Save state
    isSaving: false,
    saveError: null,

    // CRUD state
    isCreating: false,
    isDeleting: false,

    // Job submit state
    jobSubmitResponse: null,
    isSubmitting: false,
});

export default function mvsExplorer(state = INITIAL_STATE, action) {
    switch (action.type) {
        // ─── Dataset Tree ───
        case SET_MVS_PATH:
            return state.set('DSPath', action.path);

        case REQUEST_DS_CHILDREN:
            return state.set('isFetchingDatasets', true).set('datasetsError', null);

        case RECEIVE_DS_CHILDREN:
            return state
                .set('isFetchingDatasets', false)
                .set('datasets', List(action.datasets.map(ds => Map({
                    name: ds.dsname || ds.name,
                    dsorg: ds.dsorg || '',
                    volser: ds.vol || '',
                }))));

        case INVALIDATE_DS_CHILDREN:
            return state.set('isFetchingDatasets', false).set('datasetsError', action.error);

        case RESET_DS_CHILDREN:
            return state.set('datasets', List([])).set('toggledDatasets', Map({})).set('members', Map({}));

        case REMOVE_DATASET:
            return state.set('datasets', state.get('datasets').filter(ds => ds.get('name') !== action.DSName));

        case RENAME_DATASET:
            return state.set('datasets', state.get('datasets').map(ds =>
                ds.get('name') === action.oldName ? ds.set('name', action.newName) : ds
            ));

        // ─── Members ───
        case REQUEST_DS_MEMBERS:
            return state.set('isFetchingMembers', true);

        case RECEIVE_DS_MEMBERS:
            return state
                .set('isFetchingMembers', false)
                .setIn(['members', action.DSName], List(action.members))
                .setIn(['toggledDatasets', action.DSName], true)
                .setIn(['unauthorized', action.DSName], !!action.unauthorized);

        case INVALIDATE_DS_MEMBERS:
            return state.set('isFetchingMembers', false);

        case TOGGLE_DS_NODE:
            return state.setIn(['toggledDatasets', action.DSName],
                !state.getIn(['toggledDatasets', action.DSName]));

        // ─── Editor Content ───
        case REQUEST_MVS_CONTENT:
            return state.set('isFetchingContent', true).set('file', action.file).set('contentError', null);

        case RECEIVE_MVS_CONTENT:
            return state
                .set('isFetchingContent', false)
                .set('file', action.file)
                .set('content', action.content)
                .set('etag', action.etag);

        case INVALIDATE_MVS_CONTENT:
            return state.set('isFetchingContent', false).set('contentError', action.error);

        case UPDATE_MVS_CONTENT:
            return state.set('content', action.content);

        case UPDATE_MVS_ETAG:
            return state.set('etag', action.etag);

        case INVALIDATE_MVS_FILE:
            return state.set('file', null).set('content', null).set('etag', null);

        // ─── Save ───
        case REQUEST_MVS_SAVE:
            return state.set('isSaving', true).set('saveError', null);

        case RECEIVE_MVS_SAVE:
            return state.set('isSaving', false).set('etag', action.etag);

        case INVALIDATE_MVS_SAVE:
            return state.set('isSaving', false).set('saveError', action.error);

        // ─── Create Dataset ───
        case REQUEST_CREATE_DATASET:
        case REQUEST_CREATE_MEMBER:
            return state.set('isCreating', true);

        case RECEIVE_CREATE_DATASET:
        case RECEIVE_CREATE_MEMBER:
            return state.set('isCreating', false);

        case INVALIDATE_CREATE_DATASET:
        case INVALIDATE_CREATE_MEMBER:
            return state.set('isCreating', false);

        // ─── Delete ───
        case REQUEST_DELETE_DATASET:
            return state.set('isDeleting', true);

        case RECEIVE_DELETE_DATASET:
            return state.set('isDeleting', false)
                .set('datasets', state.get('datasets').filter(ds => ds.get('name') !== action.name));

        case INVALIDATE_DELETE_DATASET:
            return state.set('isDeleting', false);

        // ─── Job Submit ───
        case REQUEST_JOB_SUBMIT:
            return state.set('isSubmitting', true).set('jobSubmitResponse', null);

        case RECEIVE_JOB_SUBMIT:
            return state.set('isSubmitting', false).set('jobSubmitResponse', action.response);

        case INVALIDATE_JOB_SUBMIT:
            return state.set('isSubmitting', false);

        default:
            return state;
    }
}
