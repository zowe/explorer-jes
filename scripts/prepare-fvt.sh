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

# contants
SCRIPT_NAME=$(basename "$0")
BASEDIR=$(dirname "$0")
FVT_API_ARTIFACT=$1
FVT_ZOSMF_HOST=$2
FVT_ZOSMF_PORT=$3
FVT_WORKSPACE=./.fvt
PLUGIN_INSTALL_FOLDER=jes_explorer
API_INSTALL_FOLDER=explorer-jobs-api
API_STARTUP_SCRIPT=scripts/jobs-api-server-start.sh
DOCKER_IMAGE=jackjiaibm/ibm-nvm-jre-proxy
DOCKER_APP_FOLDER=/app
FVT_PROXY_PORT=7554
OLD_PWD=$(pwd)

# validate parameters
# set default values
if [ -z "$FVT_API_ARTIFACT" ]; then
  FVT_API_ARTIFACT="libs-release-local/org/zowe/explorer/jobs/jobs-zowe-server-package/*/jobs-zowe-server-package-*.zip"
  echo "[${SCRIPT_NAME}][warn] API artifact is not defined, using default value."
fi
if [ -z "$FVT_ZOSMF_HOST" ]; then
  FVT_ZOSMF_HOST=river.zowe.org
fi
if [ -z "$FVT_ZOSMF_PORT" ]; then
  FVT_ZOSMF_PORT=10443
fi

# prepare pax workspace
echo "[${SCRIPT_NAME}] cleaning FVT workspace ..."
if [ -d "${FVT_WORKSPACE}" ]; then
  rm -fr "${FVT_WORKSPACE}"
fi
mkdir -p "${FVT_WORKSPACE}/${PLUGIN_INSTALL_FOLDER}"
mkdir -p "${FVT_WORKSPACE}/${API_INSTALL_FOLDER}"
echo

# prepare UI package
echo "[${SCRIPT_NAME}] prepare plugin package ..."
./.pax/prepare-workspace.sh
echo

# prepare UI package
echo "[${SCRIPT_NAME}] copying plugin to target test folder ..."
cp -R .pax/content/. "${FVT_WORKSPACE}/${PLUGIN_INSTALL_FOLDER}/"
cp -R .pax/ascii/. "${FVT_WORKSPACE}/${PLUGIN_INSTALL_FOLDER}/"
echo

# prepare to download API
echo "[${SCRIPT_NAME}] preparing API artifact download spec ..."
echo "-e \"s#{API_ARTIFACT}#${FVT_API_ARTIFACT}#g\""
echo "-e \"s#{API_TARGET}#${FVT_WORKSPACE}/${API_INSTALL_FOLDER}#g\""
sed -e "s#{API_ARTIFACT}#${FVT_API_ARTIFACT}#g" \
    -e "s#{API_TARGET}#${FVT_WORKSPACE}/${API_INSTALL_FOLDER}/#g" \
    scripts/fvt/artifactory-download-spec-api.json.template > ${FVT_WORKSPACE}/artifactory-download-spec-api.json
cat ${FVT_WORKSPACE}/artifactory-download-spec-api.json
echo "[${SCRIPT_NAME}] downloading API to target test folder ..."
jfrog rt dl --spec=${FVT_WORKSPACE}/artifactory-download-spec-api.json
cd "${FVT_WORKSPACE}"
API_BOOT_JAR=$(find . -name '*-boot.jar')
cd "${OLD_PWD}"
if [ -z "${API_BOOT_JAR}" ]; then
  echo "[${SCRIPT_NAME}][error] failed to find API boot jar."
  exit 1
fi
echo

# convert encoding of startup script
# FIXME: we are not using the statup script
STARTUP=${FVT_WORKSPACE}/${API_INSTALL_FOLDER}/${API_STARTUP_SCRIPT}
if [ ! -f "${STARTUP}" ]; then
  echo "[${SCRIPT_NAME}][error] API startup script is missing."
  exit 1
fi
# echo "[${SCRIPT_NAME}] converting encoding of ${STARTUP} ..."
# iconv -f IBM-1047 -t ISO8859-1 "${STARTUP}" > "${STARTUP}.tmp"
# mv "${STARTUP}.tmp" "${STARTUP}"
echo

# prepare other configurations
echo "[${SCRIPT_NAME}] copying other configurations ..."
cp -R scripts/fvt/. "${FVT_WORKSPACE}/"

# generate certificates
echo "[${SCRIPT_NAME}] generating certificates ..."
cd "${FVT_WORKSPACE}/certs"
./generate.sh
cd "${OLD_PWD}"
echo

# update server start configurations
echo "[${SCRIPT_NAME}] updating application configurations ..."
sed -e "s|\"port\":.\+,|\"port\": 8546,|g" \
  -e "s|\"port\":[^,]\+|\"port\": 8546|g" \
  -e "s|\"key\":[^,]\+,|\"key\": \"/app/certs/server-key.pem\",|g" \
  -e "s|\"key\":[^,]\+|\"key\": \"/app/certs/server-key.pem\"|g" \
  -e "s|\"cert\":[^,]\+,|\"cert\": \"/app/certs/server-cert.pem\",|g" \
  -e "s|\"cert\":[^,]\+|\"cert\": \"/app/certs/server-cert.pem\"|g" \
  "${FVT_WORKSPACE}/${PLUGIN_INSTALL_FOLDER}/server/configs/config.json" > /tmp/config.json.tmp
mv /tmp/config.json.tmp "${FVT_WORKSPACE}/${PLUGIN_INSTALL_FOLDER}/server/configs/config.json"
sed -e "s|{ZOSMF_HOST}|${FVT_ZOSMF_HOST}|g" \
  -e "s|{ZOSMF_PORT}|${FVT_ZOSMF_PORT}|g" \
  -e "s|{API_BOOT_JAR}|${API_BOOT_JAR}|g" \
  "${FVT_WORKSPACE}/.env" > /tmp/.env.tmp
mv /tmp/.env.tmp "${FVT_WORKSPACE}/.env"

echo "[${SCRIPT_NAME}] test folder prepared:"
find .fvt -print
echo

echo "[${SCRIPT_NAME}] starting application with command:"
echo "[${SCRIPT_NAME}]   docker run -d -v $PWD/$FVT_WORKSPACE:/app -p $FVT_PROXY_PORT:80 jackjiaibm/ibm-nvm-jre-proxy"
CONTAINER_ID=$(docker run -d -v $PWD/$FVT_WORKSPACE:/app -p $FVT_PROXY_PORT:80 jackjiaibm/ibm-nvm-jre-proxy)
echo -n "[${SCRIPT_NAME}] waiting for container ${CONTAINER_ID} to be started: "

touch $PWD/$FVT_WORKSPACE/container_log.last
# max wait for 1 minute
for (( counter = 0; counter <= 30; counter++ )); do
    echo -n .
    docker logs $CONTAINER_ID > $PWD/$FVT_WORKSPACE/container_log.current 2>&1
    if cmp --silent $PWD/$FVT_WORKSPACE/container_log.last $PWD/$FVT_WORKSPACE/container_log.current; then
        # logs are not changing, assume it's fully loaded?
        break
    else
        mv $PWD/$FVT_WORKSPACE/container_log.current $PWD/$FVT_WORKSPACE/container_log.last
    fi
    sleep 2
done
echo ' done'
echo "[${SCRIPT_NAME}] container logs started >>>>>>>>"
cat $PWD/$FVT_WORKSPACE/container_log.current
echo "[${SCRIPT_NAME}] container logs end <<<<<<<<<<<<"
