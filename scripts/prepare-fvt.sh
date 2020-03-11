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
FVT_WORKSPACE="${ROOT_DIR}/.fvt"
FVT_APIML_DIR=api-layer
FVT_DATASETS_API_DIR=jobs-api
FVT_PLUGIN_DIR=jes_explorer
FVT_KEYSTORE_DIR=keystore
FVT_CONFIG_DIR=configs
FVT_LOGS_DIR=logs

FVT_API_PORT=10491
FVT_EXPLORER_UI_PORT=10071

################################################################################
# variables
FVT_APIML_ARTIFACT=$1
FVT_JOBS_API_ARTIFACT=$2
FVT_ZOSMF_HOST=$3
FVT_ZOSMF_PORT=$4

################################################################################
cd "${ROOT_DIR}"
EXPLORER_PLUGIN_BASEURI=$(node -e "process.stdout.write(require('${ROOT_DIR}/package.json').config.baseuri)")
EXPLORER_PLUGIN_NAME=$(node -e "process.stdout.write(require('${ROOT_DIR}/package.json').config.pluginName)")
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
  FVT_JOBS_API_ARTIFACT="libs-release-local/org/zowe/explorer/jobs/*/jobs-zowe-server-package-*.zip"
  echo "[${SCRIPT_NAME}][warn] Jobs API artifact is not defined, using default value."
fi
if [ -z "$FVT_ZOSMF_HOST" ]; then
  FVT_ZOSMF_HOST=river.zowe.org
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
mkdir -p "${FVT_WORKSPACE}/${FVT_APIML_DIR}"
mkdir -p "${FVT_WORKSPACE}/${FVT_DATASETS_API_DIR}"
mkdir -p "${FVT_WORKSPACE}/${FVT_PLUGIN_DIR}"
mkdir -p "${FVT_WORKSPACE}/${FVT_KEYSTORE_DIR}"
mkdir -p "${FVT_WORKSPACE}/${FVT_CONFIG_DIR}"
mkdir -p "${FVT_WORKSPACE}/${FVT_LOGS_DIR}"
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
echo

################################################################################
# download APIML
echo "[${SCRIPT_NAME}] downloading APIML to target folder ${FVT_APIML_DIR} ..."
cd "${ROOT_DIR}"
./scripts/fvt/common/download-apiml.sh \
  "${FVT_APIML_ARTIFACT}" \
  "${FVT_WORKSPACE}/${FVT_APIML_DIR}"
echo

################################################################################
# download jobs API
echo "[${SCRIPT_NAME}] downloading jobs API to target folder ${FVT_DATASETS_API_DIR} ..."
cd "${ROOT_DIR}"
./scripts/fvt/common/download-explorer-api.sh \
  "${FVT_JOBS_API_ARTIFACT}" \
  "${FVT_WORKSPACE}/${FVT_DATASETS_API_DIR}"
echo

################################################################################
# download jobs API
echo "[${SCRIPT_NAME}] downloading jobs API to target folder ${FVT_DATASETS_API_DIR} ..."
cd "${ROOT_DIR}"
./scripts/fvt/common/download-artifact.sh \
  "${FVT_JOBS_API_ARTIFACT}" \
  "${FVT_WORKSPACE}/${FVT_DATASETS_API_DIR}" \
  "true"
cd "${FVT_WORKSPACE}/${FVT_DATASETS_API_DIR}"
JOBS_API_BOOT_JAR=$(find . -name '*-boot.jar')
if [ -z "${JOBS_API_BOOT_JAR}" ]; then
  echo "[${SCRIPT_NAME}][error] failed to find jobs API boot jar."
  exit 1
fi
echo

################################################################################
# generate certificates
echo "[${SCRIPT_NAME}] generating certificates ..."
cd "${ROOT_DIR}"
./scripts/fvt/common/generate-certificates.sh "${FVT_WORKSPACE}/${FVT_KEYSTORE_DIR}"
echo

################################################################################
# write zosmf config
echo "[${SCRIPT_NAME}] writing z/OSMF config for APIML ..."
cd "${ROOT_DIR}"
./scripts/fvt/common/prepare-zosmf-config.sh "${FVT_WORKSPACE}/${FVT_CONFIG_DIR}" "$FVT_ZOSMF_HOST" "$FVT_ZOSMF_PORT"
echo "[${SCRIPT_NAME}] writing jobs API config for APIML ..."
cat > "${FVT_WORKSPACE}/${FVT_CONFIG_DIR}/jobs-api.yml" << EOF
services:
- serviceId: jobs
  title: IBM z/OS Jobs
  description: IBM z/OS Jobs REST API service
  catalogUiTileId: jobs
  instanceBaseUrls:
  - https://localhost:${FVT_API_PORT}/
  homePageRelativeUrl:
  routedServices:
  - gatewayUrl: api/v1
    serviceRelativeUrl: api/v1/jobs
  apiInfo:
  - apiId: com.ibm.jobs
    gatewayUrl: api/v1
    version: 1.0.0
    swaggerUrl: https://localhost:${FVT_API_PORT}/v2/api-docs
    documentationUrl: https://localhost:${FVT_API_PORT}/swagger-ui.html
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
  - https://localhost:${FVT_EXPLORER_UI_PORT}/
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
echo "[${SCRIPT_NAME}] starting plugin service ..."
node ${FVT_WORKSPACE}/${FVT_PLUGIN_DIR}/server/src/index.js \
  --service "${EXPLORER_PLUGIN_NAME}" \
  --path "${EXPLORER_PLUGIN_BASEURI}" \
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
  -Dzosmf.httpsPort=${FVT_ZOSMF_PORT} \
  -Dzosmf.ipAddress="${FVT_ZOSMF_HOST}" \
  -Dspring.main.banner-mode=off \
  -jar "$(find "${FVT_WORKSPACE}/${FVT_DATASETS_API_DIR}" -name '*-boot.jar')" \
  > "${FVT_WORKSPACE}/${FVT_LOGS_DIR}/files-api.log" &
echo "[${SCRIPT_NAME}] starting APIML ..."
./scripts/fvt/common/start-apiml.sh \
  "${FVT_WORKSPACE}/${FVT_APIML_DIR}" \
  "${FVT_WORKSPACE}/${FVT_KEYSTORE_DIR}" \
  "${FVT_WORKSPACE}/${FVT_CONFIG_DIR}" \
  "${FVT_WORKSPACE}/${FVT_LOGS_DIR}"
echo

# ################################################################################
# echo -n "[${SCRIPT_NAME}] waiting for container ${CONTAINER_ID} to be started: "

# touch $PWD/$FVT_WORKSPACE/container_log.last
# # max wait for 1 minute
# for (( counter = 0; counter <= 30; counter++ )); do
#     echo -n .
#     docker logs $CONTAINER_ID > $PWD/$FVT_WORKSPACE/container_log.current 2>&1
#     if cmp --silent $PWD/$FVT_WORKSPACE/container_log.last $PWD/$FVT_WORKSPACE/container_log.current; then
#         # logs are not changing, assume it's fully loaded?
#         break
#     else
#         mv $PWD/$FVT_WORKSPACE/container_log.current $PWD/$FVT_WORKSPACE/container_log.last
#     fi
#     sleep 2
# done
# echo ' done'
# echo "[${SCRIPT_NAME}] container logs started >>>>>>>>"
# cat $PWD/$FVT_WORKSPACE/container_log.current
# echo "[${SCRIPT_NAME}] container logs end <<<<<<<<<<<<"

################################################################################
echo "[${SCRIPT_NAME}] done."
exit 0
