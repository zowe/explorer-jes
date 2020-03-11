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
KEYSTORE_PASSWORD=password
CA_PASSWORD=local_ca_password

################################################################################
# variables
TARGET_DIR=$1

# validate
if [ -z "${TARGET_DIR}" ]; then
  echo "[${SCRIPT_NAME}][Error] parameter (target directory) is required" >&2
  exit 1
fi

################################################################################
echo "[${SCRIPT_NAME}] prepare certificates"
echo "[${SCRIPT_NAME}] - generate CA in PKCS12 format"
keytool -genkeypair -v \
  -alias localca \
  -keyalg RSA -keysize 2048 \
  -keystore "${TARGET_DIR}/localca.keystore.p12" \
  -dname "CN=Zowe Development Instances Certificate Authority, OU=API Mediation Layer, O=Zowe Sample, L=Prague, S=Prague, C=CZ" \
  -keypass "${CA_PASSWORD}" \
  -storepass "${CA_PASSWORD}" \
  -storetype PKCS12 \
  -validity 3650 \
  -ext KeyUsage=keyCertSign -ext BasicConstraints:critical=ca:true
echo "[${SCRIPT_NAME}] - export CA public key"
keytool -export -v \
  -alias localca \
  -file "${TARGET_DIR}/localca.cer" \
  -keystore "${TARGET_DIR}/localca.keystore.p12" \
  -rfc \
  -keypass "${CA_PASSWORD}" \
  -storepass "${CA_PASSWORD}" \
  -storetype PKCS12
echo "[${SCRIPT_NAME}] - generate server certificate in PKCS12 format"
keytool -genkeypair -v \
  -alias localhost \
  -keyalg RSA -keysize 2048 \
  -keystore "${TARGET_DIR}/localhost.keystore.p12" \
  -keypass "${KEYSTORE_PASSWORD}" \
  -storepass "${KEYSTORE_PASSWORD}" \
  -storetype PKCS12 \
  -dname "CN=Zowe Service, OU=API Mediation Layer, O=Zowe Sample, L=Prague, S=Prague, C=CZ" \
  -validity 3650
echo "[${SCRIPT_NAME}] - generate CSR"
keytool -certreq -v \
  -alias localhost \
  -keystore "${TARGET_DIR}/localhost.keystore.p12" \
  -storepass "${KEYSTORE_PASSWORD}" \
  -file "${TARGET_DIR}/localhost.keystore.csr" \
  -keyalg RSA -storetype PKCS12 \
  -dname "CN=Zowe Service, OU=API Mediation Layer, O=Zowe Sample, L=Prague, S=Prague, C=CZ" \
  -validity 3650
echo "[${SCRIPT_NAME}] - sign CSR"
keytool -gencert -v \
  -infile "${TARGET_DIR}/localhost.keystore.csr" \
  -outfile "${TARGET_DIR}/localhost.keystore_signed.cer" \
  -keystore "${TARGET_DIR}/localca.keystore.p12" \
  -alias localca \
  -keypass "${CA_PASSWORD}" \
  -storepass "${CA_PASSWORD}" \
  -storetype PKCS12 \
  -ext "SAN=dns:localhost,ip:127.0.0.1" \
  -ext "KeyUsage:critical=keyEncipherment,digitalSignature,nonRepudiation,dataEncipherment" \
  -ext "ExtendedKeyUsage=clientAuth,serverAuth" \
  -rfc \
  -validity 3650
echo "[${SCRIPT_NAME}] - import CA to server keystore"
keytool -importcert -v \
  -trustcacerts -noprompt \
  -file "${TARGET_DIR}/localca.cer" \
  -alias localca \
  -keystore "${TARGET_DIR}/localhost.keystore.p12" \
  -storepass "${KEYSTORE_PASSWORD}" \
  -storetype PKCS12
echo "[${SCRIPT_NAME}] - import signed CSR to server keystore"
keytool -importcert -v \
  -trustcacerts -noprompt \
  -file "${TARGET_DIR}/localhost.keystore_signed.cer" \
  -alias localhost \
  -keystore "${TARGET_DIR}/localhost.keystore.p12" \
  -storepass "${KEYSTORE_PASSWORD}" \
  -storetype PKCS12
echo "[${SCRIPT_NAME}] - import CA as truststore"
keytool -importcert -v \
  -trustcacerts -noprompt \
  -file "${TARGET_DIR}/localca.cer" \
  -alias localca \
  -keystore "${TARGET_DIR}/localhost.truststore.p12" \
  -storepass "${KEYSTORE_PASSWORD}" \
  -storetype PKCS12
echo "[${SCRIPT_NAME}] - Generates key pair for JWT token secret and exports the public key"
keytool -genkeypair -v \
  -alias jwtsecret \
  -keyalg RSA -keysize 2048 \
  -keystore "${TARGET_DIR}/localhost.keystore.p12" \
  -dname "CN=Zowe Service, OU=API Mediation Layer, O=Zowe Sample, L=Prague, S=Prague, C=CZ" \
  -keypass "${KEYSTORE_PASSWORD}" \
  -storepass "${KEYSTORE_PASSWORD}" \
  -storetype PKCS12 \
  -validity 3650
echo "[${SCRIPT_NAME}] - Export private key from localhost.keystore.p12"
openssl pkcs12 \
  -in "${TARGET_DIR}/localhost.keystore.p12" \
  -passin "pass:${KEYSTORE_PASSWORD}" \
  -nodes -nocerts \
  -out "${TARGET_DIR}/localhost.private.pem"
echo "[${SCRIPT_NAME}] - Export public key from localhost.keystore.p12"
openssl pkcs12 \
  -in "${TARGET_DIR}/localhost.keystore.p12" \
  -passin "pass:${KEYSTORE_PASSWORD}" \
  -nokeys \
  -out "${TARGET_DIR}/localhost.cert.pem"
echo "[${SCRIPT_NAME}] - certificates prepared:"
ls -l "${TARGET_DIR}"
echo
