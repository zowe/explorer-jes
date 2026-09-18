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
    LOCAL_HOSTNAME,
    LOCAL_HOST_SERVER,
    LOCAL_HOST_SERVER_WITH_PROTOCOL
} from './testResources/hostConstants';

Object.defineProperty(globalThis, 'location', {
    value: {
        host: LOCAL_HOST_SERVER,                       
        hostname: LOCAL_HOSTNAME,                     
        protocol: 'https:',                            
        href: LOCAL_HOST_SERVER_WITH_PROTOCOL,         
        origin: LOCAL_HOST_SERVER_WITH_PROTOCOL        
    },
    writable: true,
    configurable: true
});
