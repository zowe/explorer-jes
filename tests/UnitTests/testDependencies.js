/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */

import 'isomorphic-fetch';
import 'es6-promise';
import {
    LOCAL_HOST_SERVER_WITH_PROTOCOL as LOCAL_SERVER,
    LOCAL_HOSTNAME,
} from './testResources/hostConstants';

require.extensions['.css'] = () => {
    return null;
};
require.extensions['.png'] = () => {
    return null;
};
require.extensions['.jpg'] = () => {
    return null;
};

require('@babel/register')();
require('babel-polyfill');

global.location = {
    hostname: LOCAL_HOSTNAME,
    origin: `${LOCAL_SERVER}`,
};
