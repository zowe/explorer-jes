#!/bin/sh

# constants
TEST_DOMAIN=test.zowe.org

# generate CA key
openssl genrsa -out ca-key.pem 2048
# generate CA certificate
openssl req -new -x509 -days 365 -key ca-key.pem -sha256 -nodes \
  -subj "/C=CA/ST=ON/L=Markham/O=IBM/OU=Zowe/CN=Zowe Test Certificate/emailAddress=jack-tiefeng.jia@ibm.com" \
  -out ca.pem

# generate server key
openssl genrsa -out server-key.pem 2048
# generate server csr
openssl req -subj "/CN=${TEST_DOMAIN}" -sha256 -new -key server-key.pem -out server.csr
# prepare extfile
echo subjectAltName = DNS:${TEST_DOMAIN},DNS:localhost,IP:10.1.1.2,IP:127.0.0.1 > extfile.cnf
echo extendedKeyUsage = serverAuth >> extfile.cnf
# sign certificate with CA
openssl x509 -req -days 365 -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial \
  -out server-cert.pem -extfile extfile.cnf

# export server p12
openssl pkcs12 -export -out server.p12 -inkey server-key.pem -in server-cert.pem -name localhost -passout pass:password