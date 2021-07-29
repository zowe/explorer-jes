#!/bin/bash

################################################################################
# This program and the accompanying materials are made available under the terms of the
# Eclipse Public License v2.0 which accompanies this distribution, and is available at
# https://www.eclipse.org/legal/epl-v20.html
#
# SPDX-License-Identifier: EPL-2.0
#
# Copyright Contributors to the Zowe Project.
################################################################################

################################################################################
# prepare docker build context
#
# This script will be executed with 2 parameters:
# - linux-distro
# - cpu-arch

################################################################################
# This script prepares all required files we plan to put into zowe-launch-scripts
# image.
#
# Prereqs:
# - must run with Github Actions (with GITHUB_RUN_NUMBER and GITHUB_SHA)
# - must provide $GITHUB_PR_ID is it's pull request
# - jq

# exit if there are errors
set -e

###############################
# check parameters
linux_distro=$1
cpu_arch=$2
if [ -z "${linux_distro}" ]; then
  echo "Error: linux-distro parameter is missing."
  exit 1
fi
if [ -z "${cpu_arch}" ]; then
  echo "Error: cpu-arch parameter is missing."
  exit 1
fi

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
echo ">>>>> prepare basic files"
cd "${REPO_ROOT_DIR}"
package_version=$(jq -r '.version' package.json)

###############################
# copy Dockerfile
echo ">>>>> copy Dockerfile to ${linux_distro}/${cpu_arch}/Dockerfile"
cd "${BASE_DIR}"
mkdir -p "${linux_distro}/${cpu_arch}"
if [ ! -f Dockerfile ]; then
  echo "Error: Dockerfile file is missing."
  exit 2
fi
cat Dockerfile | sed -e "s#0\.0\.0#${package_version}#" > "${linux_distro}/${cpu_arch}/Dockerfile"

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
echo ">>>>> download explorer-ui-server"
cd "${BASE_DIR}/${WORK_DIR}"
latest_tag=$(curl https://api.github.com/repos/zowe/explorer-ui-server/git/refs/tags -H "Accept: application/vnd.github.v3+json" -s | jq -r '[ .[].ref | sub("refs/tags/";"") | capture("(?<tag>v(?<major>[0-9]+).(?<minor>[0-9]+).(?<patch>[0-9]+))") | { tag: .tag, major: .major | tonumber, minor: .minor | tonumber, patch: .patch | tonumber } | { tag: .tag, seq: (.major * 1000000 + .minor * 1000 + .patch) }] | sort_by(.seq) | reverse | .[0] | .tag')
checkout_branch="${EXPLORER_UI_SERVER_BRANCH:-${latest_tag:-master}}"
echo "    - branch or tag: ${checkout_branch}"
git clone --depth 1 --single-branch --branch "${checkout_branch}" https://github.com/zowe/explorer-ui-server.git
cd explorer-ui-server
ui_server_commit_hash=$(git rev-parse --verify HEAD)
cat manifest.yaml | \
  sed -e "s#{{build\.branch}}#${checkout_branch}#" \
      -e "s#{{build\.number}}#${GITHUB_RUN_NUMBER}#" \
      -e "s#{{build\.commitHash}}#${ui_server_commit_hash}#" \
      -e "s#{{build\.timestamp}}#$(date +%s)#" \
  > manifest.yaml
rm -fr .pax .vscode dco_signoffs test .eslint* .editorconfig .nycrc sonar-project.properties explorer-ui-server.ppf Jenkinsfile .git .gitignore

# echo ">>>>> prepare explorer-ui-server"
# #### use pax have encoding issue
# cd "${REPO_ROOT_DIR}"
# ARTIFACTORY_REPO="${JFROG_REPO_RELEASE}"
# ARTIFACTORY_PATH_PATTERN="*/*.pax"
# jfrog_path="${ARTIFACTORY_REPO}/org/zowe/explorer-ui-server/${ARTIFACTORY_PATH_PATTERN}"
# echo "    - artifact path pattern: ${jfrog_path}"
# artifact=$(jfrog rt s "${jfrog_path}" --sort-by created --sort-order desc --limit 1 | jq -r '.[0].path')
# if [ -z "${artifact}" ]; then
#   echo "Error: cannot find org.zowe.explorer-ui-server artifact."
#   exit 1
# fi
# echo "    - artifact found: ${artifact}"
# echo "    - download and extract"
# curl -s ${JFROG_URL}${artifact} --output explorer-ui-server.pax
# mkdir -p "${BASE_DIR}/${WORK_DIR}/explorer-ui-server"
# cd "${BASE_DIR}/${WORK_DIR}/explorer-ui-server"
# tar xf ../../../../explorer-ui-server.pax
# cd "${REPO_ROOT_DIR}"
# rm explorer-ui-server.pax

###############################
# copy to target context
echo ">>>>> copy to target build context"
cp -r "${BASE_DIR}/${WORK_DIR}" "${BASE_DIR}/${linux_distro}/${cpu_arch}/component"

###############################
# done
echo ">>>>> all done"
