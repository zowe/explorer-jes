/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2020
 */

export function encodeURLComponent(URL: string) {
    return encodeURIComponent(URL);
}

export function atlasFetch(endpoint: string, content) {
    return fetch(`https://${location.host}/ibmzosmf/api/v1/${endpoint}`, content);
}
