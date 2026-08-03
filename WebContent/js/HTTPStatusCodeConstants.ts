/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2019
 */

const HTTP_STATUS_CODES = {
    OK: 200,
    Created: 201,
    Accepted: 202,
    'Non-Authoritative Information': 203,
    'No Content': 204,
    'Reset Content': 205,
    'Partial Content': 206,
    'Multiple Choices': 300,
    'Moved Permanently': 301,
    Found: 302,
    'See Other': 303,
    'Not Modified': 304,
    'Use Proxy': 305,
    'Temporary Redirect': 307,
    'Bad Request': 400,
    Unauthorized: 401,
    'Payment Required': 402,
    Forbidden: 403,
    'Not Found': 404,
    'Method Not Allowed': 405,
    'Not Acceptable': 406,
    'Proxy Authentication Required': 407,
    'Request Timeout': 408,
    Conflict: 409,
    Gone: 410,
    'Length Required': 411,
    'Precondition Failed': 412,
    'Request Entity Too Large': 413,
    'Request-URI Too Long': 414,
    'Unsupported Media Type': 415,
    'Requested Range Not Satisfiable': 416,
    'Expectation Failed': 417,
    'Internal Server Error': 500,
    'Not Implemented': 501,
    'Bad Gateway': 502,
    'Service Unavailable': 503,
    'Gateway Timeout': 504,
    'HTTP Version Not Supported': 505,
};
export default HTTP_STATUS_CODES;
