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

################################################################################
# variables
TARGET_DIR=$1
ZOSMF_HOST=$2
ZOSMF_PORT=$3

# validate
if [ -z "${TARGET_DIR}" ]; then
  echo "[${SCRIPT_NAME}][Error] parameter #1 (target directory) is required" >&2
  exit 1
fi
if [ -z "${ZOSMF_HOST}" ]; then
  echo "[${SCRIPT_NAME}][Error] parameter #2 (z/OSMF host name) is required" >&2
  exit 1
fi
if [ -z "${ZOSMF_PORT}" ]; then
  echo "[${SCRIPT_NAME}][Error] parameter #2 (z/OSMF port) is required" >&2
  exit 1
fi

################################################################################
echo "[${SCRIPT_NAME}] prepare z/OSMF config file for APIML"
cat > "${TARGET_DIR}/zosmf.yml" << EOF
services:
- serviceId: zosmf
  title: IBM z/OSMF
  description: IBM z/OS Management Facility REST API service
  catalogUiTileId: zosmf
  instanceBaseUrls:
  - https://${ZOSMF_HOST}:${ZOSMF_PORT}/zosmf/
  homePageRelativeUrl: https://${ZOSMF_HOST}:${ZOSMF_PORT}/zosmf/
  routes:
  - gatewayUrl: api/v1
    serviceRelativeUrl: /
  # authentication:
  #   scheme: zosmf
  apiInfo:
  - apiId: com.ibm.zosmf
    gatewayUrl: api/v1
    version: 2.x.0
    documentationUrl: https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.3.0/com.ibm.zos.v2r3.izua700/IZUHPINFO_RESTServices.htm

# z/OSMF services tile
catalogUiTiles:
  zosmf:
    title: z/OSMF services
    description: IBM z/OS Management Facility REST services
EOF
echo
