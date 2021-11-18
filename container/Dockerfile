#######################################################################
# This program and the accompanying materials are made available
# under the terms of the Eclipse Public License v2.0 which
# accompanies this distribution, and is available at
# https://www.eclipse.org/legal/epl-v20.html
#
# SPDX-License-Identifier: EPL-2.0
#
# Copyright Contributors to the Zowe Project.
#######################################################################

# base image tag
ARG ZOWE_BASE_IMAGE=latest-ubuntu

FROM zowe-docker-release.jfrog.io/ompzowe/base-node:${ZOWE_BASE_IMAGE} AS builder

##################################
# labels
LABEL name="JES Explorer" \
      maintainer="jack-tiefeng.jia@ibm.com" \
      vendor="Zowe" \
      version="0.0.0" \
      release="0" \
      summary="IBM z/OS Jobs UI service" \
      description="This Zowe UI component can display jobs running on z/OS"

##################################
# switch context
USER zowe
WORKDIR /home/zowe

##################################
# copy files
COPY --chown=zowe:zowe component .

##################################
# build component
# pretty same as .pax/prepare-workspace.sh. any way we can merge?
RUN npm ci --no-audit --ignore-scripts \
    && npm run prod \
    && mkdir -p final/web \
    && cp README.md final \
    && cp package.json final/web \
    && cp package-lock.json final/web \
    && cp -r dist/. final/web \
    && mv final/web/zlux-hooks/config final/config \
    && cp manifest.yaml final \
    && cp pluginDefinition.prod.json final/pluginDefinition.json

##################################
# second stage
FROM zowe-docker-release.jfrog.io/ompzowe/base-node:${ZOWE_BASE_IMAGE}

##################################
# switch context
USER zowe
WORKDIR /component

##################################
# copy files
COPY --from=builder --chown=zowe:zowe /home/zowe/final ./
COPY --chown=zowe:zowe component/LICENSE /licenses