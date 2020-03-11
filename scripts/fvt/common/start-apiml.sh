#!/bin/bash -e

################################################################################
# This program and the accompanying materials are made available under the terms of the
# Eclipse Public License v2.0 which accompanies this distribution, and is available at
# https://www.eclipse.org/legal/epl-v20.html
#
# SPDX-License-Identifier: EPL-2.0
#
# Copyright IBM Corporation 2020
################################################################################

################################################################################
# contants
SCRIPT_NAME=$(basename "$0")
DEFAULT_FVT_DISCOVERY_PORT=7552
DEFAULT_FVT_CATALOG_PORT=7553
DEFAULT_FVT_GATEWAY_PORT=7554

################################################################################
# variables
APIML_ROOT_DIR=$1
KEYSTORE_DIR=$2
APIML_CONFIGS_DIR=$3
APIML_LOGS_DIR=$4

# allow to override with environment variables
if [ -z "${FVT_DISCOVERY_PORT}" ]; then
  FVT_DISCOVERY_PORT="${DEFAULT_FVT_DISCOVERY_PORT}"
fi
if [ -z "${FVT_CATALOG_PORT}" ]; then
  FVT_CATALOG_PORT="${DEFAULT_FVT_CATALOG_PORT}"
fi
if [ -z "${FVT_GATEWAY_PORT}" ]; then
  FVT_GATEWAY_PORT="${DEFAULT_FVT_GATEWAY_PORT}"
fi
# validate
if [ -z "${APIML_ROOT_DIR}" ]; then
  echo "[${SCRIPT_NAME}][Error] parameter #1 (apiml root directory) is required" >&2
  exit 1
fi
if [ -z "${KEYSTORE_DIR}" ]; then
  echo "[${SCRIPT_NAME}][Error] parameter #2 (keystore directory) is required" >&2
  exit 1
fi
if [ -z "${APIML_CONFIGS_DIR}" ]; then
  echo "[${SCRIPT_NAME}][Error] parameter #3 (apiml config directory) is required" >&2
  exit 1
fi
if [ -z "${APIML_LOGS_DIR}" ]; then
  echo "[${SCRIPT_NAME}][Error] parameter #4 (apiml logs directory) is required" >&2
  exit 1
fi

################################################################################
echo "[${SCRIPT_NAME}] start APIML discovery server"
# -Xquickstart \
java -Xms32m -Xmx256m \
    -Dibm.serversocket.recover=true \
    -Dfile.encoding=UTF-8 \
    -Djava.io.tmpdir=/tmp \
    -Dspring.profiles.active=https \
    -Dspring.profiles.include=debug \
    -Dserver.address=0.0.0.0 \
    -Dapiml.discovery.userid=eureka \
    -Dapiml.discovery.password=password \
    -Dapiml.discovery.allPeersUrls="https://localhost:${FVT_DISCOVERY_PORT}/eureka/" \
    -Dapiml.service.hostname=localhost \
    -Dapiml.service.port=${FVT_DISCOVERY_PORT} \
    -Dapiml.service.ipAddress=127.0.0.1 \
    -Dapiml.service.preferIpAddress=true \
    -Dapiml.discovery.staticApiDefinitionsDirectories="${APIML_CONFIGS_DIR}" \
    -Dapiml.security.ssl.verifySslCertificatesOfServices=false \
    -Dserver.ssl.enabled=true \
    -Dserver.ssl.keyStore="${KEYSTORE_DIR}/localhost.keystore.p12" \
    -Dserver.ssl.keyStoreType=PKCS12 \
    -Dserver.ssl.keyStorePassword=password \
    -Dserver.ssl.keyAlias=localhost \
    -Dserver.ssl.keyPassword=password \
    -Dserver.ssl.trustStore="${KEYSTORE_DIR}/localhost.truststore.p12" \
    -Dserver.ssl.trustStoreType=PKCS12 \
    -Dserver.ssl.trustStorePassword=password \
    -Djava.protocol.handler.pkgs=com.ibm.crypto.provider \
    -jar "${APIML_ROOT_DIR}/discovery-service.jar" \
    > "${APIML_LOGS_DIR}/discovery-service.log" &
echo

################################################################################
echo "[${SCRIPT_NAME}] start APIML gateway server"
# -Xquickstart \
java -Xms32m -Xmx256m \
    -Dibm.serversocket.recover=true \
    -Dfile.encoding=UTF-8 \
    -Djava.io.tmpdir=/tmp \
    -Dspring.profiles.include=debug \
    -Dapiml.service.hostname=localhost \
    -Dapiml.service.port=${FVT_GATEWAY_PORT} \
    -Dapiml.service.discoveryServiceUrls="https://localhost:${FVT_DISCOVERY_PORT}/eureka/" \
    -Dapiml.service.preferIpAddress=true \
    -Dapiml.service.allowEncodedSlashes=false \
    -Dapiml.cache.storage.location=${APIML_LOGS_DIR}/ \
    -Denvironment.ipAddress=127.0.0.1 \
    -Dapiml.gateway.timeoutMillis=30000 \
    -Dapiml.security.ssl.verifySslCertificatesOfServices=false \
    -Dapiml.security.auth.zosmfServiceId=zosmf \
    -Dserver.address=0.0.0.0 \
    -Dserver.ssl.enabled=true \
    -Dserver.ssl.keyStore="${KEYSTORE_DIR}/localhost.keystore.p12" \
    -Dserver.ssl.keyStoreType=PKCS12 \
    -Dserver.ssl.keyStorePassword=password \
    -Dserver.ssl.keyAlias=localhost \
    -Dserver.ssl.keyPassword=password \
    -Dserver.ssl.trustStore="${KEYSTORE_DIR}/localhost.truststore.p12" \
    -Dserver.ssl.trustStoreType=PKCS12 \
    -Dserver.ssl.trustStorePassword=password \
    -Djava.protocol.handler.pkgs=com.ibm.crypto.provider \
    -jar "${APIML_ROOT_DIR}/gateway-service.jar" \
    > "${APIML_LOGS_DIR}/gateway-service.log"  &
echo

################################################################################
# echo "[${SCRIPT_NAME}] start APIML API Catalog"
# # -Xquickstart \
# java -Xms16m -Xmx512m \
#     -Dibm.serversocket.recover=true \
#     -Dfile.encoding=UTF-8 \
#     -Djava.io.tmpdir=/tmp \
#     -Denvironment.hostname=localhost \
#     -Denvironment.port=${FVT_CATALOG_PORT} \
#     -Denvironment.discoveryLocations=https://localhost:${FVT_DISCOVERY_PORT}/eureka/ \
#     -Denvironment.ipAddress=127.0.0.1 \
#     -Denvironment.preferIpAddress=true -Denvironment.gatewayHostname=localhost \
#     -Denvironment.eurekaUserId=eureka \
#     -Denvironment.eurekaPassword=password \
#     -Dapiml.security.auth.zosmfServiceId=zosmf \
#     -Dapiml.security.ssl.verifySslCertificatesOfServices=false \
#     -Dspring.profiles.include=debug \
#     -Dserver.address=0.0.0.0 \
#     -Dserver.ssl.enabled=true \
#     -Dserver.ssl.keyStore="${KEYSTORE_DIR}/localhost.keystore.p12" \
#     -Dserver.ssl.keyStoreType=PKCS12 \
#     -Dserver.ssl.keyStorePassword=password \
#     -Dserver.ssl.keyAlias=localhost \
#     -Dserver.ssl.keyPassword=password \
#     -Dserver.ssl.trustStore="${KEYSTORE_DIR}/localhost.truststore.p12" \
#     -Dserver.ssl.trustStoreType=PKCS12 \
#     -Dserver.ssl.trustStorePassword=password \
#     -Djava.protocol.handler.pkgs=com.ibm.crypto.provider \
#     -jar "${APIML_ROOT_DIR}/api-catalog-services.jar" \
#     > "${APIML_LOGS_DIR}/api-catalog-services.log"  &
# echo
