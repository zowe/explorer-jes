#!/bin/sh -e
set -x

################################################################################
# This program and the accompanying materials are made available under the terms of the
# Eclipse Public License v2.0 which accompanies this distribution, and is available at
# https://www.eclipse.org/legal/epl-v20.html
#
# SPDX-License-Identifier: EPL-2.0
#
# Copyright IBM Corporation 2018
################################################################################

FUNC=[CreatePax][pre-packaging]
PWD=$(pwd)

# extract ASCII files
echo "$FUNC extracting ASCII files ...."
pax -r -x tar -o to=IBM-1047 -f ascii.tar
# copy to target folder
cp -R ascii/. content/
# remove ascii files
rm ascii.tar
rm -fr ascii

# display extracted files
echo "$FUNC content of $PWD...."
find . -print
