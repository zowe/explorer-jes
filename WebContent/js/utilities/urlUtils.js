/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018
 */

let host = 'localhost:8443';
if (typeof location !== 'undefined') {
    const hostname = location.hostname;
    if (hostname !== 'localhost') {
        host = location.host;
    }
}
export const SERVER_LOCATION = host;

export function encodeURLComponent(URL) {
    return encodeURIComponent(URL);
}

export function atlasFetch(endpoint, content) {
    let server = SERVER_LOCATION;

    if (location.hostname === 'tester.test.com') {
        server = 'tester.test.com:7443';
    }
    return fetch(`https://${server}/api/v1/${endpoint}`, content);
}
