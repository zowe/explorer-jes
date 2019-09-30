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
# - ZOWE_ROOT_DIR
# - ZOWE_EXPLORER_HOST
# - ZOWE_APIM_GATEWAY_PORT

# find node bin
if [ ! -z "$NODE_HOME" ]; then
  NODE_BIN=${NODE_HOME}/bin/node
else
  echo "Error: cannot find node bin, JES Explorer UI is not started."
  exit 1
fi

# NOTICE: zowe-install-iframe-plugin.sh will try to automatically create install folder based on plugin name
cd "$ZOWE_ROOT_DIR/components/jes-explorer/bin"

EXPLORER_PLUGIN_BASEURI=$($NODE_BIN -e "process.stdout.write(require('./package.json').config.baseuri)")
EXPLORER_PLUGIN_ID=$($NODE_BIN -e "process.stdout.write(require('./package.json').config.pluginId)")
EXPLORER_PLUGIN_NAME=$($NODE_BIN -e "process.stdout.write(require('./package.json').config.pluginName)")

if [ -z "$EXPLORER_PLUGIN_ID" ]; then
  echo "  Error: cannot read plugin ID, install aborted."
  exit 0
fi
if [ -z "$EXPLORER_PLUGIN_NAME" ]; then
  echo "  Error: cannot read plugin name, install aborted."
  exit 0
fi
if [ -z "$EXPLORER_PLUGIN_BASEURI" ]; then
  echo "  Error: cannot read server base uri, install aborted."
  exit 0
fi

# Remove any pre existing plugin files
rm -rf

# Add explorer plugin to zLUX 
EXPLORER_PLUGIN_FULLURL="https://${ZOWE_EXPLORER_HOST}:${ZOWE_APIM_GATEWAY_PORT}${EXPLORER_PLUGIN_BASEURI}"
. $ZOWE_ROOT_DIR/scripts/configure/zowe-install-iframe-plugin.sh \
    "$ZOWE_ROOT_DIR" \
    "${EXPLORER_PLUGIN_ID}" \
    "${EXPLORER_PLUGIN_NAME}" \
    $EXPLORER_PLUGIN_FULLURL \
    "${ZOWE_ROOT_DIR}/components/explorer-jes/plugin-definition/zlux/images/explorer-${EXPLORER_PLUGIN_UPPERCASE}.png"

# get current script directory
SCRIPT_DIR=$(dirname "$0")
# get current ui server directory
SERVER_DIR=$(cd "$SCRIPT_DIR/../server"; pwd)

# start service
$NODE_BIN $SERVER_DIR/src/index.js -C config.json -v &
