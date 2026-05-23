/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2020
 */

import { Record } from 'immutable';
import { TOGGLE_FILTERS, SET_FILTERS, RESET_FILTERS } from '../actions/filters';

export const LOADING_MESSAGE = 'Loading...';

const FilterRecord = Record({
    prefix: '*',
    owner: '',
    status: '',
    sortBy: 'DEFAULT',
    jobId: '*',
    expand: false,
    showDD: '',
    isToggled: false,
});

const INITIAL_STATE = new FilterRecord();

export default function content(state = INITIAL_STATE, action) {
    switch (action.type) {
        case TOGGLE_FILTERS:
            return state.set('isToggled', action.isToggled);
        case SET_FILTERS:
            return state.merge(action.filters);
        case RESET_FILTERS: {
            const isToggled = state.get('isToggled');
            const owner = action.username.toUpperCase();
            return new FilterRecord({ isToggled, owner });
        }
        default:
            return state;
    }
}
