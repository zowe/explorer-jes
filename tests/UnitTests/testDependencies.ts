/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */

import {
    LOCAL_HOST_SERVER_WITH_PROTOCOL as LOCAL_SERVER,
    LOCAL_HOSTNAME,
} from './testResources/hostConstants';

(global as any).location = {
    hostname: LOCAL_HOSTNAME,
    origin: `${LOCAL_SERVER}`,
};
