#!/bin/bash -e

################################################################################
# This program and the accompanying materials are made available under the terms of the
# Eclipse Public License v2.0 which accompanies this distribution, and is available at
# https://www.eclipse.org/legal/epl-v20.html
#
# SPDX-License-Identifier: EPL-2.0
#
# Copyright IBM Corporation 2018
################################################################################

################################################################################
# Build script
# 
# - build client
# - import ui server dependency
################################################################################

# contants
SCRIPT_NAME=$(basename "$0")
BASEDIR=$(dirname "$0")
PAX_WORKSPACE_DIR=pax-workspace
PACKAGE_NAME=$(node -e "console.log(require('./package.json').name)")
PACKAGE_VERSION=$(node -e "console.log(require('./package.json').version)")
PACKAGE_DESC=$(node -e "console.log(require('./package.json').description)")
APPLICAIION_URI=$(node -e "console.log(require('./package.json').config.baseuri)")
APPLICAIION_PORT=$(node -e "console.log(require('./package.json').config.port)")
ZOWE_PLUGIN_ID="com.ibm.${PACKAGE_NAME}"

cd $BASEDIR
cd ..
ROOT_DIR=$(pwd)

# prepare pax workspace
echo "[${SCRIPT_NAME}] cleaning PAX workspace ..."
rm -fr "${PAX_WORKSPACE_DIR}/content"
rm -fr "${PAX_WORKSPACE_DIR}/ascii"
mkdir -p "${PAX_WORKSPACE_DIR}/content"
mkdir -p "${PAX_WORKSPACE_DIR}/ascii"

# copy plugin definition files
echo "[${SCRIPT_NAME}] copying plugin definitions ..."
cp -r plugin-definition "${PAX_WORKSPACE_DIR}/ascii"

# install peerDependencies
echo "[${SCRIPT_NAME}] install peer dependencies (explorer-ui-server) ..."
EXPLORER_UI_SERVER_VERSION=$(node -e "console.log(require('./package.json').peerDependencies['explorer-ui-server'])")
npm install "explorer-ui-server@${EXPLORER_UI_SERVER_VERSION}" --no-save

# build client
if [ ! -f "dist/app.min.js" ]; then
  echo "[${SCRIPT_NAME}] building client ..."
  npm run prod
fi

# copy explorer UI server
echo "[${SCRIPT_NAME}] copying explorer UI server ..."
mkdir -p "${PAX_WORKSPACE_DIR}/ascii/server"
cp -r node_modules/explorer-ui-server/. "${PAX_WORKSPACE_DIR}/ascii/server"
cd "${PAX_WORKSPACE_DIR}/ascii/server"
npm install --only=production
cd "${ROOT_DIR}"

# copy explorer-jes to target folder
echo "[${SCRIPT_NAME}] copying explorer JES backend ..."
cp README.md "${PAX_WORKSPACE_DIR}/ascii/"
cp package.json "${PAX_WORKSPACE_DIR}/ascii/"
cp package-lock.json "${PAX_WORKSPACE_DIR}/ascii/"
mkdir -p "${PAX_WORKSPACE_DIR}/ascii/app"
cp -r dist/. "${PAX_WORKSPACE_DIR}/ascii/app"

# pre-configure server config
echo "[${SCRIPT_NAME}] update default UI server config ..."
sed -e "s#{{service-name}}#${PACKAGE_NAME}#" \
  -e "s#{{path-uri}}#${APPLICAIION_URI}#" \
  -e "s#{{path-dir}}#../app#" \
  -e "s#{{port}}#${APPLICAIION_PORT}#" \
  -e "s#{{https-pfx}}##" \
  -e "s#{{https-passphrase}}##" \
  -e "s#{{https-key}}#server.key#" \
  -e "s#{{https-cert}}#server.cert#" \
  "${PAX_WORKSPACE_DIR}/ascii/server/configs/config.json.template" \
  > "${PAX_WORKSPACE_DIR}/ascii/server/configs/config.json"

echo "[${SCRIPT_NAME}] tar ascii folder ..."
tar -c -f "${PAX_WORKSPACE_DIR}/ascii.tar" -C "${PAX_WORKSPACE_DIR}/" ascii
# do not remove it for local debugging
# rm -fr "${PAX_WORKSPACE_DIR}/ascii"

echo "[${SCRIPT_NAME}] ${PAX_WORKSPACE_DIR} folder is prepared."
exit 0
