#!/bin/bash -e

################################################################################
# This program and the accompanying materials are made available under the terms of the
# Eclipse Public License v2.0 which accompanies this distribution, and is available at
# https://www.eclipse.org/legal/epl-v20.html
#
# SPDX-License-Identifier: EPL-2.0
#
# Copyright IBM Corporation 2020
################################################################################

################################################################################
# contants
SCRIPT_NAME=$(basename "$0")
DEFAULT_FVT_GATEWAY_PORT=7554

if [ -z "${FVT_GATEWAY_PORT}" ]; then
  FVT_GATEWAY_PORT="${DEFAULT_FVT_GATEWAY_PORT}"
fi

APIML_URL="https://localhost:${FVT_GATEWAY_PORT}"
APIML_LOGIN_ENDPOINT="${APIML_URL}/api/v1/gateway/auth/login"
JOBS_API_URL="${APIML_URL}/api/v1/jobs"

APIML_AUTH_TOKEN=$(curl -k -c - -H "Content-Type: application/json" -d "{\"username\":\"${ZOWE_USERNAME}\",\"password\":\"${ZOWE_PASSWORD}\"}" "${APIML_LOGIN_ENDPOINT}" \
 | grep -o "apimlAuthenticationToken.*" \
 | sed 's/^.\{25\}//' )
JOB_OUTPUT=$(curl -k --cookie "apimlAuthenticationToken=${APIML_AUTH_TOKEN}" "${JOBS_API_URL}?prefix=TESTJOB*&owner=*")
JOB_NAMES=( $( echo $JOB_OUTPUT | grep -o "TESTJOB.") )
JOB_IDS=( $( echo $JOB_OUTPUT | grep -o "JOB.....\b") )

total=${#JOB_IDS[*]}
echo "Found ${total} jobs to purge"
for (( i=0; i<total; i++)) do
    jobName=${JOB_NAMES[$i]}
    jobId=${JOB_IDS[$i]}
    echo "Purging: ${JOBS_API_URL}/${jobName}/${jobId}"
    curl -k -X DELETE --cookie "apimlAuthenticationToken=${APIML_AUTH_TOKEN}" "${JOBS_API_URL}/${jobName}/${jobId}"
done
