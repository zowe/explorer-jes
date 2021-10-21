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
ZOSMF_API_URL="${APIML_URL}/zosmf/restjobs/jobs"

echo "Getting apimlAuthToken"
APIML_AUTH_TOKEN=$(curl -k -c - -H "Content-Type: application/json" -d "{\"username\":\"${ZOWE_USERNAME}\",\"password\":\"${ZOWE_PASSWORD}\"}" "${APIML_LOGIN_ENDPOINT}" \
 | grep -o "apimlAuthenticationToken.*" \
 | sed 's/^.\{25\}//' )
echo "Got apimlAuthToken"

echo "Getting jobs"
JOB_OUTPUT=$(curl -X GET --header 'Accept: application/json' -k --cookie "apimlAuthenticationToken=${APIML_AUTH_TOKEN}" "${ZOSMF_API_URL}?prefix=TESTJOB*&owner=*")
JOB_LIST=$(echo "$JOB_OUTPUT" | jq -r '.items[]? | "\(.jobId),\(.jobName)"')
JOB_COUNT=$(echo "$JOB_LIST" | wc -l)
echo "Found $JOB_COUNT jobs to purge, they are $JOB_LIST"

for line in $JOB_LIST; do
  jobName=$(echo $line | awk -F, '{print $1;}')
  jobId=$(echo $line | awk -F, '{print $2;}')
  echo "Purging: ${ZOSMF_API_URL}/${jobName}/${jobId}"
  curl -k -X DELETE --cookie "apimlAuthenticationToken=${APIML_AUTH_TOKEN}" "${ZOSMF_API_URL}/${jobName}/${jobId}"
  echo "Jobname: $jobName, JobID: $jobId purged"
done 

echo "[${SCRIPT_NAME}] done."