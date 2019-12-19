/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */

import { Map } from 'immutable';

import { DEFAULT_TITLE } from '../../../WebContent/js/reducers/windowTitle';

export const baseTitle = Map({
    title: DEFAULT_TITLE,
});

export const title = 'JOB02508-JESMSGLG';

export const requestedTitle = Map({
    title,
});

export const receivedTitle = Map({
    title,
});

export const resetedTitle = Map({
    title: DEFAULT_TITLE,
});
