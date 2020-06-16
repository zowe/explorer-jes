#!/bin/sh

################################################################################
# This program and the accompanying materials are made available under the terms of the
# Eclipse Public License v2.0 which accompanies this distribution, and is available at
# https://www.eclipse.org/legal/epl-v20.html
#
# SPDX-License-Identifier: EPL-2.0
#
# Copyright IBM Corporation 2019, 2020
################################################################################

################################################################################
# Variables required on shell:
# - STATIC_DEF_CONFIG_DIR
# - ROOT_DIR
# - NODE_HOME

NODE_BIN=${NODE_HOME}/bin/node


EXPLORER_CONFIG="$ROOT_DIR/components/explorer-jes/bin/app/package.json"
EXPLORER_PLUGIN_BASEURI=$($NODE_BIN -e "process.stdout.write(require('${EXPLORER_CONFIG}').config.baseuri)")
EXPLORER_PLUGIN_ID=$($NODE_BIN -e "process.stdout.write(require('${EXPLORER_CONFIG}').config.pluginId)")
EXPLORER_PLUGIN_NAME=$($NODE_BIN -e "process.stdout.write(require('${EXPLORER_CONFIG}').config.pluginName)")

if [[ $LAUNCH_COMPONENT_GROUPS == *"DESKTOP"* ]]
then
  # Create desktop app plugin
  # this shouldn't work
  EXPLORER_PLUGIN_FULLURL="https://waldevgizaud001.dev.rocketsoftware.com:${GATEWAY_PORT}${EXPLORER_PLUGIN_BASEURI}"
  ${ROOT_DIR}/bin/utils/zowe-install-iframe-plugin.sh \
    "${EXPLORER_PLUGIN_ID}" \
    "${EXPLORER_PLUGIN_NAME}" \
    ${EXPLORER_PLUGIN_FULLURL} \
    "${WORKSPACE_DIR}/explorer-jes" \
    "${ROOT_DIR}/components/explorer-jes/bin/app/img/explorer-JES.png"
fi

# Remove any previous static defintiion config
if [[ -f ${STATIC_DEF_CONFIG_DIR}/jobs-ui.yml ]]; then
  rm ${STATIC_DEF_CONFIG_DIR}/jobs-ui.yml 
fi

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
        serviceRelativeUrl: $EXPLORER_PLUGIN_BASEURI
EOF

iconv -f IBM-1047 -t IBM-850 ${STATIC_DEF_CONFIG_DIR}/jobs-ui.ebcdic.yml > $STATIC_DEF_CONFIG_DIR/jobs-ui.yml	
rm ${STATIC_DEF_CONFIG_DIR}/jobs-ui.ebcdic.yml
chmod 770 $STATIC_DEF_CONFIG_DIR/jobs-ui.yml