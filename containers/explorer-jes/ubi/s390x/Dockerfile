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

FROM zowe-docker-release.jfrog.io/ompzowe/base-node:latest-ubi AS builder

##################################
# labels
LABEL name="JES Explorer" \
      maintainer="jack-tiefeng.jia@ibm.com" \
      vendor="Zowe" \
      version="0.0.1" \
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
RUN npm ci --no-audit \
    && npm run prod \
    && mkdir -p final/web \
    && mkdir -p final/bin \
    && cp README.md final/web \
    && cp package.json final/web \
    && cp package-lock.json final/web \
    && cp -r dist/. final/web \
    && mv final/web/zlux-hooks/config final/config \
    && cp manifest.yaml final \
    && cp apiml-static-registration.yaml.template final \
    && cp pluginDefinition.prod.json final/pluginDefinition.json \
    && cp bin/start.sh final/bin \
    && chmod +x final/bin/* \
    && mkdir -p final/explorer-ui-server \
    && cd explorer-ui-server \
    && npm ci --no-audit \
    && npm run build \
    && cd dist \
    && npm install --production \
    && cd .. \
    && cp -r dist/. ../final/explorer-ui-server/ \
    && cp manifest.yaml ../final/explorer-ui-server/

##################################
# second stage
FROM zowe-docker-release.jfrog.io/ompzowe/base-node:latest-ubuntu

ENV ZOWE_COMPONENT_ID=explorer-jes

##################################
# switch context
USER zowe
WORKDIR /component

##################################
# copy files
COPY --from=builder --chown=zowe:zowe /home/zowe/final ./
COPY --chown=zowe:zowe component/LICENSE /licenses

##################################
# start command
EXPOSE 8080
ENTRYPOINT [ "bin/start.sh" ]
