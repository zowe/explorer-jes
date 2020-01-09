/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */

export const message = {
    data:
        { messages:
            [
                { product:
                {
                    name: 'CICS',
                    version: '5.3',
                },
                message:
                    {
                        msgNumber: '0000',
                        msgProgram: '',
                        msgSystemAdminAction: '',
                        msgSystemProgrammerResponse: '',
                        msgLastUpdated: '',
                        msgErrorMessage: '',
                        msgProgrammerResponse: '',
                        msgWhere: '',
                        msgSystemAction: 'Dummy Action',
                        msgUserResponse: 'Dummy Response',
                        msgModule: 'DummyModule',
                        msgRelatedInfo: '',
                        msgText: '<!-- -->',
                        msgExplanation: 'Dummy Message Explanation',
                        msgAppendedMessage: '',
                        msgOperatorResponse: '',
                        ditaFileName: '',
                    },
                },
            ],
        },
    status: 'success',
};

export const emptyMessage = {
    data:
        {
            messages: [],
        },
    status: 'success',
};
