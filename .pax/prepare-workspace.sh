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
# Build script
# 
# - build client
# - import ui server dependency
################################################################################

# contants
SCRIPT_NAME=$(basename "$0")
BASEDIR=$(dirname "$0")
PAX_WORKSPACE_DIR=.pax
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
mkdir -p "${PAX_WORKSPACE_DIR}/content"

# copy plugin definition files
echo "[${SCRIPT_NAME}] copying plugin definitions ..."
cp -r plugin-definition "${PAX_WORKSPACE_DIR}/content"

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
mkdir -p "${PAX_WORKSPACE_DIR}/content/server"
cp -r node_modules/explorer-ui-server/. "${PAX_WORKSPACE_DIR}/content/server"
cd "${PAX_WORKSPACE_DIR}/content/server"
npm install --only=production
cd "${ROOT_DIR}"

# copy explorer-jes to target folder
echo "[${SCRIPT_NAME}] copying explorer JES backend ..."
cp README.md "${PAX_WORKSPACE_DIR}/content/"
cp package.json "${PAX_WORKSPACE_DIR}/content/"
cp package-lock.json "${PAX_WORKSPACE_DIR}/content/"
mkdir -p "${PAX_WORKSPACE_DIR}/content/app"
cp -r dist/. "${PAX_WORKSPACE_DIR}/content/app"

# copy start script to target folder
echo "[${SCRIPT_NAME}] copying startup script ..."
mkdir -p "${PAX_WORKSPACE_DIR}/content/scripts"
cp -r scripts/jes-explorer-start.sh "${PAX_WORKSPACE_DIR}/content/scripts"
cp -r scripts/jes-explorer-configure.sh "${PAX_WORKSPACE_DIR}/content/scripts"

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
  -e "s#\"{{csp-frame-ancestors}}\"##" \
  "${PAX_WORKSPACE_DIR}/content/server/configs/config.json.template" \
  > "${PAX_WORKSPACE_DIR}/content/server/configs/config.json"

# move content to another folder
rm -fr "${PAX_WORKSPACE_DIR}/ascii"
mkdir -p "${PAX_WORKSPACE_DIR}/ascii"
rsync -rv \
  --include '*.json' --include '*.html' --include '*.jcl' --include '*.template' \
  --exclude '*.zip' --exclude '*.png' --exclude '*.tgz' --exclude '*.tar.gz' --exclude '*.pax' \
  --prune-empty-dirs --remove-source-files \
  "${PAX_WORKSPACE_DIR}/content/" \
  "${PAX_WORKSPACE_DIR}/ascii"

echo "[${SCRIPT_NAME}] ${PAX_WORKSPACE_DIR} folder is prepared."
exit 0
