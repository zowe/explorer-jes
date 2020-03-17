/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2020
 */

let host = 'tvt5003.svl.ibm.com:7554';
if (typeof location !== 'undefined') {
    const hostname = location.hostname;
    if (hostname !== 'localhost' || process.env.NODE_ENV === 'production') {
        host = location.host;
    }
}

export function encodeURLComponent(URL) {
    return encodeURIComponent(URL);
}

export function whichServer() {
    let server = host;
    if (location.hostname === 'tester.test.com') {
        server = 'tester.test.com:7443';
    }
    return server;
}

export function atlasFetch(endpoint, content) {
    return fetch(`https://${whichServer()}/api/v1/${endpoint}`, content);
}
