/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */

import { Map, List } from 'immutable';
import * as snackbarNotificationsResources from '../actions/snackbarNotifications';

export const baseNotifications =
Map({
    messages: new List([]),
});

export const oneMessageNotifications =
Map({
    messages: new List([snackbarNotificationsResources.sampleMessage]),
});
