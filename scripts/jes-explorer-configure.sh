#!/bin/sh

################################################################################
# This program and the accompanying materials are made available under the terms of the
# Eclipse Public License v2.0 which accompanies this distribution, and is available at
# https://www.eclipse.org/legal/epl-v20.html
#
# SPDX-License-Identifier: EPL-2.0
#
# Copyright IBM Corporation 2019
################################################################################

################################################################################
# Variables required on shell:
# - STATIC_DEF_CONFIG_DIR
# - ROOT_DIR
# - NODE_HOME

# Remove any old config
rm ${STATIC_DEF_CONFIG_DIR}/jobs-ui.yml

# Add static definition for jes explorer ui
cat <<EOF >$STATIC_DEF_CONFIG_DIR/jobs-ui.ebcdic.yml
#
services:
  - serviceId: explorer-jes
    title: IBM z/OS Jobs UI
    description: IBM z/OS Jobs UI service
    catalogUiTileId:
    instanceBaseUrls:
      - https://$ZOWE_EXPLORER_HOST:$JES_EXPLORER_UI_PORT/
    homePageRelativeUrl:
    routedServices:
      - gatewayUrl: ui/v1
        serviceRelativeUrl: ui/v1/explorer-jes
EOF

if [ ! -z "$NODE_HOME" ]; then
  NODE_BIN=${NODE_HOME}/bin/node
else
  echo "Error: cannot find node bin, JES Explorer UI is not configured."
  exit 1
fi

iconv -f IBM-1047 -t IBM-850 ${STATIC_DEF_CONFIG_DIR}/jobs-ui.ebcdic.yml > $STATIC_DEF_CONFIG_DIR/jobs-ui.yml	
rm ${STATIC_DEF_CONFIG_DIR}/jobs-ui.ebcdic.yml
chmod 770 $STATIC_DEF_CONFIG_DIR/jobs-ui.yml

cd "$ROOT_DIR/components/jes-explorer/bin"

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

# Add explorer plugin to zLUX 
# NOTICE: zowe-install-iframe-plugin.sh will try to automatically create install folder based on plugin name
EXPLORER_PLUGIN_FULLURL="https://${ZOWE_EXPLORER_HOST}:${GATEWAY_PORT}${EXPLORER_PLUGIN_BASEURI}"
. $ROOT_DIR/scripts/configure/zowe-install-iframe-plugin.sh \
    "$ROOT_DIR" \
    "${EXPLORER_PLUGIN_ID}" \
    "${EXPLORER_PLUGIN_NAME}" \
    $EXPLORER_PLUGIN_FULLURL \
    "${ROOT_DIR}/components/jes-explorer/bin/plugin-definition/zlux/images/explorer-JES.png" \
    ${ROOT_DIR}/components/jes-explorer/