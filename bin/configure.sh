#!/bin/sh

################################################################################
# This program and the accompanying materials are made available under the terms of the
# Eclipse Public License v2.0 which accompanies this distribution, and is available at
# https://www.eclipse.org/legal/epl-v20.html
#
# SPDX-License-Identifier: EPL-2.0
#
# Copyright IBM Corporation 2018, 2021
################################################################################

################################################################################
# Variables required on shell:
# - ROOT_DIR
# - INSTANCE_DIR

EXPLORER_APP_ROOT_DIR="${ROOT_DIR}/components/explorer-jes
${INSTANCE_DIR}/bin/install-app.sh "${EXPLORER_APP_ROOT_DIR}"