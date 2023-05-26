/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2020
 */

export const ENABLE_REDUX_LOGGER = 'ZoweJes.enableReduxLogger';
export const NOTIFICATION_DURATION = 'ZoweJes.notificationDuration';
export const LAST_FILTERS = 'ZoweJes.lastFilters';

export function getStorageItem(storageKey) {
    try {
        return JSON.parse(window.localStorage.getItem(storageKey));
    } catch (err) {
        return '';
    }
}

export function setStorageItem(storageKey, value) {
    return window.localStorage.setItem(storageKey, value);
}
