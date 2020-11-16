#!/bin/bash -e

################################################################################
# This program and the accompanying materials are made available under the terms of the
# Eclipse Public License v2.0 which accompanies this distribution, and is available at
# https://www.eclipse.org/legal/epl-v20.html
#
# SPDX-License-Identifier: EPL-2.0
#
# Copyright IBM Corporation 2018, 2019
################################################################################

################################################################################
# Prepare workspace for integration test
################################################################################

################################################################################
# contants
SCRIPT_NAME=$(basename "$0")
OLD_PWD=$(pwd)
SCRIPT_PWD=$(cd "$(dirname "$0")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_PWD" && cd .. && pwd)
FVT_UTILITIES_SCRIPTS_DIR=node_modules/explorer-fvt-utilities/scripts
FVT_WORKSPACE="${ROOT_DIR}/.fvt"
FVT_APIML_DIR=api-layer
FVT_JOBS_API_DIR=jobs-api
FVT_PLUGIN_DIR=jes_explorer
FVT_UI_SERVER_DIR=ui-server
FVT_KEYSTORE_DIR=keystore
FVT_CONFIG_DIR=configs
FVT_LOGS_DIR=logs

FVT_API_PORT=10491
FVT_EXPLORER_UI_PORT=10071
FVT_DEFAULT_API_GATEWAY_PORT=7554
FVT_GATEWAY_HOST=localhost

################################################################################
# variables
FVT_APIML_ARTIFACT=$1
FVT_JOBS_API_ARTIFACT=$2
FVT_ZOSMF_HOST=$3
FVT_ZOSMF_PORT=$4

################################################################################
cd "${ROOT_DIR}"
EXPLORER_PLUGIN_BASEURI=$(node -e "process.stdout.write(require('./package.json').config.baseuri)")
EXPLORER_PLUGIN_NAME=$(node -e "process.stdout.write(require('./package.json').config.pluginName)")
echo "[${SCRIPT_NAME}] FVT Test for ${EXPLORER_PLUGIN_NAME}"
echo

################################################################################
# validate parameters
# set default values
if [ -z "$FVT_APIML_ARTIFACT" ]; then
  FVT_APIML_ARTIFACT="libs-release-local/org/zowe/apiml/sdk/zowe-install/*/zowe-install-*.zip"
  echo "[${SCRIPT_NAME}][warn] APIML artifact is not defined, using default value."
fi
if [ -z "$FVT_JOBS_API_ARTIFACT" ]; then
  FVT_JOBS_API_ARTIFACT="libs-snapshot-local/org/zowe/explorer/jobs/*/jobs-server-zowe-package-*.zip"
  echo "[${SCRIPT_NAME}][warn] Jobs API artifact is not defined, using default value."
fi
if [ -z "$FVT_ZOSMF_HOST" ]; then
  FVT_ZOSMF_HOST=river.zowe.org
fi
if [ -z "$FVT_ZOSMF_PORT" ]; then
  FVT_ZOSMF_PORT=10443
fi
if [ -z "${FVT_GATEWAY_PORT}" ]; then
  FVT_GATEWAY_PORT="${FVT_DEFAULT_API_GATEWAY_PORT}"
fi

################################################################################
# prepare pax workspace
echo "[${SCRIPT_NAME}] cleaning FVT workspace ..."
if [ -d "${FVT_WORKSPACE}" ]; then
  rm -fr "${FVT_WORKSPACE}"
fi
mkdir -p "${FVT_WORKSPACE}/${FVT_APIML_DIR}"
mkdir -p "${FVT_WORKSPACE}/${FVT_JOBS_API_DIR}"
mkdir -p "${FVT_WORKSPACE}/${FVT_PLUGIN_DIR}"
mkdir -p "${FVT_WORKSPACE}/${FVT_KEYSTORE_DIR}"
mkdir -p "${FVT_WORKSPACE}/${FVT_CONFIG_DIR}"
mkdir -p "${FVT_WORKSPACE}/${FVT_LOGS_DIR}"
mkdir -p "${FVT_WORKSPACE}/${FVT_UI_SERVER_DIR}"
echo

################################################################################
# prepare UI package
echo "[${SCRIPT_NAME}] prepare plugin package ..."
cd "${ROOT_DIR}"
./.pax/prepare-workspace.sh
echo

################################################################################
# prepare UI package
echo "[${SCRIPT_NAME}] copying plugin to target test folder ..."
cd "${ROOT_DIR}"
cp -R .pax/content/. "${FVT_WORKSPACE}/${FVT_PLUGIN_DIR}/"
cp -R .pax/ascii/. "${FVT_WORKSPACE}/${FVT_PLUGIN_DIR}/"
cd "${FVT_WORKSPACE}/${FVT_PLUGIN_DIR}"
echo

################################################################################
# Explorer UI Server
echo "[${SCRIPT_NAME}] copying explorer UI server ..."	
# fetch latest version of explorer ui server
cd "${FVT_WORKSPACE}/${FVT_UI_SERVER_DIR}"
npm init -y
npm install explorer-ui-server --ignore-scripts --registry=https://zowe.jfrog.io/zowe/api/npm/npm-release/
mv node_modules/explorer-ui-server/* .	
echo

################################################################################
# download APIML
echo "[${SCRIPT_NAME}] downloading APIML to target folder ${FVT_APIML_DIR} ..."
cd "${ROOT_DIR}"
./${FVT_UTILITIES_SCRIPTS_DIR}/download-apiml.sh \
  "${FVT_APIML_ARTIFACT}" \
  "${FVT_WORKSPACE}/${FVT_APIML_DIR}"
echo

################################################################################
# download jobs API
echo "[${SCRIPT_NAME}] downloading jobs API to target folder ${FVT_JOBS_API_DIR} ..."
cd "${ROOT_DIR}"
./${FVT_UTILITIES_SCRIPTS_DIR}/download-explorer-api.sh \
  "${FVT_JOBS_API_ARTIFACT}" \
  "${FVT_WORKSPACE}/${FVT_JOBS_API_DIR}"
echo

################################################################################
# generate certificates
echo "[${SCRIPT_NAME}] generating certificates ..."
cd "${ROOT_DIR}"
./${FVT_UTILITIES_SCRIPTS_DIR}/generate-certificates.sh "${FVT_WORKSPACE}/${FVT_KEYSTORE_DIR}"
echo

################################################################################
# write zosmf config
echo "[${SCRIPT_NAME}] writing z/OSMF config for APIML ..."
cd "${ROOT_DIR}"
./${FVT_UTILITIES_SCRIPTS_DIR}/prepare-zosmf-config.sh "${FVT_WORKSPACE}/${FVT_CONFIG_DIR}" "$FVT_ZOSMF_HOST" "$FVT_ZOSMF_PORT"
echo "[${SCRIPT_NAME}] writing jobs API config for APIML ..."
cat > "${FVT_WORKSPACE}/${FVT_CONFIG_DIR}/jobs-api.yml" << EOF
services:
- serviceId: jobs
  title: IBM z/OS Jobs
  description: IBM z/OS Jobs REST API service
  catalogUiTileId: jobs
  instanceBaseUrls:
  - https://${FVT_GATEWAY_HOST}:${FVT_API_PORT}/
  homePageRelativeUrl:
  routedServices:
  - gatewayUrl: api/v2
    serviceRelativeUrl: api/v2/jobs
  apiInfo:
  - apiId: com.ibm.jobs
    gatewayUrl: api/v2
    version: 1.0.0
    swaggerUrl: https://${FVT_GATEWAY_HOST}:${FVT_API_PORT}/v2/api-docs
    documentationUrl: https://${FVT_GATEWAY_HOST}:${FVT_API_PORT}/swagger-ui.html
catalogUiTiles:
  jobs:
    title: z/OS Jobs services
    description: IBM z/OS Jobs REST services
EOF
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
echo "[${SCRIPT_NAME}] starting plugin service ..."
node ${FVT_WORKSPACE}/${FVT_UI_SERVER_DIR}/src/index.js \
  --service "${EXPLORER_PLUGIN_NAME}" \
  --path "${EXPLORER_PLUGIN_BASEURI}" \
  --dir "${FVT_WORKSPACE}/${FVT_PLUGIN_DIR}/bin/app" \
  --port "${FVT_EXPLORER_UI_PORT}" \
  --key  "${FVT_WORKSPACE}/${FVT_KEYSTORE_DIR}/localhost.private.pem" \
  --cert "${FVT_WORKSPACE}/${FVT_KEYSTORE_DIR}/localhost.cert.pem" \
  --csp "localhost:*" \
  -v \
  > "${FVT_WORKSPACE}/${FVT_LOGS_DIR}/plugin.log"&
echo "[${SCRIPT_NAME}] starting jobs api ..."
# -Xquickstart \
java -Xms16m -Xmx512m \
  -Dibm.serversocket.recover=true \
  -Dfile.encoding=UTF-8 \
  -Djava.io.tmpdir=/tmp \
  -Dserver.port=${FVT_API_PORT} \
  -Dserver.ssl.keyAlias=localhost \
  -Dserver.ssl.keyStore="${FVT_WORKSPACE}/${FVT_KEYSTORE_DIR}/localhost.keystore.p12" \
  -Dserver.ssl.keyStorePassword=password \
  -Dserver.ssl.keyStoreType=PKCS12 \
  -Dserver.compression.enabled=true \
  -Dconnection.httpsPort=${FVT_GATEWAY_PORT} \
  -Dconnection.ipAddress=${FVT_GATEWAY_HOST} \
  -Dspring.main.banner-mode=off \
  -jar "$(find "${FVT_WORKSPACE}/${FVT_JOBS_API_DIR}" -name '*-boot.jar')" \
  > "${FVT_WORKSPACE}/${FVT_LOGS_DIR}/jobs-api.log" &
echo "[${SCRIPT_NAME}] starting APIML ..."
cd "${ROOT_DIR}"
./${FVT_UTILITIES_SCRIPTS_DIR}/start-apiml.sh \
  "${FVT_WORKSPACE}/${FVT_APIML_DIR}" \
  "${FVT_WORKSPACE}/${FVT_KEYSTORE_DIR}" \
  "${FVT_WORKSPACE}/${FVT_CONFIG_DIR}" \
  "${FVT_WORKSPACE}/${FVT_LOGS_DIR}"
echo

################################################################################
echo "[${SCRIPT_NAME}] done."
exit 0
