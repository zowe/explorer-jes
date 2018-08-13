/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2018
 */

module.exports = hljs => {
    return {
        keywords: {
            keyword: 'COMMAND CNTL DD ENCNTL EXEC IF THEN ELSE ENDIF INCLUDE JCLIB JOB'
        + ' OUTPUT PEND PROC SET XMIT',
            literal: 'DSN DISP DCB UNIT VOL SYSOUT SPACE RECFM LRECL',
            built_in: 'PGM PROC PARM ADDRSPC ACCT TIME REGION COND DSNME DATAC MSGCLASS CLASS NOTIFY MSGLEVEL',
        },
        contains: [
            {
            /* Datestamp */
                className: 'title',
                variants: [
                    { begin: '\\b\\d{2}:\\d{2}:\\d{2}' },
                    { begin: '\\b\\d{2}:\\d{2}:\\d{2}\\.\\d{2}' },
                ],
                relevance: 10,
            },
            {
            // DSN prefix
                className: 'dsn',
                begin: 'DSN=',
                end: '[a-zA-Z0-9.()]+',
                excludeBegin: true,
                keywords: 'DSN=',
            },
            {
            /* Hex */
                className: 'number',
                variants: [
                    { begin: '\\b[a-fA-F0-9]{8}' },
                    { begin: '\\b[a-fA-F0-9]{8}_[a-fA-F0-9]{8}' },
                ],
            },
            {
            /* JES Job Types */
                className: 'symbol',
                begin: '\\b(STC|JOB|TSU)\\d+',
            },
            {
            // DD names
                className: 'title',
                begin: '//[^\\*]',
                end: ' ',
            // excludeEnd: true
            },
            hljs.COMMENT('//\\*', '$'),
            {
            // USS Path
                className: 'string',
                begin: "['\"]/{1}.*",
                end: "['\"]",
            },
            hljs.NUMBER_MODE,
            hljs.APOS_STRING_MODE,
            hljs.QUOTE_STRING_MODE,
        ],
    };
};
