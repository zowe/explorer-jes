#!/bin/bash

################################################################################
# This program and the accompanying materials are made available under the terms of the
# Eclipse Public License v2.0 which accompanies this distribution, and is available at
# https://www.eclipse.org/legal/epl-v20.html
#
# SPDX-License-Identifier: EPL-2.0
#
# Copyright IBM Corporation 2019, 2021
################################################################################

################################################################################
# This script prepares all required files we plan to put into zowe-launch-scripts
# image.
#
# Prereqs:
# - must run with Github Actions (with GITHUB_RUN_NUMBER and GITHUB_SHA)
# - must provide $GITHUB_PR_ID is it's pull request

# exit if there are errors
set -e

################################################################################
# CONSTANTS
# this should be containers/zowe-launch-scripts
BASE_DIR=$(cd $(dirname $0);pwd)
REPO_ROOT_DIR=$(cd $(dirname $0)/../../;pwd)
WORK_DIR=tmp
JFROG_REPO_SNAPSHOT=libs-snapshot-local
JFROG_REPO_RELEASE=libs-release-local
JFROG_URL=https://zowe.jfrog.io/zowe/

###############################
echo ">>>>> clean up folder"
rm -fr "${BASE_DIR}/${WORK_DIR}"
mkdir -p "${BASE_DIR}/${WORK_DIR}"

###############################
echo ">>>>> prepare basic files"
cd "${REPO_ROOT_DIR}"
cp README.md "${BASE_DIR}/${WORK_DIR}"
cp LICENSE "${BASE_DIR}/${WORK_DIR}"
cp CHANGELOG.md "${BASE_DIR}/${WORK_DIR}"
cp package.json "${BASE_DIR}/${WORK_DIR}"
cp package-lock.json "${BASE_DIR}/${WORK_DIR}"
cp pluginDefinition.json "${BASE_DIR}/${WORK_DIR}"
cp pluginDefinition.prod.json "${BASE_DIR}/${WORK_DIR}"
cp webpack.config.js "${BASE_DIR}/${WORK_DIR}"
cp jsconfig.json "${BASE_DIR}/${WORK_DIR}"
cp .npmrc "${BASE_DIR}/${WORK_DIR}"
cp .npmignore "${BASE_DIR}/${WORK_DIR}"
cp apiml-static-registration.yaml.template "${BASE_DIR}/${WORK_DIR}"
cp -r plugin-definition "${BASE_DIR}/${WORK_DIR}"
cp -r WebContent "${BASE_DIR}/${WORK_DIR}"
mkdir ${BASE_DIR}/${WORK_DIR}/bin
cp bin/start.sh ${BASE_DIR}/${WORK_DIR}/bin

###############################
echo ">>>>> prepare manifest.json"
cd "${REPO_ROOT_DIR}"
if [ -n "${GITHUB_PR_ID}" ]; then
  GITHUB_BRANCH=PR-${GITHUB_PR_ID}
else
  GITHUB_BRANCH=${GITHUB_REF#refs/heads/}
fi
echo "    - branch: ${GITHUB_BRANCH}"
echo "    - build number: ${GITHUB_RUN_NUMBER}"
echo "    - commit hash: ${GITHUB_SHA}"
# assume to run in Github Actions
cat manifest.yaml | \
  sed -e "s#{{build\.branch}}#${GITHUB_BRANCH}#" \
      -e "s#{{build\.number}}#${GITHUB_RUN_NUMBER}#" \
      -e "s#{{build\.commitHash}}#${GITHUB_SHA}#" \
      -e "s#{{build\.timestamp}}#$(date +%s)#" \
  > "${BASE_DIR}/${WORK_DIR}/manifest.yaml"

###############################
echo ">>>>> explorer-ui-server"
cd "${BASE_DIR}/${WORK_DIR}"
git clone --depth 1 --single-branch --branch "${EXPLORER_UI_SERVER_BRANCH:-master}" https://github.com/zowe/explorer-ui-server.git
cd explorer-ui-server
ui_server_commit_hash=$(git rev-parse --verify HEAD)
cat manifest.yaml | \
  sed -e "s#{{build\.branch}}#${EXPLORER_UI_SERVER_BRANCH:-master}#" \
      -e "s#{{build\.number}}#${GITHUB_RUN_NUMBER}#" \
      -e "s#{{build\.commitHash}}#${ui_server_commit_hash}#" \
      -e "s#{{build\.timestamp}}#$(date +%s)#" \
  > manifest.yaml
rm -fr .pax .vscode dco_signoffs test .eslint* .editorconfig .nycrc sonar-project.properties explorer-ui-server.ppf Jenkinsfile .git .gitignore

###############################
# done
echo ">>>>> all done"
