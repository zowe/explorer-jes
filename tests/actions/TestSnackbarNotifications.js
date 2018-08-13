/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018
 */

import expect from 'expect';
import * as snackbarNotifications from '../../WebContent/js/actions/snackbarNotifications';
import * as snackbarNotificationsResources from '../testResources/actions/snackbarNotifications';

describe('Action: snackbarNotifiactions', () => {
    describe('pushMessage', () => {
        it('Should create an action to push a message', () => {
            const expectedAction = {
                type: snackbarNotifications.PUSH_NOTIFICATION_MESSAGE,
                message: snackbarNotificationsResources.sampleMessage,
            };
            expect(snackbarNotifications.constructAndPushMessage(snackbarNotificationsResources.sampleMessageText)).toEqual(expectedAction);
        });
    });

    describe('popMessage', () => {
        it('Should create an action to pop a message', () => {
            const expectedAction = {
                type: snackbarNotifications.POP_NOTIFICATION_MESSAGE,
            };
            expect(snackbarNotifications.popMessage()).toEqual(expectedAction);
        });
    });
});
