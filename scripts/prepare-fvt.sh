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
FVT_WORKSPACE=./.fvt
PLUGIN_INSTALL_FOLDER=jes_explorer

# prepare pax workspace
echo "[${SCRIPT_NAME}] cleaning FVT workspace ..."
if [ -d "${FVT_WORKSPACE}" ]; then
  rm -fr "${FVT_WORKSPACE}"
fi
mkdir -p "${FVT_WORKSPACE}/${PLUGIN_INSTALL_FOLDER}"
echo

# prepare UI package
echo "[${SCRIPT_NAME}] prepare plugin package ..."
./scripts/prepare-pax-workspace.sh
echo

# prepare UI package
echo "[${SCRIPT_NAME}] copying plugin to target test folder ..."
cp -R pax-workspace/content/. "${FVT_WORKSPACE}/${PLUGIN_INSTALL_FOLDER}/"
cp -R pax-workspace/ascii/. "${FVT_WORKSPACE}/${PLUGIN_INSTALL_FOLDER}/"
