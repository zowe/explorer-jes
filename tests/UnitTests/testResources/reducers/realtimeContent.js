/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */

import { Map } from 'immutable';

export const baseSyslog = Map({
    content: null,
    isFetching: false,
    unreadLines: 0,
});

export const fetchingSyslog = Map({
    content: null,
    isFetching: true,
    unreadLines: 0,
});

export const basicContent = 'ER                                        528 00000080  $HASP836         JOERBLDQ=NONE,DSLIMIT=10M,SAPI_OPT=NO,WS_OPT=NO\n'
+ 'NC0000000 MV2E     17095 14:10:45.94 *AXR022E 00000280  $DOUTDEF\n'
+ 'MR0000000 MV2E     17095 14:10:45.94 *AXR022E 00000080  $HASP836 OUTDEF 530\n' 
+ 'DR                                        530 00000080  $HASP836 OUTDEF  COPIES=255,DMNDSET=NO,JOENUM=20000,\n' 
+ 'DR                                        530 00000080  $HASP836         JOEFREE=19315,JOEWARN=80,OUTTIME=CREATE,\n' 
+ 'DR                                        530 00000080  $HASP836         PRTYLOW=2,PRTYHIGH=10,PRTYOUT=NO,PRYORATE=0,\n' 
+ 'DR                                        530 00000080  $HASP836         SEGLIM=100,STDFORM=STD,USERSET=NO,\n' 
+ 'ER                                        530 00000080  $HASP836         JOERBLDQ=NONE,DSLIMIT=10M,SAPI_OPT=NO,WS_OPT=NO\n' 
+ 'NC0000000 MV2E     17095 14:10:45.94 *AXR032E 00000280  $DQ\n' 
+ 'NR0000000 MV2E     17095 14:10:45.94 *AXR032E 00000080  $HASP647      1 XEQ A        MV2E';

export const fetchedSyslog = Map({
    content: `${basicContent}`,
    isFetching: false,
    unreadLines: 10,
});

export const fetchedSyslogMarkedRead = Map({
    content: `${basicContent}`,
    isFetching: false,
    unreadLines: 0,
});

export const fetchedSyslog0Lines = Map({
    content: '',
    isFetching: false,
    unreadLines: 0,
});

export const singleLineContent = 'ER                                        528 00000080  $HASP836         JOERBLDQ=NONE,DSLIMIT=10M,SAPI_OPT=NO,WS_OPT=NO';

export const fetchedSyslog1Line = Map({
    content: `${singleLineContent}`,
    isFetching: false,
    unreadLines: 1,
});

export const specialCharsContent = "!@£$%^&*&^%$£@'test'{C}<I>[C]`S`汉语/漢語Wałęsa æøå";

export const fetchedSyslogSpecialChars = Map({
    content: `${specialCharsContent}`,
    isFetching: false,
    unreadLines: 1,
});
