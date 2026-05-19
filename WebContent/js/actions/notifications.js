/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION ACTION TYPES
// ═══════════════════════════════════════════════════════════════

export const PUSH_NOTIFICATION = 'PUSH_NOTIFICATION';
export const POP_NOTIFICATION = 'POP_NOTIFICATION';
export const CLEAR_NOTIFICATIONS = 'CLEAR_NOTIFICATIONS';

let notificationId = 0;

/**
 * Push a notification message to the snackbar queue
 * @param {string} message - The notification text
 * @param {string} severity - 'success' | 'error' | 'warning' | 'info'
 */
export function pushNotification(message, severity = 'info') {
    return {
        type: PUSH_NOTIFICATION,
        notification: {
            id: ++notificationId,
            message,
            severity,
            timestamp: Date.now(),
        },
    };
}

/**
 * Remove the oldest notification (after it's been displayed)
 */
export function popNotification() {
    return { type: POP_NOTIFICATION };
}

/**
 * Clear all notifications
 */
export function clearNotifications() {
    return { type: CLEAR_NOTIFICATIONS };
}
