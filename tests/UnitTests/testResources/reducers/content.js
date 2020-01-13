/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2020
 */

import { Map, List } from 'immutable';
import { DEFAULT_TITLE } from '../../../WebContent/js/reducers/content';

export const baseContent =
    Map({
        content: List(),
        selectedContent: 0,
        isSubmittingJCL: false,
        title: DEFAULT_TITLE,
    });

export const jobName = 'DEMOJOB';
export const jobId = 'JOB1234';
export const fileLabel = 'SYSOUT';
export const fileLabel2 = 'JESJCL';

export const requestedContent =
    Map({
        content: List([{ label: `${jobId}-${fileLabel}`, content: '', isFetching: true }]),
        selectedContent: 0,
        isSubmittingJCL: false,
        title: `${DEFAULT_TITLE}`,
    });


export const receivedContent =
    Map({
        content: List([{ label: fileLabel, content: 'test', isFetching: false, readOnly: true }]),
        selectedContent: 0,
        isSubmittingJCL: false,
        title: `${DEFAULT_TITLE} [${fileLabel}]`,
    });

export const updatedContent = 'new updated Content';
export const receivedContentUpdated =
    Map({
        content: List([{ label: fileLabel, content: updatedContent, isFetching: false, readOnly: true }]),
        selectedContent: 0,
        isSubmittingJCL: false,
        title: `${DEFAULT_TITLE} [${fileLabel}]`,
    });


export const requestedContentWithExistingContent =
    Map({
        content: List([
            { label: fileLabel, content: 'test', isFetching: false, readOnly: true },
            { label: `${jobId}-${fileLabel2}`, content: '', isFetching: true },
        ]),
        selectedContent: 0,
        isSubmittingJCL: false,
        title: `${DEFAULT_TITLE} [${fileLabel}]`,
    });

export const receivedContent2 =
    Map({
        content: List([
            { label: fileLabel, content: 'test', isFetching: false, readOnly: true },
            { label: fileLabel2, content: 'test2', isFetching: false, readOnly: true },
        ]),
        selectedContent: 0,
        isSubmittingJCL: false,
        title: `${DEFAULT_TITLE} [${fileLabel2}]`,
    });

export const requestSubmitJCLContent =
    Map({
        content: List(),
        selectedContent: 0,
        isSubmittingJCL: true,
        title: `${DEFAULT_TITLE}`,
    });
