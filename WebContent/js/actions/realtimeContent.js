/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2018
 */

export const REQUEST_REALTIME_CONTENT = 'REQUEST_REALTIME_CONTENT';
export const RECEIVE_REALTIME_CONTENT = 'RECEIVE_REALTIME_CONTENT';
export const INVALIDATE_REALTIME_CONTENT = 'INVALIDATE_REALTIME_CONTENT';
export const MARK_REALTIME_CONTENT_READ = 'MARK_REALTIME_CONTENT_READ';

export function requestRealtimeContent() {
    return {
        type: REQUEST_REALTIME_CONTENT,
    };
}

export function receiveRealtimeContent(content) {
    return {
        type: RECEIVE_REALTIME_CONTENT,
        content,
    };
}

export function invalidateRealtimeContent() {
    return {
        type: INVALIDATE_REALTIME_CONTENT,
    };
}

export function markRealtimeContentRead() {
    return {
        type: MARK_REALTIME_CONTENT_READ,
    };
}
