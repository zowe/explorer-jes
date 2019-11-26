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
import content from '../../WebContent/js/reducers/content';
import * as contentActions from '../../WebContent/js/actions/content';
import * as contentResources from '../testResources/reducers/content';

describe('Reducer: content', () => {
    it('Should return the initial state', () => {
        expect(content(undefined, {})).toEqual(contentResources.baseContent);
    });

    it('Should handle REQUEST_CONTENT', () => {
        const action = {
            type: contentActions.REQUEST_CONTENT,
            fileLabel: `${contentResources.jobId}-${contentResources.fileLabel}`,
        };
        expect(content(contentResources.baseContent, action)).toEqual(contentResources.requestedContent);
    });

    it('Should handle RECEIVE_CONTENT', () => {
        const action = {
            type: contentActions.RECEIVE_CONTENT,
            content: 'test',
            jobName: contentResources.jobName,
            fileLabel: contentResources.fileLabel,
            jobId: contentResources.jobId,
            readOnly: true,
        };
        expect(content(contentResources.baseContent, action)).toEqual(contentResources.receivedContent);
    });

    it('Should handle REQUEST_CONTENT when we already have existing content in the list', () => {
        const action = {
            type: contentActions.REQUEST_CONTENT,
            fileLabel: `${contentResources.jobId}-${contentResources.fileLabel2}`,
        };
        expect(content(contentResources.receivedContent, action)).toEqual(contentResources.requestedContentWithExistingContent);
    });

    it('Should handle RECEIVE_CONTENT when we already have existing content in the list', () => {
        const action = {
            type: contentActions.RECEIVE_CONTENT,
            content: 'test2',
            jobName: contentResources.jobName,
            fileLabel: contentResources.fileLabel2,
            jobId: contentResources.jobId,
            readOnly: true,
        };
        expect(content(contentResources.requestedContentWithExistingContent, action)).toEqual(contentResources.receivedContent2);
    });

    it('Should handle CHANGE_SELECTED_CONTENT', () => {
        const action = { type: contentActions.CHANGE_SELECTED_CONTENT, newSelectedContent: 1 };
        expect(content(contentResources.baseContent, action)).toEqual(contentResources.baseContent.set('selectedContent', 1));
    });

    it('Should handle REMOVE_CONTENT', () => {
        const action = { type: contentActions.REMOVE_CONTENT, index: 0 };
        expect(content(contentResources.receivedContent, action)).toEqual(contentResources.baseContent);
    });

    it('Should hande UPDATE_CONTENT', () => {
        const updatedContent = contentResources.updatedContent;
        const action = { type: contentActions.UPDATE_CONTENT, content: updatedContent };
        expect(content(contentResources.receivedContent, action)).toEqual(contentResources.receivedContentUpdated);
    });

    it('Should handle REQUEST_SUBMIT_JCL', () => {
        const action = { type: contentActions.REQUEST_SUBMIT_JCL };
        expect(content(contentResources.baseContent, action)).toEqual(contentResources.requestSubmitJCLContent);
    });

    it('Should handle RECEIVE_SUBMIT_JCL', () => {
        const action = { type: contentActions.RECEIVE_SUBMIT_JCL };
        expect(content(contentResources.requestSubmitJCLContent, action)).toEqual(contentResources.baseContent);
    });

    it('Should handle INVALIDATE_SUBMIT_JCL', () => {
        const action = { type: contentActions.INVALIDATE_SUBMIT_JCL };
        expect(content(contentResources.requestSubmitJCLContent, action)).toEqual(contentResources.baseContent);
    });
});
