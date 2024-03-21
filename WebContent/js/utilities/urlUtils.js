/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2020
 */

export function encodeURLComponent(URL) {
    return encodeURIComponent(URL);
}

export function whichServer() {
    let server = location.host;
    if (location.hostname === 'tester.test.com') {
        server = 'tester.test.com:7443';
    }
    return server;
}

// zosmf/
const ZOSMF_PREFIX_LENGTH = 6;

export function atlasFetch(endpoint, content) {
    // In v3, /ibmzosmf/api/v1 endpoint removes /zosmf part of a /zosmf URL, so string must be trimmed.
    const trimmedEndpoint = endpoint.substring(ZOSMF_PREFIX_LENGTH);

    return fetch(`https://${whichServer()}/ibmzosmf/api/v1/${trimmedEndpoint}`, content);
}
