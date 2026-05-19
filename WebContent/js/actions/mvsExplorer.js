/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { whichServer } from '../utilities/urlUtils';
import { pushNotification } from './notifications';

// ═══════════════════════════════════════════════════════════════
// ACTION TYPES
// ═══════════════════════════════════════════════════════════════

// Dataset tree
export const SET_MVS_PATH = 'SET_MVS_PATH';
export const REQUEST_DS_CHILDREN = 'REQUEST_DS_CHILDREN';
export const RECEIVE_DS_CHILDREN = 'RECEIVE_DS_CHILDREN';
export const INVALIDATE_DS_CHILDREN = 'INVALIDATE_DS_CHILDREN';
export const RESET_DS_CHILDREN = 'RESET_DS_CHILDREN';
export const REMOVE_DATASET = 'REMOVE_DATASET';
export const RENAME_DATASET = 'RENAME_DATASET';

// Dataset members
export const REQUEST_DS_MEMBERS = 'REQUEST_DS_MEMBERS';
export const RECEIVE_DS_MEMBERS = 'RECEIVE_DS_MEMBERS';
export const INVALIDATE_DS_MEMBERS = 'INVALIDATE_DS_MEMBERS';
export const TOGGLE_DS_NODE = 'TOGGLE_DS_NODE';

// Editor / Content
export const REQUEST_MVS_CONTENT = 'REQUEST_MVS_CONTENT';
export const RECEIVE_MVS_CONTENT = 'RECEIVE_MVS_CONTENT';
export const INVALIDATE_MVS_CONTENT = 'INVALIDATE_MVS_CONTENT';
export const INVALIDATE_MVS_FILE = 'INVALIDATE_MVS_FILE';
export const UPDATE_MVS_CONTENT = 'UPDATE_MVS_CONTENT';
export const UPDATE_MVS_ETAG = 'UPDATE_MVS_ETAG';

// Save
export const REQUEST_MVS_SAVE = 'REQUEST_MVS_SAVE';
export const RECEIVE_MVS_SAVE = 'RECEIVE_MVS_SAVE';
export const INVALIDATE_MVS_SAVE = 'INVALIDATE_MVS_SAVE';

// Create/Delete
export const REQUEST_CREATE_DATASET = 'REQUEST_CREATE_DATASET';
export const RECEIVE_CREATE_DATASET = 'RECEIVE_CREATE_DATASET';
export const INVALIDATE_CREATE_DATASET = 'INVALIDATE_CREATE_DATASET';
export const REQUEST_CREATE_MEMBER = 'REQUEST_CREATE_MEMBER';
export const RECEIVE_CREATE_MEMBER = 'RECEIVE_CREATE_MEMBER';
export const INVALIDATE_CREATE_MEMBER = 'INVALIDATE_CREATE_MEMBER';
export const REQUEST_DELETE_DATASET = 'REQUEST_DELETE_DATASET';
export const RECEIVE_DELETE_DATASET = 'RECEIVE_DELETE_DATASET';
export const INVALIDATE_DELETE_DATASET = 'INVALIDATE_DELETE_DATASET';

// Job submission
export const REQUEST_JOB_SUBMIT = 'REQUEST_JOB_SUBMIT';
export const RECEIVE_JOB_SUBMIT = 'RECEIVE_JOB_SUBMIT';
export const INVALIDATE_JOB_SUBMIT = 'INVALIDATE_JOB_SUBMIT';

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function zosmfFetch(endpoint, options = {}) {
    const baseUrl = `https://${whichServer()}/ibmzosmf/api/v1/zosmf`;
    const defaultHeaders = {
        'X-CSRF-ZOSMF-HEADER': '*',
        'X-IBM-Response-Timeout': '60',
    };
    return fetch(`${baseUrl}${endpoint}`, {
        credentials: 'include',
        ...options,
        headers: { ...defaultHeaders, ...(options.headers || {}) },
    });
}

/**
 * Validate dataset name segment rules
 */
export function validateDatasetName(name) {
    if (!name || name.length === 0) return 'Name is required';
    if (name.length > 44) return 'Name must be 44 characters or less';
    const segments = name.split('.');
    for (const seg of segments) {
        if (seg.length === 0) return 'Name segments cannot be empty';
        if (seg.length > 8) return 'Each segment must be 8 characters or less';
        if (!/^[A-Z@#$][A-Z0-9@#$-]*$/.test(seg)) return 'Invalid characters in name segment';
    }
    return null;
}

/**
 * Validate member name rules
 */
export function validateMemberName(name) {
    if (!name || name.length === 0) return 'Member name is required';
    if (name.length > 8) return 'Member name must be 8 characters or less';
    if (!/^[A-Z@#$][A-Z0-9@#$]*$/.test(name)) return 'Invalid characters in member name';
    return null;
}

// ═══════════════════════════════════════════════════════════════
// DATASET TREE ACTIONS
// ═══════════════════════════════════════════════════════════════

export function setMVSPath(path) {
    return { type: SET_MVS_PATH, path };
}

export function resetDSChildren() {
    return { type: RESET_DS_CHILDREN };
}

export function removeDataset(DSName) {
    return { type: REMOVE_DATASET, DSName };
}

export function renameDatasetInTree(oldName, newName) {
    return { type: RENAME_DATASET, oldName, newName };
}

export function toggleDSNode(DSName) {
    return { type: TOGGLE_DS_NODE, DSName };
}

/**
 * Fetch datasets matching the given qualifier (e.g. "USER.*")
 */
export function fetchDatasets(qualifier) {
    return async (dispatch) => {
        if (!qualifier || qualifier === '*') {
            dispatch({ type: INVALIDATE_DS_CHILDREN, error: 'Please enter a valid dataset qualifier (e.g. USERID.*)' });
            return;
        }
        dispatch({ type: REQUEST_DS_CHILDREN });
        try {
            const response = await zosmfFetch(`/restfiles/ds?dslevel=${encodeURIComponent(qualifier)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'X-IBM-Attributes': 'base' },
            });
            if (response.status === 401) {
                dispatch(pushNotification('Session expired. Please log in again.', 'error'));
                dispatch({ type: INVALIDATE_DS_CHILDREN, error: 'Authentication required' });
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            const items = data.items || [];
            dispatch({ type: RECEIVE_DS_CHILDREN, datasets: items });
        } catch (error) {
            dispatch({ type: INVALIDATE_DS_CHILDREN, error: error.message });
            dispatch(pushNotification(`Fetch datasets failed: ${error.message}`, 'error'));
        }
    };
}

/**
 * Fetch members of a Partitioned Data Set
 */
export function fetchDSMembers(DSName) {
    return async (dispatch) => {
        dispatch({ type: REQUEST_DS_MEMBERS, DSName });
        try {
            const response = await zosmfFetch(`/restfiles/ds/${encodeURIComponent(DSName)}/member`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'X-IBM-Attributes': 'base' },
            });
            if (response.status === 401) {
                dispatch(pushNotification('Session expired. Please log in again.', 'error'));
                dispatch({ type: INVALIDATE_DS_MEMBERS, DSName, error: 'Authentication required' });
                return;
            }
            if (response.status === 403) {
                dispatch({ type: RECEIVE_DS_MEMBERS, DSName, members: [], unauthorized: true });
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            const members = (data.items || []).map(item => item.member);
            dispatch({ type: RECEIVE_DS_MEMBERS, DSName, members });
        } catch (error) {
            dispatch({ type: INVALIDATE_DS_MEMBERS, DSName, error: error.message });
            dispatch(pushNotification(`Fetch members failed for ${DSName}: ${error.message}`, 'error'));
        }
    };
}

// ═══════════════════════════════════════════════════════════════
// CONTENT / EDITOR ACTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch content of a dataset or member (e.g. "HLQ.PDS(MEMBER)" or "HLQ.SEQ")
 */
export function fetchDSContent(file) {
    return async (dispatch) => {
        dispatch({ type: REQUEST_MVS_CONTENT, file });
        try {
            const response = await zosmfFetch(`/restfiles/ds/${encodeURIComponent(file)}`, {
                method: 'GET',
                headers: { 'X-IBM-Data-Type': 'text' },
            });
            if (response.status === 401) {
                dispatch(pushNotification('Session expired. Please log in again.', 'error'));
                dispatch({ type: INVALIDATE_MVS_CONTENT, error: 'Authentication required' });
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const content = await response.text();
            const etag = response.headers.get('ETag');
            dispatch({ type: RECEIVE_MVS_CONTENT, file, content, etag });
        } catch (error) {
            dispatch({ type: INVALIDATE_MVS_CONTENT, error: error.message });
            dispatch(pushNotification(`Failed to load ${file}: ${error.message}`, 'error'));
        }
    };
}

/**
 * Save content back to a dataset/member with optimistic locking (ETag)
 */
export function saveDSContent(file, content, etag) {
    return async (dispatch) => {
        dispatch({ type: REQUEST_MVS_SAVE });
        try {
            const headers = {
                'Content-Type': 'text/plain',
                'X-IBM-Data-Type': 'text',
            };
            if (etag) {
                headers['If-Match'] = etag;
            }
            const response = await zosmfFetch(`/restfiles/ds/${encodeURIComponent(file)}`, {
                method: 'PUT',
                headers,
                body: content,
            });
            if (response.status === 412) {
                dispatch({ type: INVALIDATE_MVS_SAVE, error: 'ETag conflict — file was modified elsewhere. Refresh and try again.' });
                dispatch(pushNotification(`Save conflict for ${file}. File was modified by another user.`, 'warning'));
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const newEtag = response.headers.get('ETag');
            dispatch({ type: RECEIVE_MVS_SAVE, etag: newEtag });
            dispatch(pushNotification(`Save successful for ${file}`, 'success'));
            // Re-fetch the ETag to ensure we have the correct one
            if (!newEtag) {
                const refetch = await zosmfFetch(`/restfiles/ds/${encodeURIComponent(file)}`, {
                    method: 'GET',
                    headers: { 'X-IBM-Data-Type': 'text' },
                });
                if (refetch.ok) {
                    const refreshedEtag = refetch.headers.get('ETag');
                    dispatch({ type: UPDATE_MVS_ETAG, etag: refreshedEtag });
                }
            }
        } catch (error) {
            dispatch({ type: INVALIDATE_MVS_SAVE, error: error.message });
            dispatch(pushNotification(`Save failed for ${file}: ${error.message}`, 'error'));
        }
    };
}

/**
 * Save content as a different dataset/member
 */
export function saveAsDSContent(newFile, content) {
    return async (dispatch) => {
        dispatch({ type: REQUEST_MVS_SAVE });
        try {
            const response = await zosmfFetch(`/restfiles/ds/${encodeURIComponent(newFile)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'text/plain',
                    'X-IBM-Data-Type': 'text',
                },
                body: content,
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const newEtag = response.headers.get('ETag');
            dispatch({ type: RECEIVE_MVS_SAVE, etag: newEtag });
            dispatch(pushNotification(`Save As successful for ${newFile}`, 'success'));
            // Now open the newly saved file
            dispatch(fetchDSContent(newFile));
        } catch (error) {
            dispatch({ type: INVALIDATE_MVS_SAVE, error: error.message });
            dispatch(pushNotification(`Save As failed for ${newFile}: ${error.message}`, 'error'));
        }
    };
}

/**
 * Invalidate (close) the current editor file
 */
export function invalidateMVSFile() {
    return { type: INVALIDATE_MVS_FILE };
}

export function updateMVSContent(content) {
    return { type: UPDATE_MVS_CONTENT, content };
}

// ═══════════════════════════════════════════════════════════════
// CRUD ACTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new dataset
 */
export function createDataset(name, properties, qualifier) {
    return async (dispatch) => {
        dispatch({ type: REQUEST_CREATE_DATASET });
        try {
            const response = await zosmfFetch(`/restfiles/ds/${encodeURIComponent(name)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(properties),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            dispatch({ type: RECEIVE_CREATE_DATASET, name });
            dispatch(pushNotification(`Dataset ${name} created successfully`, 'success'));
            // Auto-refresh the tree
            if (qualifier) {
                dispatch(fetchDatasets(qualifier));
            }
        } catch (error) {
            dispatch({ type: INVALIDATE_CREATE_DATASET, error: error.message });
            dispatch(pushNotification(`Create dataset failed: ${error.message}`, 'error'));
        }
    };
}

/**
 * Create a new member in a PDS
 */
export function createMember(DSName, memberName) {
    return async (dispatch) => {
        dispatch({ type: REQUEST_CREATE_MEMBER });
        try {
            const response = await zosmfFetch(`/restfiles/ds/${encodeURIComponent(DSName)}(${encodeURIComponent(memberName)})`, {
                method: 'PUT',
                headers: { 'Content-Type': 'text/plain', 'X-IBM-Data-Type': 'text' },
                body: '',
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            dispatch({ type: RECEIVE_CREATE_MEMBER, DSName, memberName });
            dispatch(pushNotification(`Member ${memberName} created in ${DSName}`, 'success'));
            // Auto-refresh members list
            dispatch(fetchDSMembers(DSName));
        } catch (error) {
            dispatch({ type: INVALIDATE_CREATE_MEMBER, error: error.message });
            dispatch(pushNotification(`Create member failed: ${error.message}`, 'error'));
        }
    };
}

/**
 * Delete a dataset or member  
 */
export function deleteDataset(name, qualifier, currentFile) {
    return async (dispatch) => {
        dispatch({ type: REQUEST_DELETE_DATASET });
        try {
            const response = await zosmfFetch(`/restfiles/ds/${encodeURIComponent(name)}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            dispatch({ type: RECEIVE_DELETE_DATASET, name });
            dispatch(pushNotification(`${name} deleted successfully`, 'success'));
            // Close editor if the deleted file is open
            if (currentFile && (currentFile === name || currentFile.startsWith(name + '('))) {
                dispatch(invalidateMVSFile());
            }
            // If it's a member delete (contains parens), refresh parent members
            if (name.includes('(')) {
                const parentDS = name.split('(')[0];
                dispatch(fetchDSMembers(parentDS));
            } else if (qualifier) {
                // Refresh tree
                dispatch(fetchDatasets(qualifier));
            }
        } catch (error) {
            dispatch({ type: INVALIDATE_DELETE_DATASET, error: error.message });
            dispatch(pushNotification(`Delete failed for ${name}: ${error.message}`, 'error'));
        }
    };
}

/**
 * Rename a dataset
 */
export function renameDataset(oldName, newName, currentFile) {
    return async (dispatch) => {
        try {
            const response = await zosmfFetch(`/restfiles/ds/${encodeURIComponent(newName)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 'request': 'rename', 'from-dataset': { dsn: oldName } }),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            dispatch(renameDatasetInTree(oldName, newName));
            dispatch(pushNotification(`Renamed ${oldName} to ${newName}`, 'success'));
            // Update editor file name if the renamed DS is open
            if (currentFile === oldName) {
                dispatch(fetchDSContent(newName));
            }
        } catch (error) {
            dispatch({ type: INVALIDATE_DS_CHILDREN, error: error.message });
            dispatch(pushNotification(`Rename failed: ${error.message}`, 'error'));
        }
    };
}

/**
 * Submit a dataset as JCL job
 */
export function submitJob(DSName) {
    return async (dispatch) => {
        dispatch({ type: REQUEST_JOB_SUBMIT });
        try {
            const response = await zosmfFetch('/restjobs/jobs', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ request: 'Submit Job', file: `//'${DSName}'` }),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            dispatch({ type: RECEIVE_JOB_SUBMIT, response: data });
            dispatch(pushNotification(`${data.jobname || DSName} submitted successfully, Job ID: ${data.jobid || 'N/A'}`, 'success'));
        } catch (error) {
            dispatch({ type: INVALIDATE_JOB_SUBMIT, error: error.message });
            dispatch(pushNotification(`Submit failed for ${DSName}: ${error.message}`, 'error'));
        }
    };
}

/**
 * Download a dataset as a file
 */
export function downloadDataset(DSName) {
    return async (dispatch) => {
        try {
            const response = await zosmfFetch(`/restfiles/ds/${encodeURIComponent(DSName)}`, {
                method: 'GET',
                headers: { 'X-IBM-Data-Type': 'text' },
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const content = await response.text();
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = DSName.replace(/[()]/g, '_');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            dispatch(pushNotification(`Downloaded ${DSName}`, 'success'));
        } catch (error) {
            dispatch(pushNotification(`Download failed for ${DSName}: ${error.message}`, 'error'));
        }
    };
}

/**
 * Fetch dataset attributes (RECFM, LRECL, BLKSIZE, etc.)
 */
export function fetchDatasetAttributes(DSName) {
    return async () => {
        try {
            const response = await zosmfFetch(`/restfiles/ds?dslevel=${encodeURIComponent(DSName)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'X-IBM-Attributes': 'base' },
            });
            if (!response.ok) return null;
            const data = await response.json();
            return data.items && data.items[0] ? data.items[0] : null;
        } catch (error) {
            return null;
        }
    };
}
