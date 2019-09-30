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

#********************************************************************
# Expected globals:
# STATIC_DEF_CONFIG_DIR

echo "<jes-explorer-configure.sh>" >> $LOG_FILE

# Add static definition for jes explorer ui
cat <<EOF >$STATIC_DEF_CONFIG_DIR/jobs-ui.yml
#
services:
  - serviceId: explorer-jes
    title: IBM z/OS Jobs UI
    description: IBM z/OS Jobs UI service
    catalogUiTileId:
    instanceBaseUrls:
      - https://$ZOWE_EXPLORER_HOST:$ZOWE_EXPLORER_JES_UI_PORT/
    homePageRelativeUrl:
    routedServices:
      - gatewayUrl: ui/v1
        serviceRelativeUrl: ui/v1/explorer-jes
EOF

iconv -f IBM-1047 -t IBM-850 ${STATIC_DEF_CONFIG_DIR}/jobs-ui.yml > $STATIC_DEF_CONFIG_DIR/jobs-ui.yml	
rm ${STATIC_DEF_CONFIG_DIR}/jobs-ui.yml
chmod 770 $STATIC_DEF_CONFIG_DIR/jobs-ui.yml