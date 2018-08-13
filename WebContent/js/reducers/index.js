/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2018
 */

import { combineReducers } from 'redux-immutable';
import content from './content';
import treeNodesJobs from './treeNodesJobs';
import filters from './filters';
import validation from './validation';
import realtimeContent from './realtimeContent';
import snackbarNotifications from './snackbarNotifications';

const REDUCERS = {
    content,
    treeNodesJobs,
    filters,
    validation,
    realtimeContent,
    snackbarNotifications };
export default combineReducers(REDUCERS);
