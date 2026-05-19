/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { constructAndPushMessage } from './snackbarNotifications';

export const REQUEST_CONNECTIONS = 'REQUEST_CONNECTIONS';
export const RECEIVE_CONNECTIONS = 'RECEIVE_CONNECTIONS';
export const INVALIDATE_CONNECTIONS = 'INVALIDATE_CONNECTIONS';
export const REQUEST_RESERVED_PORTS = 'REQUEST_RESERVED_PORTS';
export const RECEIVE_RESERVED_PORTS = 'RECEIVE_RESERVED_PORTS';
export const INVALIDATE_RESERVED_PORTS = 'INVALIDATE_RESERVED_PORTS';
export const SET_IP_TAB = 'SET_IP_TAB';
export const SET_IP_FILTER = 'SET_IP_FILTER';
export const SET_TCPIP_NAME = 'SET_TCPIP_NAME';
export const RECEIVE_TCPIP_INFO = 'RECEIVE_TCPIP_INFO';

// The IP Explorer plugin data service base URL on Zowe
const IP_PLUGIN_BASE = '/ZLUX/plugins/org.zowe.explorer-ip/services/ipExplorer/_current';

function requestConnections() {
    return { type: REQUEST_CONNECTIONS };
}

function receiveConnections(connections) {
    return { type: RECEIVE_CONNECTIONS, connections };
}

function invalidateConnections(error) {
    return { type: INVALIDATE_CONNECTIONS, error };
}

function requestReservedPorts() {
    return { type: REQUEST_RESERVED_PORTS };
}

function receiveReservedPorts(ports) {
    return { type: RECEIVE_RESERVED_PORTS, ports };
}

function invalidateReservedPorts(error) {
    return { type: INVALIDATE_RESERVED_PORTS, error };
}

export function setIpTab(tab) {
    return { type: SET_IP_TAB, tab };
}

export function setIpFilter(filter) {
    return { type: SET_IP_FILTER, filter };
}

export function setTcpipName(tcpipName) {
    return { type: SET_TCPIP_NAME, tcpipName };
}

function receiveTcpipInfo(info) {
    return { type: RECEIVE_TCPIP_INFO, info };
}

/**
 * Helper to call the IP Explorer data service.
 * The service is hosted by the org.zowe.explorer-ip plugin on the same Zowe instance.
 */
function ipExplorerFetch(path) {
    return fetch(`${IP_PLUGIN_BASE}/${path}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    }).then(res => {
        if (!res.ok) {
            throw Error(res.statusText || `HTTP ${res.status}`);
        }
        return res.status === 204 ? null : res.json();
    });
}

/**
 * Fetch the default TCPIP job name from the IP Explorer service
 */
export function fetchDefaultTcpipName() {
    return dispatch => {
        return ipExplorerFetch('gettcpipname')
            .then(response => {
                if (response && response.tcpip && response.tcpip.tcpipName) {
                    dispatch(setTcpipName(response.tcpip.tcpipName));
                    return response.tcpip.tcpipName;
                }
                dispatch(setTcpipName('*'));
                return '*';
            })
            .catch(err => {
                dispatch(setTcpipName('*'));
                return '*';
            });
    };
}

/**
 * Fetch TCPIP stack info (IPv6 status, start time, etc.)
 */
export function fetchTcpipInfo(tcpipName) {
    return dispatch => {
        const jobName = tcpipName || '*';
        return ipExplorerFetch(`${jobName}/info`)
            .then(response => {
                if (response && response.info) {
                    dispatch(receiveTcpipInfo(response.info));
                }
            })
            .catch(err => {
                // Info is optional, don't fail hard
            });
    };
}

/**
 * Fetch active TCP/IP connections from the IP Explorer data service
 */
export function fetchConnections(tcpipName) {
    return dispatch => {
        dispatch(requestConnections());
        const jobName = tcpipName || '*';
        return ipExplorerFetch(`${jobName}/connections`)
            .then(response => {
                if (response && response.connections) {
                    dispatch(receiveConnections(response.connections));
                } else {
                    dispatch(receiveConnections([]));
                }
            })
            .catch(err => {
                dispatch(invalidateConnections(err.message));
                dispatch(constructAndPushMessage(`Failed to fetch connections: ${err.message}`));
            });
    };
}

/**
 * Fetch reserved ports from the IP Explorer data service
 */
export function fetchReservedPortsList(tcpipName) {
    return dispatch => {
        dispatch(requestReservedPorts());
        const jobName = tcpipName || '*';
        return ipExplorerFetch(`${jobName}/ports`)
            .then(response => {
                if (response && response.ports) {
                    // Flatten the useType object into a string like the original IP Explorer does
                    const ports = response.ports.map(p => ({
                        ...p,
                        useType: typeof p.useType === 'object'
                            ? Object.keys(p.useType).filter(k => p.useType[k])[0] || ''
                            : p.useType,
                        protocol: (p.flags && p.flags.TCP) ? 'TCP' : 'UDP',
                    }));
                    dispatch(receiveReservedPorts(ports));
                } else {
                    dispatch(receiveReservedPorts([]));
                }
            })
            .catch(err => {
                dispatch(invalidateReservedPorts(err.message));
                dispatch(constructAndPushMessage(`Failed to fetch reserved ports: ${err.message}`));
            });
    };
}
