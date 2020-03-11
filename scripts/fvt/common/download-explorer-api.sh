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
SCRIPT_PWD=$(cd "$(dirname "$0")" && pwd)

################################################################################
# variables
API_ARTIFACT=$1
TARGET_DIR=$2

################################################################################
cd "${SCRIPT_PWD}"
./download-artifact.sh "${API_ARTIFACT}" "${TARGET_DIR}" "true"

################################################################################
echo "[${SCRIPT_NAME}] verify API download result"
cd "${TARGET_DIR}"
API_BOOT_JAR=$(find . -name '*-boot.jar')
if [ -z "${API_BOOT_JAR}" ]; then
  echo "[${SCRIPT_NAME}][error] failed to find API boot jar."
  exit 1
fi
echo
