/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

function handleMessageAdded(message) {

}

function handleMessageRemoved(id) {
}

async function sendJesNotificationsToZlux(message) {
    if (window.ZoweZLUX) {
        ZoweZLUX.notificationManager.addMessageHandler(window).then(res => {
            ZoweZLUX.notificationManager
                .createNotification('JES Explorer', message, 1, 'org.zowe.explorer-jes')
                .then(async notificationObj => {
                    await ZoweZLUX.notificationManager.notify(notificationObj);
                });
        });
    }
}

async function registerLaunchMetadata() {
    if (window.ZoweZLUX) { // TODO: Cannot use utilities/storageHelper.js for some reason
        localStorage.setItem("ZoweZLUX.iframe.launchMetadata", JSON.stringify(ZoweZLUX.iframe.launchMetadata));
    }
}
