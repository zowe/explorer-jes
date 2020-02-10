const { Capabilities, Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

const { assert } = require('chai');

require('geckodriver');

async function getFirefoxDriver() {
    // configure Options
    const options = new firefox.Options();
    options.setPreference('dom.disable_beforeunload', true);
    // use headless mode
    options.headless();

    const capabilities = Capabilities.firefox();
    capabilities.setAcceptInsecureCerts(true);
    capabilities.setAlertBehavior('accept');

    // configure ServiceBuilder
    const service = new firefox.ServiceBuilder();

    // build driver using options and service
    let driver = await new Builder()
        .forBrowser('firefox')
        .withCapabilities(capabilities);
    driver = driver.setFirefoxOptions(options).setFirefoxService(service);
    driver = driver.build();

    return driver;
}

// we can change this after we make TEST_BROWSER available in jenkins pipeline
async function getDriver(TEST_BROWSER = 'firefox') {
    // assert.isNotEmpty(TEST_BROWSER, 'TEST_BROWSER is not defined');
    let driver;
    if (TEST_BROWSER === 'firefox') {
        driver = await getFirefoxDriver();
    } else {
        assert.isTrue(false, `Unsupported browser ${TEST_BROWSER}`);
    }
    return driver;
}

module.exports = {
    getDriver,
};
