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

// USS tree
export const SET_USS_PATH = 'SET_USS_PATH';
export const REQUEST_USS_CHILDREN = 'REQUEST_USS_CHILDREN';
export const RECEIVE_USS_CHILDREN = 'RECEIVE_USS_CHILDREN';
export const INVALIDATE_USS_CHILDREN = 'INVALIDATE_USS_CHILDREN';
export const RESET_USS_CHILDREN = 'RESET_USS_CHILDREN';

// Directory children (subdirectory expansion)
export const REQUEST_DIR_CHILDREN = 'REQUEST_DIR_CHILDREN';
export const RECEIVE_DIR_CHILDREN = 'RECEIVE_DIR_CHILDREN';
export const INVALIDATE_DIR_CHILDREN = 'INVALIDATE_DIR_CHILDREN';
export const TOGGLE_DIRECTORY = 'TOGGLE_DIRECTORY';
export const RESET_DIR_CHILDREN = 'RESET_DIR_CHILDREN';

// Editor / Content
export const REQUEST_USS_CONTENT = 'REQUEST_USS_CONTENT';
export const RECEIVE_USS_CONTENT = 'RECEIVE_USS_CONTENT';
export const INVALIDATE_USS_CONTENT = 'INVALIDATE_USS_CONTENT';
export const UPDATE_USS_CONTENT = 'UPDATE_USS_CONTENT';
export const UPDATE_USS_CHECKSUM = 'UPDATE_USS_CHECKSUM';

// Save
export const REQUEST_USS_SAVE = 'REQUEST_USS_SAVE';
export const RECEIVE_USS_SAVE = 'RECEIVE_USS_SAVE';
export const INVALIDATE_USS_SAVE = 'INVALIDATE_USS_SAVE';

// Create / Delete
export const REQUEST_CREATE_USS = 'REQUEST_CREATE_USS';
export const RECEIVE_CREATE_USS = 'RECEIVE_CREATE_USS';
export const INVALIDATE_CREATE_USS = 'INVALIDATE_CREATE_USS';
export const REQUEST_DELETE_USS = 'REQUEST_DELETE_USS';
export const RECEIVE_DELETE_USS = 'RECEIVE_DELETE_USS';
export const INVALIDATE_DELETE_USS = 'INVALIDATE_DELETE_USS';

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function zosmfFetch(endpoint, options = {}) {
    const baseUrl = `https://${whichServer()}/ibmzosmf/api/v1/zosmf`;
    const defaultHeaders = {
        'X-CSRF-ZOSMF-HEADER': '*',
    };
    return fetch(`${baseUrl}${endpoint}`, {
        credentials: 'include',
        ...options,
        headers: { ...defaultHeaders, ...(options.headers || {}) },
    });
}

// ═══════════════════════════════════════════════════════════════
// USS TREE ACTIONS
// ═══════════════════════════════════════════════════════════════

export function setUSSPath(path) {
    return { type: SET_USS_PATH, path };
}

export function resetUSSChildren() {
    return { type: RESET_USS_CHILDREN };
}

export function toggleDirectory(path) {
    return { type: TOGGLE_DIRECTORY, path };
}

export function resetDirChildren() {
    return { type: RESET_DIR_CHILDREN };
}

/**
 * Fetch USS directory listing at path
 */
export function fetchUSSChildren(path) {
    return async (dispatch) => {
        dispatch({ type: REQUEST_USS_CHILDREN });
        try {
            const response = await zosmfFetch(`/restfiles/fs?path=${encodeURIComponent(path)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.status === 401) {
                dispatch(pushNotification('Session expired. Please log in again.', 'error'));
                dispatch({ type: INVALIDATE_USS_CHILDREN, error: 'Authentication required' });
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            const items = (data.items || [])
                .filter(item => item.name !== '.' && item.name !== '..')
                .map(item => ({
                    name: item.name,
                    type: item.mode && item.mode.startsWith('d') ? 'directory' : 'file',
                    path: path === '/' ? `/${item.name}` : `${path}/${item.name}`,
                    mode: item.mode || '',
                    size: item.size || 0,
                }));
            dispatch({ type: RECEIVE_USS_CHILDREN, items, path });
        } catch (error) {
            dispatch({ type: INVALIDATE_USS_CHILDREN, error: error.message });
            dispatch(pushNotification(`Fetch failed for ${path}: ${error.message}`, 'error'));
        }
    };
}

/**
 * Fetch children of a subdirectory (for tree expansion)
 */
export function fetchDirectoryChildren(dirPath) {
    return async (dispatch) => {
        dispatch({ type: REQUEST_DIR_CHILDREN, path: dirPath });
        try {
            const response = await zosmfFetch(`/restfiles/fs?path=${encodeURIComponent(dirPath)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.status === 401) {
                dispatch(pushNotification('Session expired. Please log in again.', 'error'));
                dispatch({ type: INVALIDATE_DIR_CHILDREN, path: dirPath, error: 'Authentication required' });
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            const items = (data.items || [])
                .filter(item => item.name !== '.' && item.name !== '..')
                .map(item => ({
                    name: item.name,
                    type: item.mode && item.mode.startsWith('d') ? 'directory' : 'file',
                    path: `${dirPath}/${item.name}`,
                    mode: item.mode || '',
                    size: item.size || 0,
                }));
            dispatch({ type: RECEIVE_DIR_CHILDREN, path: dirPath, items });
        } catch (error) {
            dispatch({ type: INVALIDATE_DIR_CHILDREN, path: dirPath, error: error.message });
            dispatch(pushNotification(`Fetch failed for ${dirPath}: ${error.message}`, 'error'));
        }
    };
}

// ═══════════════════════════════════════════════════════════════
// CONTENT / EDITOR ACTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch USS file content
 */
export function fetchUSSContent(filePath) {
    return async (dispatch) => {
        dispatch({ type: REQUEST_USS_CONTENT, file: filePath });
        try {
            const response = await zosmfFetch(`/restfiles/fs${encodeURIComponent(filePath)}`, {
                method: 'GET',
                headers: { 'X-IBM-Data-Type': 'text' },
            });
            if (response.status === 401) {
                dispatch(pushNotification('Session expired. Please log in again.', 'error'));
                dispatch({ type: INVALIDATE_USS_CONTENT, error: 'Authentication required' });
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const content = await response.text();
            const checksum = response.headers.get('ETag');
            dispatch({ type: RECEIVE_USS_CONTENT, file: filePath, content, checksum });
        } catch (error) {
            dispatch({ type: INVALIDATE_USS_CONTENT, error: error.message });
            dispatch(pushNotification(`Failed to load ${filePath}: ${error.message}`, 'error'));
        }
    };
}

/**
 * Save USS file content with optimistic locking
 */
export function saveUSSContent(filePath, content, checksum) {
    return async (dispatch) => {
        dispatch({ type: REQUEST_USS_SAVE });
        try {
            const headers = {
                'Content-Type': 'text/plain',
                'X-IBM-Data-Type': 'text',
            };
            if (checksum) {
                headers['If-Match'] = checksum;
            }
            const response = await zosmfFetch(`/restfiles/fs${encodeURIComponent(filePath)}`, {
                method: 'PUT',
                headers,
                body: content,
            });
            if (response.status === 412) {
                dispatch({ type: INVALIDATE_USS_SAVE, error: 'Checksum conflict — file was modified elsewhere. Refresh and try again.' });
                dispatch(pushNotification(`Save conflict for ${filePath}. File was modified by another user.`, 'warning'));
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            let newChecksum = response.headers.get('ETag');
            // Re-fetch checksum if not returned in response
            if (!newChecksum) {
                const refetch = await zosmfFetch(`/restfiles/fs${encodeURIComponent(filePath)}`, {
                    method: 'GET',
                    headers: { 'X-IBM-Data-Type': 'text' },
                });
                if (refetch.ok) {
                    newChecksum = refetch.headers.get('ETag');
                }
            }
            dispatch({ type: RECEIVE_USS_SAVE, checksum: newChecksum });
            dispatch(pushNotification(`Save successful for ${filePath.split('/').pop()}`, 'success'));
        } catch (error) {
            dispatch({ type: INVALIDATE_USS_SAVE, error: error.message });
            dispatch(pushNotification(`Save failed for ${filePath}: ${error.message}`, 'error'));
        }
    };
}

/**
 * Save content as a new file (Save As)
 */
export function saveAsUSSContent(newFilePath, content, parentPath) {
    return async (dispatch) => {
        dispatch({ type: REQUEST_USS_SAVE });
        try {
            // First create the file
            const createResp = await zosmfFetch(`/restfiles/fs${encodeURIComponent(newFilePath)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'file', mode: 'RWXRWXR--' }),
            });
            if (!createResp.ok && createResp.status !== 500) {
                // 500 sometimes means it already exists, try writing anyway
                throw new Error(`Create failed: HTTP ${createResp.status}`);
            }
            // Then write the content
            const writeResp = await zosmfFetch(`/restfiles/fs${encodeURIComponent(newFilePath)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'text/plain', 'X-IBM-Data-Type': 'text' },
                body: content,
            });
            if (!writeResp.ok) {
                throw new Error(`Write failed: HTTP ${writeResp.status}`);
            }
            const newChecksum = writeResp.headers.get('ETag');
            dispatch({ type: RECEIVE_USS_SAVE, checksum: newChecksum });
            dispatch(pushNotification(`Saved as ${newFilePath}`, 'success'));
            // Refresh parent directory and open the new file
            if (parentPath) {
                dispatch(fetchUSSChildren(parentPath));
            }
            dispatch(fetchUSSContent(newFilePath));
        } catch (error) {
            dispatch({ type: INVALIDATE_USS_SAVE, error: error.message });
            dispatch(pushNotification(`Save As failed: ${error.message}`, 'error'));
        }
    };
}

export function updateUSSContent(content) {
    return { type: UPDATE_USS_CONTENT, content };
}

/**
 * Invalidate (close) the current USS editor file
 */
export function invalidateUSSFile() {
    return { type: 'INVALIDATE_USS_FILE' };
}

// ═══════════════════════════════════════════════════════════════
// CRUD ACTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Create a USS file or directory
 */
export function createUSSResource(path, type, parentPath) {
    return async (dispatch) => {
        dispatch({ type: REQUEST_CREATE_USS });
        try {
            const response = await zosmfFetch(`/restfiles/fs${encodeURIComponent(path)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: type === 'directory' ? 'mkdir' : 'file', mode: 'RWXRWXR--' }),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            dispatch({ type: RECEIVE_CREATE_USS, path, resourceType: type });
            dispatch(pushNotification(`Created ${type}: ${path.split('/').pop()}`, 'success'));
            // Auto-refresh the parent directory
            if (parentPath) {
                dispatch(fetchUSSChildren(parentPath));
            }
        } catch (error) {
            dispatch({ type: INVALIDATE_CREATE_USS, error: error.message });
            dispatch(pushNotification(`Create failed: ${error.message}`, 'error'));
        }
    };
}

/**
 * Delete a USS resource (recursive for directories)
 */
export function deleteUSSResource(path, parentPath, currentFile) {
    return async (dispatch) => {
        dispatch({ type: REQUEST_DELETE_USS });
        try {
            const response = await zosmfFetch(`/restfiles/fs${encodeURIComponent(path)}`, {
                method: 'DELETE',
                headers: { 'X-IBM-Option': 'recursive' },
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            dispatch({ type: RECEIVE_DELETE_USS, path });
            dispatch(pushNotification(`Deleted ${path.split('/').pop()}`, 'success'));
            // Close editor if the deleted file is open
            if (currentFile && currentFile === path) {
                dispatch(invalidateUSSFile());
            }
            // Auto-refresh parent directory
            if (parentPath) {
                dispatch(fetchUSSChildren(parentPath));
            }
        } catch (error) {
            dispatch({ type: INVALIDATE_DELETE_USS, error: error.message });
            dispatch(pushNotification(`Delete failed for ${path}: ${error.message}`, 'error'));
        }
    };
}

/**
 * Download a USS file
 */
export function downloadUSSFile(filePath) {
    return async (dispatch) => {
        try {
            const response = await zosmfFetch(`/restfiles/fs${encodeURIComponent(filePath)}`, {
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
            a.download = filePath.split('/').pop();
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            dispatch(pushNotification(`Downloaded ${filePath.split('/').pop()}`, 'success'));
        } catch (error) {
            dispatch(pushNotification(`Download failed: ${error.message}`, 'error'));
        }
    };
}
