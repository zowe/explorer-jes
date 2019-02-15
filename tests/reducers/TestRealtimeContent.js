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
import realtimeContent from '../../WebContent/js/reducers/realtimeContent';
import * as realtimeContentActions from '../../WebContent/js/actions/realtimeContent';
import * as syslogResources from '../testResources/reducers/realtimeContent';

describe('Reducer: syslog', () => {
    it('Should return the INITIAL_STATE', () => {
        expect(realtimeContent(undefined, {})).toEqual(syslogResources.baseSyslog);
    });

    it('Should handle REQUEST_REALTIME_CONTENT and set isFetching to true', () => {
        const action = { type: realtimeContentActions.REQUEST_REALTIME_CONTENT };
        expect(realtimeContent(syslogResources.baseSyslog, action)).toEqual(syslogResources.fetchingSyslog);
    });

    it('Should handle RECEIVE_REALTIME_CONTENT with 10 lines of content', () => {
        const action = { type: realtimeContentActions.RECEIVE_REALTIME_CONTENT, content: syslogResources.basicContent };
        expect(realtimeContent(syslogResources.fetchingSyslog, action)).toEqual(syslogResources.fetchedSyslog);
    });

    it('Should handle RECEIVE_REALTIME_CONTENT with 0 lines of content', () => {
        const action = { type: realtimeContentActions.RECEIVE_REALTIME_CONTENT, content: '' };
        expect(realtimeContent(syslogResources.fetchingSyslog, action)).toEqual(syslogResources.fetchedSyslog0Lines);
    });

    it('Should handle RECEIVE_REALTIME_CONTENT with 1 line of content', () => {
        const action = { type: realtimeContentActions.RECEIVE_REALTIME_CONTENT, content: syslogResources.singleLineContent };
        expect(realtimeContent(syslogResources.fetchingSyslog, action)).toEqual(syslogResources.fetchedSyslog1Line);
    });

    it('Should handle RECEIVE_REALTIME_CONTENT with special chars in content', () => {
        const action = { type: realtimeContentActions.RECEIVE_REALTIME_CONTENT, content: syslogResources.specialCharsContent };
        expect(realtimeContent(syslogResources.fetchingSyslog, action)).toEqual(syslogResources.fetchedSyslogSpecialChars);
    });

    it('Should handle INVALIDATE_REALTIME_CONTENT and return initial state when we have content', () => {
        const action = { type: realtimeContentActions.INVALIDATE_REALTIME_CONTENT };
        expect(realtimeContent(syslogResources.fetchedSyslog, action)).toEqual(syslogResources.baseSyslog);
    });

    it("Should handle INVALIDATE_REALTIME_CONTENT and return initial state when there's empty content", () => {
        const action = { type: realtimeContentActions.INVALIDATE_REALTIME_CONTENT };
        expect(realtimeContent(syslogResources.fetchedSyslog0Lines, action)).toEqual(syslogResources.baseSyslog);
    });

    it('Should handle INVALIDATE_REALTIME_CONTENT and return intitial state when only isFetching is set', () => {
        const action = { type: realtimeContentActions.INVALIDATE_REALTIME_CONTENT };
        expect(realtimeContent(syslogResources.fetchingSyslog, action)).toEqual(syslogResources.baseSyslog);
    });

    it('Should handle MARK_REALTIME_CONTENT_READ and set unreadLines to 0', () => {
        const action = { type: realtimeContentActions.MARK_REALTIME_CONTENT_READ };
        expect(realtimeContent(syslogResources.fetchedSyslog, action)).toEqual(syslogResources.fetchedSyslogMarkedRead);
    });
});
