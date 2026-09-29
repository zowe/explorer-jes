/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 */

// Job statuses the UI offers, and the only non-wildcard status an app2app sender may set.
export const STATUS_TYPES = ['ACTIVE'];

// Filters an app2app sender is allowed to drive, and the shape their values must have.
// showDD is matched against a job file's DD name and expand is read as a boolean by JobInstance,
// so the two are validated differently from the search filters.
const APP2APP_TEXT_FILTER_KEYS = ['owner', 'prefix', 'jobId', 'status', 'showDD'];
const MAX_FILTER_LENGTH = 8;
const FILTER_VALUE_PATTERN = /^[A-Z0-9$#@*%]*$/;

export function getAllowedApp2AppOrigins() {
    return [window.location.origin];
}

export function isTrustedApp2AppSender(event) {
    if (getAllowedApp2AppOrigins().indexOf(event.origin) === -1) {
        return false;
    }
    // Only the window embedding us may drive app2app. Both parent and top are accepted so a nested
    // desktop still works; window.parent and window.top are window itself when we are standalone,
    // which is why our own messages are excluded.
    if (event.source === window) {
        return false;
    }
    return event.source === window.parent || event.source === window.top;
}

/**
 * Reduces an app2app payload to known filters with well-formed values. Applied on top of the origin
 * check because sibling plugins in the desktop share our origin, so origin alone cannot tell them
 * apart from the desktop itself. Returns null when nothing usable survives.
 */
export function sanitizeApp2AppFilters(messageData) {
    if (!messageData || typeof messageData !== 'object' || Array.isArray(messageData)) {
        return null;
    }
    const filters: any = {};
    APP2APP_TEXT_FILTER_KEYS.forEach(key => {
        const raw = messageData[key];
        if (typeof raw !== 'string') {
            return;
        }
        const value = raw.trim().toUpperCase();
        if (!value || value.length > MAX_FILTER_LENGTH || !FILTER_VALUE_PATTERN.test(value)) {
            return;
        }
        if (key === 'status' && value !== '*' && STATUS_TYPES.indexOf(value) === -1) {
            return;
        }
        filters[key] = value;
    });
    if (typeof messageData.expand === 'boolean') {
        filters.expand = messageData.expand;
    }
    return Object.keys(filters).length > 0 ? filters : null;
}

export function readLaunchMetadataFromStorage() {
    try {
        return JSON.parse(localStorage.getItem('ZoweZLUX.iframe.launchMetadata'));
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Ignoring malformed ZoweZLUX.iframe.launchMetadata');
        return null;
    }
}
