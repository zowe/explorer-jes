/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018
 */

import { Map } from 'immutable';

export const baseContent =
    Map({
        sourceId: null,
        content: null,
        isContentHTML: false,
        isContentRealtime: false,
        isFetching: false,
        label: '',
    });

export const requestedContent =
    Map({
        sourceId: null,
        content: null,
        isContentHTML: false,
        isContentRealtime: false,
        isFetching: true,
        label: '',
    });

export const receivedContent =
    Map({
        sourceId: 'jobs/JCAIN/ids/TSU05471/files/101',
        content: 'test',
        isContentHTML: false,
        isContentRealtime: false,
        isFetching: false,
        label: 'SYSOUT',
    });

export const invalidatedContent =
    Map({
        sourceId: undefined,
        content: 'Unable to retrieve content',
        isContentHTML: undefined,
        isContentRealtime: undefined,
        isFetching: false,
        label: 'Unable to retrieve content',
    });

export const toggledContent =
    Map({
        sourceId: null,
        content: null,
        isContentHTML: false,
        isContentRealtime: false,
        isFetching: false,
        label: '',
    });
