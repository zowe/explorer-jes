#!/bin/sh

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
# Variables required on shell:
# - NODE_HOME
# - ROOT_DIR
# - ZOWE_EXPLORER_HOST
# - GATEWAY_PORT
# - JES_EXPLORER_UI_PORT
# - KEYSTORE_KEY
# - KEYSTORE_CERTIFICATE
# - KEYSTORE_PASSWORD

NODE_BIN=${NODE_HOME}/bin/node

cd "$ROOT_DIR/components/explorer-jes/bin"
EXPLORER_PLUGIN_BASEURI=$($NODE_BIN -e "process.stdout.write(require('./app/package.json').config.baseuri)")
EXPLORER_PLUGIN_NAME=$($NODE_BIN -e "process.stdout.write(require('./app/package.json').config.pluginName)")

# get current ui server directory
SERVER_DIR="${ROOT_DIR}/components/explorer-jes/bin/server/"

if [ -z "$ZOWE_PREFIX" ]
then
  ZOWE_PREFIX="ZWE"
fi
if [ -z "$ZOWE_INSTANCE" ]
then
    ZOWE_INSTANCE="1"
fi
JOB_NAME="${ZOWE_PREFIX}UJ"

# start service
$NODE_BIN --title ${JOB_NAME} \
	$SERVER_DIR/src/index.js \
  --service ${EXPLORER_PLUGIN_NAME} \
	--path ${EXPLORER_PLUGIN_BASEURI} \
	--port ${JES_EXPLORER_UI_PORT} \
	--key  ${KEYSTORE_KEY} \
	--cert ${KEYSTORE_CERTIFICATE} \
	--csp "${ZOWE_EXPLORER_HOST}:*" \
	-v &
