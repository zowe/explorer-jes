# Explorer-JES-fvt

## Work in progress
Theses tests are still a work in progress and a large number are skipped due to timing issues with build infrastructure. 
Lint checking is disable for tests under the FVTTests directory.

### Requirements

1. Install Node with NPM
2. Run `npm install`
3. Install Mozilla Firefox
4. Access to a Zowe install running on z/OS

### About the tests

The FVT suite uses the mocha test framework and manipulate a browser using the selenium-web-driver. 
Currently the tests target only a firefox instance and therefore a version of firefox is required to be installed. 
A test utilities module [explorer-fvt-utilities](https://github.com/zowe/explorer-fvt-utilities) holds shared web-driver code, 
including functions such as setting up the web driver. Any test code that could be reused by the other explorer test should go into that repo.

### Run Tests

Parameter values should be replaced with your own.  
Either create environment variables listed below
or create a .env file in the root directory during develpment      
Add environment-specific variables on new lines in the form of NAME=VALUE. For example

```
ZOWE_USERNAME=IBMUSER \
ZOWE_PASSWORD=12345678 \
SERVER_HOST_NAME=zosHost.com \
SERVER_HTTPS_PORT=7554 \
TEST_BROWSER=firefox \
npm run test:fvt
```