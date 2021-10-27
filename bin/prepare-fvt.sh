#!/bin/bash -e

################################################################################
# This program and the accompanying materials are made available under the terms of the
# Eclipse Public License v2.0 which accompanies this distribution, and is available at
# https://www.eclipse.org/legal/epl-v20.html
#
# SPDX-License-Identifier: EPL-2.0
#
# Copyright IBM Corporation 2018, 2021
################################################################################

################################################################################
# Prepare workspace for integration test
################################################################################

################################################################################
# constants
SCRIPT_NAME=$(basename "$0")
OLD_PWD=$(pwd)
SCRIPT_PWD=$(cd "$(dirname "$0")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_PWD" && cd .. && pwd)
FVT_UTILITIES_SCRIPTS_DIR=node_modules/explorer-fvt-utilities/scripts
FVT_WORKSPACE="${ROOT_DIR}/.fvt"
FVT_KEYSTORE_DIR=keystore
FVT_CONFIG_DIR=configs
FVT_LOGS_DIR=logs

FVT_EXPLORER_UI_PORT=10071
FVT_GATEWAY_HOST=explorer-jes

################################################################################
# variables
FVT_ZOSMF_HOST=$1
FVT_ZOSMF_PORT=$2
IMAGE_NAME_FULL_REMOTE=$3

################################################################################
cd "${ROOT_DIR}"
EXPLORER_PLUGIN_BASEURI=$(node -e "process.stdout.write(require('./package.json').config.baseuri)")
EXPLORER_PLUGIN_NAME=$(node -e "process.stdout.write(require('./package.json').config.pluginName)")
echo "[${SCRIPT_NAME}] FVT Test for ${EXPLORER_PLUGIN_NAME}"
echo

################################################################################
# validate parameters
# set default values
if [ -z "$FVT_ZOSMF_HOST" ]; then
  FVT_ZOSMF_HOST=zzow01.zowe.marist.cloud
fi
if [ -z "$FVT_ZOSMF_PORT" ]; then
  FVT_ZOSMF_PORT=10443
fi

################################################################################
# prepare pax workspace
echo "[${SCRIPT_NAME}] cleaning FVT workspace ..."
if [ -d "${FVT_WORKSPACE}" ]; then
  rm -fr "${FVT_WORKSPACE}"
fi
# mkdir -p "${FVT_WORKSPACE}/${FVT_PLUGIN_DIR}"
mkdir -p "${FVT_WORKSPACE}/${FVT_KEYSTORE_DIR}"
mkdir -p "${FVT_WORKSPACE}/${FVT_CONFIG_DIR}"
mkdir -p "${FVT_WORKSPACE}/${FVT_LOGS_DIR}"
# mkdir -p "${FVT_WORKSPACE}/${FVT_UI_SERVER_DIR}"
echo

################################################################################
# generate certificates
echo "[${SCRIPT_NAME}] generating certificates ..."
cd "${ROOT_DIR}"
./${FVT_UTILITIES_SCRIPTS_DIR}/generate-certificates.sh "${FVT_WORKSPACE}/${FVT_KEYSTORE_DIR}"
echo 
echo "[${SCRIPT_NAME}] fixing certificates permission caused by github actions ..."
cd ${FVT_WORKSPACE}/${FVT_KEYSTORE_DIR}
chmod 644 "localhost.cert.pem" "localhost.private.pem"
ls -l
echo

################################################################################
# write zosmf config
echo "[${SCRIPT_NAME}] writing z/OSMF config for APIML ..."
cd "${ROOT_DIR}"
./${FVT_UTILITIES_SCRIPTS_DIR}/prepare-zosmf-config.sh "${FVT_WORKSPACE}/${FVT_CONFIG_DIR}" "$FVT_ZOSMF_HOST" "$FVT_ZOSMF_PORT"

################################################################################
echo "[${SCRIPT_NAME}] writing Explorer Jes UI config for APIML ..."
cat > "${FVT_WORKSPACE}/${FVT_CONFIG_DIR}/jobs-ui.yml" << EOF
services:
- serviceId: explorer-jes
  title: IBM z/OS Jobs UI
  description: IBM z/OS Jobs UI service
  catalogUiTileId:
  instanceBaseUrls:
  - https://${FVT_GATEWAY_HOST}:${FVT_EXPLORER_UI_PORT}/
  homePageRelativeUrl:
  routedServices:
  - gatewayUrl: ui/v1
    serviceRelativeUrl: ${EXPLORER_PLUGIN_BASEURI}
EOF
echo

################################################################################
echo "[${SCRIPT_NAME}] test folder prepared:"
cd "${FVT_WORKSPACE}"
find . -print
echo

################################################################################
# start services
# NOTE: to kill all processes on Mac
#        ps aux | grep .fvt | grep -v grep | awk '{print $2}' | xargs kill -9
cd "${ROOT_DIR}"
echo "[${SCRIPT_NAME}] preparing APIML in docker compose ..."
cd "${ROOT_DIR}"
./${FVT_UTILITIES_SCRIPTS_DIR}/prepare-apiml.sh \
  "${FVT_WORKSPACE}" \
  "${FVT_WORKSPACE}/${FVT_KEYSTORE_DIR}" \
  "${FVT_WORKSPACE}/${FVT_CONFIG_DIR}" \
  "${FVT_WORKSPACE}/${FVT_LOGS_DIR}"
echo
echo "[${SCRIPT_NAME}] preparing explorer in docker compose ..."
# append the explore-jes image config to the same docker-compose.yml file
cat >> "$FVT_WORKSPACE/docker-compose.yml" << EOF
  explorer-jes:
    ports:
      - ${FVT_EXPLORER_UI_PORT}:${FVT_EXPLORER_UI_PORT}
    volumes:
      - ${FVT_WORKSPACE}/${FVT_KEYSTORE_DIR}:/keystore
    environment:
      JES_EXPLORER_UI_PORT: ${FVT_EXPLORER_UI_PORT}
      KEYSTORE_KEY: /keystore/localhost.private.pem
      KEYSTORE_CERTIFICATE: /keystore/localhost.cert.pem
    image: "$IMAGE_NAME_FULL_REMOTE"
EOF
echo "[${SCRIPT_NAME}] starting docker compose"
cd $FVT_WORKSPACE
docker compose up -d

################################################################################
echo "[${SCRIPT_NAME}] done."
exit 0
