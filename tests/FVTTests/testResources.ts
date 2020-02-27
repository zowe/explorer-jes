/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2020
 */
export const TEST_JOB_PREFIX = 'TESTJOB';

export const SHORT_JOB = `//${TEST_JOB_PREFIX}S JOB (),MSGCLASS=H\n//STEP1 EXEC PGM=BPXBATCH,PARM='sh sleep 10' \n //* COMMENT LINE`;

export const LONG_JOB = `//${TEST_JOB_PREFIX}L JOB (),MSGCLASS=H\n//STEP1 EXEC PGM=BPXBATCH,PARM='sh sleep 300' \n //* COMMENT LINE`;

export const JCL_ERROR_JOB = `//${TEST_JOB_PREFIX}E JOB (),MSGCLASS=H\n//STE1 EXEC PGM=BPXBATCH,PARM='sh sleep 300' \n //* COMMENT LINE`;

