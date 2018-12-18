#!/bin/sh

################################################################################
# This program and the accompanying materials are made available under the terms of the
# Eclipse Public License v2.0 which accompanies this distribution, and is available at
# https://www.eclipse.org/legal/epl-v20.html
#
# SPDX-License-Identifier: EPL-2.0
#
# Copyright IBM Corporation 2018
################################################################################

# start explorer ui server

NODE_BIN=${NODE_HOME}/bin/node
SCRIPT_DIR=`dirname $0`

$NODE_BIN $SCRIPT_DIR/../server/src/index.js -C $SCRIPT_DIR/../server/configs/config.json -v
