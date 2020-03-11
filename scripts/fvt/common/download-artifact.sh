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
DEFAULT_ARTIFACT_EXPLODE=true

################################################################################
# variables
ARTIFACT_PATTERN=$1
TARGET_DIR=$2
ARTIFACT_EXPLODE=$3

# ARTIFACT_EXPLODE is optional
if [ -z "${ARTIFACT_EXPLODE}" ]; then
  ARTIFACT_EXPLODE="${DEFAULT_ARTIFACT_EXPLODE}"
fi
# validate
if [ -z "${ARTIFACT_PATTERN}" ]; then
  echo "[${SCRIPT_NAME}][Error] parameter #1 (apiml artifact path) is required" >&2
  exit 1
fi
if [ -z "${TARGET_DIR}" ]; then
  echo "[${SCRIPT_NAME}][Error] parameter #2 (target directory) is required" >&2
  exit 1
fi
# this assume using 
TARGET_PARENT_DIR=$(dirname "${TARGET_DIR}")

################################################################################
# prepare and download artifact
if [[ $ARTIFACT_PATTERN = https://* ]]; then
  cd "${TARGET_DIR}"
  ARTIFACT_FILE=$(basename "${ARTIFACT_PATTERN}")
  echo "[${SCRIPT_NAME}] download artifact ${ARTIFACT_FILE} from url"
  curl "${ARTIFACT_PATTERN}" -o "$ARTIFACT_FILE"
  if [ ! -f "${ARTIFACT_FILE}" ]; then
    echo "[${SCRIPT_NAME}][Error] failed to download artifact from ${ARTIFACT_PATTERN}" >&2
    exit 2
  fi
  if [ "${ARTIFACT_EXPLODE}" == "true" ]; then
    unzip "${ARTIFACT_FILE}"
    rm -f "${ARTIFACT_FILE}"
  fi
else
  cd "${TARGET_PARENT_DIR}"
  echo "[${SCRIPT_NAME}] prepare artifact download spec"
  cat > "dl-spec.json" << EOF
{
  "files": [{
    "pattern": "${ARTIFACT_PATTERN}",
    "target": "${TARGET_DIR}/",
    "flat": "true",
    "explode": "${ARTIFACT_EXPLODE}",
    "sortBy": ["created"],
    "sortOrder": "desc",
    "limit": 1
  }]
}
EOF
  cat "dl-spec.json"
  echo "[${SCRIPT_NAME}] download artifact to target folder"
  jfrog rt dl --spec=dl-spec.json
  rm -f dl-spec.json
fi
echo
