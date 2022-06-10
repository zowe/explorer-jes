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
PAX_WORKSPACE="${ROOT_DIR}/.pax"
FVT_KEYSTORE_DIR=keystore
FVT_CONFIG_DIR=configs
FVT_NGINX_DIR=nginx
FVT_LOGS_DIR=logs

################################################################################
# variables
FVT_ZOSMF_HOST=$1
FVT_ZOSMF_PORT=$2

################################################################################
cd "${ROOT_DIR}"
EXPLORER_PLUGIN_NAME=$(node -e "process.stdout.write(require('./package.json').name)")
echo "[${SCRIPT_NAME}] FVT Test for ${EXPLORER_PLUGIN_NAME}"
echo

################################################################################
# validate parameters
# set default values
if [ -z "$FVT_ZOSMF_HOST" ]; then
  FVT_ZOSMF_HOST=zzow04.zowe.marist.cloud
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
mkdir -p "${FVT_WORKSPACE}/${FVT_KEYSTORE_DIR}"
mkdir -p "${FVT_WORKSPACE}/${FVT_CONFIG_DIR}"
mkdir -p "${FVT_WORKSPACE}/${FVT_NGINX_DIR}"
mkdir -p "${FVT_WORKSPACE}/${FVT_LOGS_DIR}"
echo

################################################################################
# write zosmf config
echo "[${SCRIPT_NAME}] prepare ${EXPLORER_PLUGIN_NAME} for testing ..."
${PAX_WORKSPACE}/prepare-workspace.sh
mkdir -p "${FVT_WORKSPACE}/${EXPLORER_PLUGIN_NAME}"
cp -r "${PAX_WORKSPACE}/ascii/". "${FVT_WORKSPACE}/${EXPLORER_PLUGIN_NAME}"
cp -r "${PAX_WORKSPACE}/content/". "${FVT_WORKSPACE}/${EXPLORER_PLUGIN_NAME}"

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
echo "[${SCRIPT_NAME}] writing ${EXPLORER_PLUGIN_NAME} config for APIML ..."
cat > "${FVT_WORKSPACE}/${FVT_CONFIG_DIR}/${EXPLORER_PLUGIN_NAME}.yml" << EOF
services:
- serviceId: ${EXPLORER_PLUGIN_NAME}
  title: IBM z/OS Explorer UI
  description: IBM z/OS Explorer UI service
  catalogUiTileId:
  instanceBaseUrls:
  - https://${EXPLORER_PLUGIN_NAME}:8443/
  homePageRelativeUrl:
  routedServices:
  - gatewayUrl: ui/v1
    serviceRelativeUrl: /web
EOF
echo

################################################################################
echo "[${SCRIPT_NAME}] writing ${EXPLORER_PLUGIN_NAME} web server config for nginx ..."
cat > "${FVT_WORKSPACE}/${FVT_NGINX_DIR}/default.conf" << EOF
server {
    listen              8443 ssl;
    server_name         ${EXPLORER_PLUGIN_NAME};
    ssl_certificate     /keystore/localhost.cert.pem;
    ssl_certificate_key /keystore/localhost.private.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }
}
EOF
echo

################################################################################
echo "[${SCRIPT_NAME}] preparing APIML in docker compose ..."
cd "${ROOT_DIR}"
./${FVT_UTILITIES_SCRIPTS_DIR}/prepare-apiml.sh \
  "${FVT_WORKSPACE}" \
  "${FVT_WORKSPACE}/${FVT_KEYSTORE_DIR}" \
  "${FVT_WORKSPACE}/${FVT_CONFIG_DIR}" \
  "${FVT_WORKSPACE}/${FVT_LOGS_DIR}"
echo
echo "[${SCRIPT_NAME}] preparing ${EXPLORER_PLUGIN_NAME} in docker compose ..."
cat >> "$FVT_WORKSPACE/docker-compose.yml" << EOF
  
  ${EXPLORER_PLUGIN_NAME}:
    volumes:
      - ${FVT_WORKSPACE}/${EXPLORER_PLUGIN_NAME}:/usr/share/nginx/html
      - ${FVT_WORKSPACE}/${FVT_KEYSTORE_DIR}:/keystore
      - ${FVT_WORKSPACE}/${FVT_NGINX_DIR}:/etc/nginx/conf.d
    image: nginx
EOF
echo "[${SCRIPT_NAME}] preparing test pod in docker compose ..."
cat >> "$FVT_WORKSPACE/docker-compose.yml" << EOF
  
  test-pod:
    image: jackjiaibm/ubuntu-toolbox
    command: ["/bin/sh", "-c", "sleep 3600"]
EOF
echo "[${SCRIPT_NAME}] display docker-compose.yml"
cd "${FVT_WORKSPACE}"

################################################################################
echo "[${SCRIPT_NAME}] test folder prepared:"
cd "${FVT_WORKSPACE}"
find . -print
echo

################################################################################
# start services
# NOTE: to kill all processes on Mac
#        ps aux | grep .fvt | grep -v grep | awk '{print $2}' | xargs kill -9
cat "$FVT_WORKSPACE/docker-compose.yml"
echo "[${SCRIPT_NAME}] starting docker compose"
cd "${FVT_WORKSPACE}"
docker compose up -d

################################################################################
echo "[${SCRIPT_NAME}] done."
exit 0
