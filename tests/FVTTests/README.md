# Explorer-JES-fvt

## Work in progress

1. Not all tests are implemented
2. Not all tests are listed
3. No Jenkins file to control build process

### Requirements

1. Install Node with NPM
2. Run `npm install`
3. Install Mozilla Firefox
4. Access to a Zowe install running on z/OS

### Run Tests:

Parameter values should be replaced with your own.  
Either create environment variables listed below
or create a .env file in the root directory during develpment      
Add environment-specific variables on new lines in the form of NAME=VALUE. For example

```
ZOWE_USERNAME=IBMUSER \
ZOWE_PASSWORD=12345678 \
ZOWE_JOB_NAME=ZOWESVR \
SERVER_HOST_NAME=zosHost.com \
SERVER_HTTPS_PORT=7554 \
npm test
```

### Run Linter:
```
npm run lint
```