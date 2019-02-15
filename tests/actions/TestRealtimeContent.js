/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */

import expect from 'expect';
import * as realtimeContent from '../../WebContent/js/actions/realtimeContent';

describe('Action: realtimeContent', () => {
    describe('request realtimeContent', () => {
        it('Should create an action to request realtimeContent', () => {
            const expectedAction = {
                type: realtimeContent.REQUEST_REALTIME_CONTENT,
            };
            expect(realtimeContent.requestRealtimeContent()).toEqual(expectedAction);
        });
    });

    describe('recieve realtimeContent', () => {
        it('Should create an action to recieve realtimeContent with content', () => {
            const expectedContent = 'Sample content\n another line \n another line';
            const expectedAction = {
                type: realtimeContent.RECEIVE_REALTIME_CONTENT,
                content: expectedContent,
            };
            expect(realtimeContent.receiveRealtimeContent(expectedContent)).toEqual(expectedAction);
        });

        it('Should create an action to recieve realtimeContent with content including blank lines', () => {
            const expectedContent = 'Sample content\n another line \n another line\n\n\n\n\n\n\n\n\ntest';
            const expectedAction = {
                type: realtimeContent.RECEIVE_REALTIME_CONTENT,
                content: expectedContent,
            };
            expect(realtimeContent.receiveRealtimeContent(expectedContent)).toEqual(expectedAction);
        });

        it('Should create an action to recieve realtimeContent with content including special characters', () => {
            const expectedContent = "Sample content\n another line \n another line!@£$%^&*()[]{};'\\'':\\|<>?,./`~";
            const expectedAction = {
                type: realtimeContent.RECEIVE_REALTIME_CONTENT,
                content: expectedContent,
            };
            expect(realtimeContent.receiveRealtimeContent(expectedContent)).toEqual(expectedAction);
        });
    });

    describe('invalidate realtimeContent', () => {
        it('Should create an action to invalidate the realtimeContent', () => {
            const expectedAction = {
                type: realtimeContent.INVALIDATE_REALTIME_CONTENT,
            };
            expect(realtimeContent.invalidateRealtimeContent()).toEqual(expectedAction);
        });
    });

    describe('mark realtimeContent read', () => {
        it('Should create an action to mark the realtimeContent as read', () => {
            const expectedAction = {
                type: realtimeContent.MARK_REALTIME_CONTENT_READ,
            };
            expect(realtimeContent.markRealtimeContentRead()).toEqual(expectedAction);
        });
    });
});
