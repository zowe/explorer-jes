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

# constants
SCRIPT_NAME=$(basename "$0")
BASEDIR=$(dirname "$0")
PAX_WORKSPACE_DIR=.pax
PACKAGE_NAME=$(node -e "console.log(require('./package.json').name)")
PACKAGE_VERSION=$(node -e "console.log(require('./package.json').version)")
PACKAGE_DESC=$(node -e "console.log(require('./package.json').description)")
APPLICAIION_URI=$(node -e "console.log(require('./package.json').config.baseuri)")
APPLICAIION_PORT=$(node -e "console.log(require('./package.json').config.port)")

cd $BASEDIR
cd ..
ROOT_DIR=$(pwd)

# prepare pax workspace
echo "[${SCRIPT_NAME}] cleaning PAX workspace ..."
rm -fr "${PAX_WORKSPACE_DIR}/content"

# build client
if [ ! -f "web/app.min.js" ]; then
  echo "[${SCRIPT_NAME}] building client ..."
  npm run prod
fi

# copy react app
cp -r web  "${PAX_WORKSPACE_DIR}/ascii/web"

# copy pluginDefinition
cp pluginDefinition.json "${PAX_WORKSPACE_DIR}/ascii"
cp package.json "${PAX_WORKSPACE_DIR}/ascii"
cp README.md "${PAX_WORKSPACE_DIR}/ascii"

echo "Contents of ascii dir"
ls -al "${PAX_WORKSPACE_DIR}/ascii/"

echo "contents of pax workspace dir"
ls -al "${PAX_WORKSPACE_DIR}"

exit 0
