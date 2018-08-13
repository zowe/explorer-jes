/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018
 */

export const content =
    {
        content: 'Some message content',
        isContentHTML: undefined,
        isContentRealtime: undefined,
        label: undefined,
        sourceId: 'DummyId',
        type: 'RECEIVE_CONTENT',
    };

export const FAReport =
    '<div style="font-family:monospace; white-space:pre;"><div class="prolog">********************************************************************************\n' +
'* IBM Fault Analyzer for z/OS V13R1M0 (PI58441 2016/03/20)                     *\n' +
'' +
'*                                                                              *\n' +
'' +
'*     Copyright IBM Corp. 2000, 2016.  All rights reserved.                    *\n' +
'' +
'********************************************************************************\n' +
'' +
' \n' +
'' +
'JOBNAME: ATLJ0001  SYSTEM ABEND: 0C9              HPJ1      2016/12/05  17:19:01\n' +
'' +
' \n' +
'' +
' \n' +
'' +
'</div><div class="summary">Module TSTP0001, <a href="test">Some link</a> program REGS, source line #' +
' <a href="/FaultAnalyzer/api/historyFiles/ATLAS.TEST.HISTORY/faultEntries/F02711/source" class="sourceLink">16</a>: Abend <a href="/FaultAnalyzer/api/messages/S0C9"' +
'class="messageLink">S0C9</a> (Fixed-Point-Divide Exception)</div>';

export const FAReportNoAnchors =
    '<div style="font-family:monospace; white-space:pre;"><div class="prolog">********************************************************************************\n' +
'' +
'* IBM Fault Analyzer for z/OS V13R1M0 (PI58441 2016/03/20)                     *\n' +
'' +
'*                                                                              *\n' +
'' +
'*     Copyright IBM Corp. 2000, 2016.  All rights reserved.                    *\n' +
'' +
'********************************************************************************\n' +
'' +
' \n' +
'' +
'JOBNAME: ATLJ0001  SYSTEM ABEND: 0C9              HPJ1      2016/12/05  17:19:01\n' +
'' +
' \n' +
'' +
' \n' +
'' +
'</div><div class="summary">Module TSTP0001, Some link program REGS, source line # 16: Abend <span class="message-link">S0C9</span> (Fixed-Point-Divide Exception)</div>';

export const DSMemberContent = "//TSTJIMS  JOB (ADL),'ATLAS',MSGCLASS=0,CLASS=A,TIME=1440\n" +
'//*        THIS JOB SIMULATES AN IMS REGION FOR 60 SECONDS\n' +
'//IMS      EXEC PGM=DFSMVRC0\n' +
'//STEPLIB  DD DSN=ATLAS.TEST.LOAD,DISP=SHR\n' +
'//SYSPRINT DD SYSOUT=*\n' +
'//SYSOUT   DD SYSOUT=*\n' +
'//*\n';

export const DSMemberFetchResponse = {
    records: "//TSTJIMS  JOB (ADL),'ATLAS',MSGCLASS=0,CLASS=A,TIME=1440\n" +
'//*        THIS JOB SIMULATES AN IMS REGION FOR 60 SECONDS\n' +
'//IMS      EXEC PGM=DFSMVRC0\n' +
'//STEPLIB  DD DSN=ATLAS.TEST.LOAD,DISP=SHR\n' +
'//SYSPRINT DD SYSOUT=*\n' +
'//SYSOUT   DD SYSOUT=*\n' +
'//*\n',
};

export const DSRequestFailed = "Request for content using z/OSMF failed for dataset 'ATLAS.TEST.JCL(TSTJIS)'";

export const USSContent = 'Hello world';

export const USSChecksum = 'wugbwaskdugfasudfu';

export const USSFetchResponse = {
    content: USSContent,
    checksum: USSChecksum,
};

export const USSRequestFailed = "Could not read content from file '/u/jcain//hello1.txt':";
