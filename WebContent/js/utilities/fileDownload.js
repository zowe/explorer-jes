/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2020
 */

import { atlasFetch } from '../utilities/urlUtils';
import { constructAndPushMessage } from '../actions/snackbarNotifications';

export function createAndDownloadElement(blob, fileName) {
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = fileName;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
}

export function downloadFile(job, file, url, dispatch) {
    atlasFetch(url, { credentials: 'include' })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return dispatch(constructAndPushMessage('Unable to download file'));
        })
        .then(json => {
            const blob = new Blob([json.content], { type: 'text/plain' });
            const fileName = `${job.get('jobName')}-${job.get('jobId')}-${file.label}`;
            if (window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveBlob(blob, fileName);
            } else {
                createAndDownloadElement(blob, fileName);
            }
        });
}
