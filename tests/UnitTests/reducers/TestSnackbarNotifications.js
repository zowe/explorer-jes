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
import snackbarNotifications from '../../../WebContent/js/reducers/snackbarNotifications';
import * as snackbarNotificationsActions from '../../../WebContent/js/actions/snackbarNotifications';
import * as snackbarNotificationsActionsResources from '../testResources/actions/snackbarNotifications';
import * as snackbarNotificationsReducersResources from '../testResources/reducers/snackbarNotifications';

describe('Reducer: snackbarNotifications', () => {
    it('Should return the initial state', () => {
        expect(snackbarNotifications(undefined, {})).toEqual(snackbarNotificationsReducersResources.baseNotifications);
    });

    it('Should handle PUSH_NOTIFICATION_MESSAGE and push a new message Map to the the list', () => {
        const action = {
            type: snackbarNotificationsActions.PUSH_NOTIFICATION_MESSAGE,
            message: snackbarNotificationsActionsResources.sampleMessage,
        };
        expect(snackbarNotifications(snackbarNotificationsReducersResources.baseNotifications, action)).toEqual(snackbarNotificationsReducersResources.oneMessageNotifications);
    });

    it('Should handle POP_NOTIFICATION_MESSAGE and push a new message Map to the the list', () => {
        const action = {
            type: snackbarNotificationsActions.POP_NOTIFICATION_MESSAGE,
        };
        expect(snackbarNotifications(snackbarNotificationsReducersResources.oneMessageNotifications, action)).toEqual(snackbarNotificationsReducersResources.baseNotifications);
    });
});
