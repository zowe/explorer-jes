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
        content: null,
        isFetching: false,
        label: '',
    });

export const jobName = 'DEMOJOB';
export const jobId = 'JOB1234';
export const fileLabel = 'SYSOUT';

export const requestedContent =
    Map({
        content: null,
        isFetching: true,
        label: `Loading: ${fileLabel}`,
    });


export const receivedContent =
    Map({
        content: 'test',
        isFetching: false,
        label: `${jobName} - ${jobId} - ${fileLabel}`,
    });

export const invalidatedContent =
    Map({
        content: 'Unable to retrieve content',
        isFetching: false,
        label: 'Unable to retrieve content',
    });

export const toggledContent =
    Map({
        content: null,
        isFetching: false,
        label: '',
    });
