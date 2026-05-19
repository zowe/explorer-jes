/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { Map, List } from 'immutable';

import {
    REQUEST_CONNECTIONS,
    RECEIVE_CONNECTIONS,
    INVALIDATE_CONNECTIONS,
    REQUEST_RESERVED_PORTS,
    RECEIVE_RESERVED_PORTS,
    INVALIDATE_RESERVED_PORTS,
    SET_IP_TAB,
    SET_IP_FILTER,
    SET_TCPIP_NAME,
    RECEIVE_TCPIP_INFO,
} from '../actions/ipExplorer';

const INITIAL_STATE = Map({
    connections: List([]),
    reservedPorts: List([]),
    isFetchingConnections: false,
    isFetchingPorts: false,
    connectionsError: '',
    portsError: '',
    connectionsTimestamp: null,
    portsTimestamp: null,
    activeTab: 0,
    filter: '',
    tcpipName: '*',
    tcpipInfo: Map({}),
});

export default function ipExplorer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case REQUEST_CONNECTIONS:
            return state.set('isFetchingConnections', true).set('connectionsError', '');
        case RECEIVE_CONNECTIONS:
            return state.merge({
                isFetchingConnections: false,
                connections: List(action.connections),
                connectionsTimestamp: new Date().toLocaleString(),
                connectionsError: '',
            });
        case INVALIDATE_CONNECTIONS:
            return state.merge({
                isFetchingConnections: false,
                connectionsError: action.error,
            });
        case REQUEST_RESERVED_PORTS:
            return state.set('isFetchingPorts', true).set('portsError', '');
        case RECEIVE_RESERVED_PORTS:
            return state.merge({
                isFetchingPorts: false,
                reservedPorts: List(action.ports),
                portsTimestamp: new Date().toLocaleString(),
                portsError: '',
            });
        case INVALIDATE_RESERVED_PORTS:
            return state.merge({
                isFetchingPorts: false,
                portsError: action.error,
            });
        case SET_IP_TAB:
            return state.set('activeTab', action.tab);
        case SET_IP_FILTER:
            return state.set('filter', action.filter);
        case SET_TCPIP_NAME:
            return state.set('tcpipName', action.tcpipName);
        case RECEIVE_TCPIP_INFO:
            return state.set('tcpipInfo', Map(action.info));
        default:
            return state;
    }
}
