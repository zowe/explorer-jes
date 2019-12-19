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
import windowTitle from '../../WebContent/js/reducers/windowTitle';
import * as windowTitleActions from '../../WebContent/js/actions/windowTitle';
import * as windowTitleResources from '../testResources/reducers/windowTitle';

describe('Reducer: windowTitle', () => {
    it('Should return the initial state', () => {
        expect(windowTitle(undefined, {})).toEqual(windowTitleResources.baseTitle);
    });

    it('Should handle SET_TITLE', () => {
        const action = {
            type: windowTitleActions.SET_TITLE,
            title: windowTitleResources.title,
        };
        expect(windowTitle(windowTitleResources.baseTitle, action)).toEqual(windowTitleResources.receivedTitle);
    });

    it('Should handle RESET_TITLE when there is default title', () => {
        const action = {
            type: windowTitleActions.RESET_TITLE,
        };
        expect(windowTitle(windowTitleResources.baseTitle, action)).toEqual(windowTitleResources.resetedTitle);
    });

    it('Should handle RESET_TITLE when there is a title', () => {
        const action = {
            type: windowTitleActions.RESET_TITLE,
        };
        expect(windowTitle(windowTitleResources.receivedTitle, action)).toEqual(windowTitleResources.resetedTitle);
    });
});
