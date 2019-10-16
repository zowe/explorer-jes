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

# Find node binary
if [ ! -z "$NODE_HOME" ]; then
  NODE_BIN=${NODE_HOME}/bin/node
else
  echo "Error: cannot find node bin, JES Explorer UI is not started."
  exit 1
fi

cd "$ROOT_DIR/components/jes-explorer/bin"
EXPLORER_PLUGIN_BASEURI=$($NODE_BIN -e "process.stdout.write(require('./app/package.json').config.baseuri)")
EXPLORER_PLUGIN_NAME=$($NODE_BIN -e "process.stdout.write(require('./app/package.json').config.pluginName)")

# get current ui server directory
SERVER_DIR="${ROOT_DIR}/components/jes-explorer/bin/server/"

# start service
$NODE_BIN $SERVER_DIR/src/index.js \
  --service ${EXPLORER_PLUGIN_NAME} \
	--path ${EXPLORER_PLUGIN_BASEURI} \
	--port ${JES_EXPLORER_UI_PORT} \
	--key  ${KEYSTORE_KEY} \
	--cert ${KEYSTORE_CERTIFICATE} \
	--csp "${ZOWE_EXPLORER_HOST}:*" \
	-v &
