#!/bin/bash

# FIXME: with quickstart parameter, the jobs API will fail to start
# -Xquickstart

# starting explorer API
java -Xms16m -Xmx512m \
    -Dibm.serversocket.recover=true \
    -Dfile.encoding=UTF-8 \
    -Djava.io.tmpdir=/tmp \
    -Dserver.port=8545 \
    -Dserver.ssl.keyAlias=localhost \
    -Dserver.ssl.keyStore=/app/certs/server.p12 \
    -Dserver.ssl.keyStorePassword=password \
    -Dserver.ssl.keyStoreType=PKCS12 \
    -Dzosmf.httpsPort=$ZOSMF_PORT \
    -Dzosmf.ipAddress=$ZOSMF_HOST \
    -jar /app/$API_BOOT_JAR &

EXPLORER_PLUGIN_BASEURI=$(node -e "process.stdout.write(require('./jes_explorer/app/package.json').config.baseuri)")
EXPLORER_PLUGIN_NAME=$(node -e "process.stdout.write(require('./jes_explorer/app/package.json').config.pluginName)")

pwd

# starting plugin UI server
node /app/jes_explorer/server/src/index.js \
    --service $EXPLORER_PLUGIN_NAME \
    --path $EXPLORER_PLUGIN_BASEURI \
    --port 8080 \
    --key "../server/configs/server.key" \
    --cert "../server/confids/server.cert" \
    --csp "*:*" \
    -v