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

# starting plugin UI server
node /app/jes_explorer/server/src/index.js -C config.json -v
