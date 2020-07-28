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

cd $BASEDIR
cd ..
ROOT_DIR=$(pwd)

# prepare pax workspace
echo "[${SCRIPT_NAME}] cleaning PAX workspace ..."
rm -fr "${PAX_WORKSPACE_DIR}/content"
mkdir -p "${PAX_WORKSPACE_DIR}/content"

# build client
if [ ! -f "dist/app.min.js" ]; then
  echo "[${SCRIPT_NAME}] building client ..."
  npm run prod
fi

# copy explorer-jes to target folder
echo "[${SCRIPT_NAME}] copying explorer JES backend ..."
mkdir -p "${PAX_WORKSPACE_DIR}/content/app"
cp README.md "${PAX_WORKSPACE_DIR}/content/app"
cp package.json "${PAX_WORKSPACE_DIR}/content/app"
cp package-lock.json "${PAX_WORKSPACE_DIR}/content/app"
cp -r dist/. "${PAX_WORKSPACE_DIR}/content/app"

# copy start script to target folder
echo "[${SCRIPT_NAME}] copying startup script ..."
mkdir -p "${PAX_WORKSPACE_DIR}/content/scripts"
cp -r scripts/explorer-jes-start.sh "${PAX_WORKSPACE_DIR}/content/scripts"
cp -r scripts/explorer-jes-configure.sh "${PAX_WORKSPACE_DIR}/content/scripts"
cp -r scripts/explorer-jes-validate.sh "${PAX_WORKSPACE_DIR}/content/scripts"

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
