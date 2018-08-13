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
        case_insensitive: true,
        keywords: {
            keyword: 'TO FOR END FROM WITH ON',
            //   literal: "INVALIDATE PENDING REQUEST REJECTED FAILED ENDED STARTED INSUFFICIENT",
            built_in: 'UID GID SID FID ID CL APPL CODE COMMAND EVENT NODE RC JOBNAME' +
        ' TIME USER GROUP NAME INTENT ALLOWED EFFECTIVE ACCESS REAL OLU ALIAS DLU' +
        ' SENSE',
        },
        contains: [
            hljs.APOS_STRING_MODE,
            hljs.QUOTE_STRING_MODE,
            {
            /* Datestamp */
                className: 'title',
                begin: '\\b\\d{2}:\\d{2}:\\d{2}\\.\\d{2}',
                relevance: 10,
            },
            {
            /* Hex */
                className: 'number',
                begin: '\\b[A-F0-9]{4,16}',
            },
            {
            /* JES Job Types */
                className: 'symbol',
                begin: '\\b(STC|JOB|TSU)\\d+',
            },
            {
            /* Message Codes */
                className: 'link',
                begin: '\\b[A-Z]{3,5}\\d{3,}(I|W|E|S)',
            },
            /*
        {
            // Begin multiline message
            className: "addition",
            variants: [
                {begin: "\\nM"},
                {begin: "^M"},
                {begin: "\\nN"},
                {begin: "^N"}
            ]
        },
        {
            // End multiline message
            className: "deletion",
            begin: "\\nE "
        },
        */
            {
            /* USS Path */
                className: 'string',
                begin: '\\b/.*',
            },
            hljs.NUMBER_MODE,
        ],
    };
};
