#!/bin/sh

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
# Variables required on shell:
# - NODE_HOME
# - ROOT_DIR
# - ZOWE_EXPLORER_FRAME_ANCESTORS
# - JES_EXPLORER_UI_PORT
# - KEYSTORE_KEY
# - KEYSTORE_CERTIFICATE
# - ZOWE_PREFIX
# - ZOWE_EXPLORER_HOST
# - ZOWE_IP_ADDRESS

NODE_BIN=${NODE_HOME}/bin/node

# start.sh should be initialized from component base directory
EXPLORER_PLUGIN_BASEURI=$($NODE_BIN -e "process.stdout.write(require('./web/package.json').config.baseuri)")
EXPLORER_PLUGIN_NAME=$($NODE_BIN -e "process.stdout.write(require('./web/package.json').config.pluginName)")

# get current ui server directory
EXPLORER_APP_DIR="./web"
SERVER_DIR="./explorer-ui-server"
if [ ! -d "${SERVER_DIR}" ]; then
  SERVER_DIR="../explorer-ui-server"
fi

JOB_NAME="${ZOWE_PREFIX}UJ"

if [ -z "${ZOWE_EXPLORER_FRAME_ANCESTORS}" ]; then
  ZOWE_EXPLORER_FRAME_ANCESTORS="${ZOWE_EXPLORER_HOST:-localhost}:*,${ZOWE_IP_ADDRESS:-127.0.0.1}:*"
fi

# start service
_BPX_JOBNAME=${JOB_NAME} $NODE_BIN $SERVER_DIR/src/index.js \
  --service "${EXPLORER_PLUGIN_NAME}" \
	--path "${EXPLORER_PLUGIN_BASEURI}" \
	--dir  "${EXPLORER_APP_DIR}" \
	--port "${JES_EXPLORER_UI_PORT:-8080}" \
	--key  "${KEYSTORE_KEY}" \
	--cert "${KEYSTORE_CERTIFICATE}" \
	--csp "${ZOWE_EXPLORER_FRAME_ANCESTORS}" \
	--keyring "${KEYRING_NAME}" \
	--keyring-owner "${KEYRING_OWNER}" \
	--keyring-label "${KEY_ALIAS}" \
	-v &
