#!/bin/bash -e

################################################################################
# This program and the accompanying materials are made available under the terms of the
# Eclipse Public License v2.0 which accompanies this distribution, and is available at
# https://www.eclipse.org/legal/epl-v20.html
#
# SPDX-License-Identifier: EPL-2.0
#
# Copyright IBM Corporation 2018, 2020
################################################################################

################################################################################
# Build script
# 
# - build client
# - import ui server dependency
################################################################################

# contants
SCRIPT_NAME=$(basename "$0")
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR" && cd .. && pwd)
PAX_WORKSPACE_DIR=.pax

cd "$ROOT_DIR"

# prepare pax workspace
echo "[${SCRIPT_NAME}] cleaning PAX workspace ..."
rm -fr "${PAX_WORKSPACE_DIR}/content"
mkdir -p "${PAX_WORKSPACE_DIR}/content"

# build client
if [ ! -d "dist" ] || [ ! -z "$(ls -1 dist/app.min.*.js)" ]; then
  echo "[${SCRIPT_NAME}] building client ..."
  npm run prod
fi

# copy explorer-jes to target folder
echo "[${SCRIPT_NAME}] copying explorer JES backend ..."
mkdir -p "${PAX_WORKSPACE_DIR}/content/web"
cp README.md "${PAX_WORKSPACE_DIR}/content/web"
cp package.json "${PAX_WORKSPACE_DIR}/content/web"
cp package-lock.json "${PAX_WORKSPACE_DIR}/content/web"
cp -r dist/. "${PAX_WORKSPACE_DIR}/content/web"
cp manifest.yaml "${PAX_WORKSPACE_DIR}/content"
cp apiml-static-registration.yaml.template "${PAX_WORKSPACE_DIR}/content"
cp pluginDefinition.prod.json "${PAX_WORKSPACE_DIR}/content/pluginDefinition.json"

# update build information
# BRANCH_NAME and BUILD_NUMBER is Jenkins environment variable
commit_hash=$(git rev-parse --verify HEAD)
current_timestamp=$(date +%s%3N)
sed -e "s|{{build\.branch}}|${BRANCH_NAME}|g" \
    -e "s|{{build\.number}}|${BUILD_NUMBER}|g" \
    -e "s|{{build\.commitHash}}|${commit_hash}|g" \
    -e "s|{{build\.timestamp}}|${current_timestamp}|g" \
    "${PAX_WORKSPACE_DIR}/content/manifest.yaml" > "${PAX_WORKSPACE_DIR}/content/manifest.yaml.tmp"
mv "${PAX_WORKSPACE_DIR}/content/manifest.yaml.tmp" "${PAX_WORKSPACE_DIR}/content/manifest.yaml"
echo "[${SCRIPT_NAME}] manifest:"
cat "${PAX_WORKSPACE_DIR}/content/manifest.yaml"

# copy start scripts to target folder
echo "[${SCRIPT_NAME}] copying startup scripts ..."
mkdir -p "${PAX_WORKSPACE_DIR}/content/bin"
cp -r bin/start.sh "${PAX_WORKSPACE_DIR}/content/bin"
cp -r bin/validate.sh "${PAX_WORKSPACE_DIR}/content/bin"

# move content to another folder
rm -fr "${PAX_WORKSPACE_DIR}/ascii"
mkdir -p "${PAX_WORKSPACE_DIR}/ascii"
rsync -rv \
  --include '*.json' --include '*.html' --include '*.jcl' --include '*.template' \
  --exclude '*.zip' --exclude '*.tgz' --exclude '*.tar.gz' --exclude '*.pax' --exclude '*.png' \
  --prune-empty-dirs --remove-source-files \
  "${PAX_WORKSPACE_DIR}/content/" \
  "${PAX_WORKSPACE_DIR}/ascii"

echo "[${SCRIPT_NAME}] ${PAX_WORKSPACE_DIR} folder is prepared."
exit 0
