/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2019
 */

import { combineReducers } from 'redux-immutable';
import content from './content';
import jobNodes from './jobNodes';
import filters from './filters';
import validation from './validation';
import snackbarNotifications from './snackbarNotifications';
import ipExplorer from './ipExplorer';
import mvsExplorer from './mvsExplorer';
import ussExplorer from './ussExplorer';
import notifications from './notifications';

const REDUCERS = {
    content,
    jobNodes,
    filters,
    validation,
    snackbarNotifications,
    ipExplorer,
    mvsExplorer,
    ussExplorer,
    notifications,
};
export default combineReducers(REDUCERS);
