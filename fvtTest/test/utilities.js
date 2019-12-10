const { Capabilities, Builder } = require('selenium-webdriver');
const { By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const fetch = require('node-fetch');
const https = require('https');


const VAR_LANG_CLASS = 'variable-language';
const COMMENT_STR_CLASS = 'cm-string';
const COMMENT_CLASS = 'comment';
const COMMENT_ATTR_CLASS = 'cm-attribute';
const NO_CLASS = 'none';

const textHighlightColors = {};
textHighlightColors[VAR_LANG_CLASS] = 'rgb(127, 0, 85)';
textHighlightColors[COMMENT_STR_CLASS] = 'rgb(0, 0, 255)';
textHighlightColors[COMMENT_CLASS] = 'rgb(53, 125, 33)';
textHighlightColors[COMMENT_ATTR_CLASS] = 'rgb(127, 0, 127)';
textHighlightColors[NO_CLASS] = 'rgb(51, 51, 51)';

const textColorClasses = Object.keys(textHighlightColors);

// specify defaults
const DEFAULT_SEARCH_FILTERS = {
    owner: '*',
    prefix: '*',
    jobId: '*',
    status: '*',
};

const compareFilters = (filter1, filter2) => {
    const filterKeys = ['owner', 'prefix', 'jobId', 'status'];

    let isMatch = true;
    filterKeys.forEach(key => {
        let key1 = '';
        let key2 = '';

        if (filter1[key]) {
            key1 = filter1[key].toUpperCase();
        }

        if (filter2[key]) {
            key2 = filter2[key].toUpperCase();
        }

        isMatch = isMatch && key1 === key2;
    });
    return isMatch;
};

const parseFilterText = filterText => {
    const regex = /Owner= ?([^ ]*) ?Prefix= ?([^ ]*) ?JobId= ?([^ ]*) ?Status= ?([^ ]*) ?/;
    const tokens = filterText.match(regex);
    let owner;
    let prefix;
    let jobId;
    let status;

    tokens && tokens.forEach((val, idx) => {
        switch (idx) {
            case 1: owner = val; break;
            case 2: prefix = val; break;
            case 3: jobId = val; break;
            case 4: status = val; break;
            default: break;
        }
    });

    return {
        owner, prefix, jobId, status,
    };
};

const parseJobText = text => {
    const regex = /(.*):([^ ]*) ?\[([^ ]*) ?(.*)\]/;
    const tokens = text.match(regex);
    console.log(`parseJobText: ${text}`);
    console.log(tokens);
    let prefix;
    let jobId;
    let status;

    tokens.forEach((val, idx) => {
        switch (idx) {
            case 1: prefix = val; break;
            case 2: jobId = val; break;
            case 3: status = val; break;
            default: break;
        }
    });

    return {
        text, prefix, jobId, status,
    };
};

const parseJob = async job => {
    const text = await job.getText();
    return parseJobText(text);
};

async function getDriver() {
    // configure Options
    const options = new firefox.Options();
    options.setPreference('dom.disable_beforeunload', true);
    // use headless mode
    options.headless();

    const capabilities = Capabilities.firefox();
    capabilities.setAcceptInsecureCerts(true);

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

async function loadPage(driver, page) {
    await driver.manage().window().setRect({ width: 1600, height: 800 });
    console.log(`Loading page: ${page}`);
    await driver.get(page);
    const pageTitle = await driver.getTitle();
    console.log(`Page title: ${pageTitle}`);
    await driver.wait(until.titleIs('JES Explorer'), 20000);
}

async function checkJobsOwner(actualJobs, expectedJobs) {
    if (expectedJobs.length >= 1) {
        let allMatchFlag = true;
        const jobTexts = await Promise.all(actualJobs.map(j => { return j.getText(); }));

        for (const text of jobTexts) {
            if (!expectedJobs.some(expectedJob => { return text.startsWith(expectedJob); })) {
                allMatchFlag = false;
                console.log(`${text} is not expected owner`);
                break;
            }
        }

        return allMatchFlag;
    }
    // If we have no potential jobs to match then we're expecting no jobs
    return actualJobs.length === 0;
}

const checkJobsAttribute = attr => {
    return async (actualJobs, expectedValues) => {
        let allMatchFlag = true;
        const jobObjs = await Promise.all(actualJobs.map(parseJob));

        for (const job of jobObjs) {
            if (!expectedValues.some(val => { return job[attr].includes(val); })) {
                allMatchFlag = false;
                console.log(`${job.text} is not expected status`);
                break;
            }
        }
        return allMatchFlag;
    };
};

const checkJobsStatus = checkJobsAttribute('status');
const checkJobsId = checkJobsAttribute('jobId');


async function checkJobsPrefix(actualJobs, expectedPrefix) {
    let allMatchFlag = true;
    if (expectedPrefix === '') return actualJobs.length === 0;

    const searchPrefix = expectedPrefix.endsWith('*') ? expectedPrefix.substr(0, expectedPrefix.length - 1) : expectedPrefix;
    const jobTexts = await Promise.all(actualJobs.map(j => { return j.getText(); }));

    for (const text of jobTexts) {
        if (!text.startsWith(searchPrefix)) {
            allMatchFlag = false;
            console.log(`${text} is not expected prefix`);
            break;
        }
    }
    return allMatchFlag;
}

function attachFilterToUrl(pageUrl, filters) {
    const filterArr = Object.keys(filters).reduce((arr, p) => {
        arr.push(`${p}=${filters[p]}`);
        return arr;
    }, []);

    const queryParamString = filterArr.join('&');
    const urlWithQueryParam = `${pageUrl}?${queryParamString}`;
    return urlWithQueryParam;
}

function loadPageWithFilterOptions(pageUrl, defaultFilters = {}, config = { checkJobsLoaded: true }) {
    return async (driver, filters) => {
        let filterObj = filters;
        filterObj = { ...defaultFilters, ...filters };

        const urlWithQueryParam = attachFilterToUrl(pageUrl, filterObj);
        console.log(`Loading page: ${urlWithQueryParam}`);

        try {
            await driver.get(urlWithQueryParam);
            await driver.navigate().refresh();

            // make sure tree and editor have loaded
            await driver.wait(until.elementLocated(By.id('embeddedEditor')), 30000);
            if (config.checkJobsLoaded) { await driver.wait(until.elementLocated(By.id('job-list')), 30000); }

            await driver.sleep(5000);
        } catch (e) {
            throw e;
        }
    };
}

/**
 *
 * @param {WebDriver} driver selenium-webdriver
 */
async function findAndClickApplyButton(driver) {
    const applyButton = await driver.findElement(By.id('filters-apply-button'));
    await driver.wait(until.elementIsVisible(applyButton), 10000);
    await applyButton.click();
    await driver.sleep(1000); // Make sure we don't just notice the old jobs
    await driver.wait(until.elementLocated(By.id('job-list')), 10000);
}

/**
 *
 * @param {WebDriver} driver selenium-webdriver
 */
async function reloadAndOpenFilterPanel(driver, hasJobs) {
    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.id('filter-view')), 10000);
    await driver.sleep(1000);
    if (hasJobs) {
        await driver.wait(until.elementLocated(By.className('job-instance')), 10000);
    }
    const element = await driver.findElement(By.id('filter-view'));
    await element.click();
}

/**
 * Get the card header text that sumarises the filters selected
 * @param {WebDriver} driver selenium-webdriver
 * @returns Object with key/value pairs of filters
 *  e.g {owner: ibmuser, prefix: STC*, jobId: *, status: *}
 */
async function waitForAndExtractFilters(driver) {
    await driver.sleep(1000);
    await driver.wait(until.elementLocated(By.className('tree-card')), 10000);
    const filterSpans = await driver.findElements(By.css('.tree-card > div > div > span'));
    const filterText = await filterSpans[0].getText();
    return parseFilterText(filterText);
}


async function getAllFilterValues(driver) {
    let element = await driver.findElement(By.id('filter-owner-field'));
    const owner = await element.getAttribute('value');

    element = await driver.findElement(By.id('filter-prefix-field'));
    const prefix = await element.getAttribute('value');

    element = await driver.findElement(By.id('filter-jobId-field'));
    const jobId = await element.getAttribute('value');

    element = await driver.findElement(By.id('filter-status-field'));
    const status = await element.getAttribute('value');

    return {
        owner, prefix, jobId, status,
    };
}

/**
 *
 * @param {WebDriver} driver selenium-webdriver
 */
async function waitForAndExtractJobs(driver) {
    await driver.sleep(1000);
    await driver.wait(until.elementLocated(By.id('refresh-icon')), 10000);
    const jobs = await driver.findElements(By.className('job-instance'));
    return jobs;
}


/**
 *
 * @param {WebDriver} driver selenium-webdriver
 */
async function waitForAndExtractParsedJobs(driver) {
    const jobs = await waitForAndExtractJobs(driver);
    const jobObjs = await Promise.all(jobs.map(parseJob));
    return jobObjs;
}

/**
 *
 * @param {WebDriver} driver selenium-webdriver
 * @param {string} statusIdSelection id of status field in status dropdown
 */
async function setStatusFilter(driver, statusIdSelection) {
    const statusSelector = await driver.findElement(By.id('filter-status-field'));
    await statusSelector.click();
    await driver.wait(until.elementLocated(By.id(statusIdSelection)));
    const activeStatus = await driver.findElement(By.id(statusIdSelection));
    await activeStatus.click();
    await driver.sleep(1000); // wait for css transition
}


async function getTextLineElements(driver) {
    await driver.wait(until.elementLocated(By.css('.textviewContent > div > span')));
    const textLineSpans = await driver.findElements(By.css('.textviewContent > div > span'));

    if (!textLineSpans) return [];

    const textLineObjs = [];
    for (let i = 0; i < textLineSpans.length; i++) {
        const ld = textLineSpans[i];
        // eslint-disable-next-line no-await-in-loop
        const elemText = await ld.getText();
        // eslint-disable-next-line no-await-in-loop
        const elemCss = await ld.getAttribute('class');
        // eslint-disable-next-line no-await-in-loop
        const elemColor = await ld.getCssValue('color');
        textLineObjs.push({
            elemText, elemCss, elemColor,
        });
    }
    return textLineObjs;
}

async function submitJob(jcl, host, port, username, password) {
    const agent = new https.Agent({
        rejectUnauthorized: false,
    });
    const b64Credentials = `Basic ${new Buffer(`${username}:${password}`).toString('base64')}`;
    await fetch(`https://${host}:${port}/api/v1/jobs/string`, {
        method: 'POST',
        headers: {
            authorization: b64Credentials,
            'Content-Type': 'application/json',
        },
        agent,
        body: JSON.stringify({ jcl }),
    }).then(
        response => {
            if (response.ok) {
                return response.json();
            }
            return response.json().then(e => { throw Error(e.message); });
        },
    ).then(
        responseJson => { console.log(responseJson); },
    );
}

/**
 * Given a path send a get request and print out the response body
 * @param {String} path Api request path after api/v1/
 * @param {String} host hostname
 * @param {String} port https port
 * @param {String} username TSO username
 * @param {String} password TSO password
 */
async function debugApiCall(path, host, port, username, password) {
    const agent = new https.Agent({
        rejectUnauthorized: false,
    });
    const b64Credentials = `Basic ${new Buffer(`${username}:${password}`).toString('base64')}`;
    await fetch(`https://${host}:${port}/api/v1/${path}`, {
        method: 'GET',
        headers: {
            authorization: b64Credentials,
            'Content-Type': 'application/json',
        },
        agent,
    }).then(
        response => {
            if (response.ok) {
                return response.json();
            }
            return response.json().then(e => { throw Error(e.message); });
        },
    ).then(
        responseJson => { console.log(responseJson); },
    );
}

module.exports = {
    getDriver,
    loadPage,
    findAndClickApplyButton,
    reloadAndOpenFilterPanel,
    waitForAndExtractJobs,
    waitForAndExtractParsedJobs,
    waitForAndExtractFilters,
    setStatusFilter,
    textColorClasses,
    textHighlightColors,
    getTextLineElements,
    loadPageWithFilterOptions,
    checkJobsOwner,
    checkJobsStatus,
    checkJobsId,
    checkJobsPrefix,
    getAllFilterValues,
    compareFilters,
    VAR_LANG_CLASS,
    COMMENT_STR_CLASS,
    COMMENT_CLASS,
    COMMENT_ATTR_CLASS,
    NO_CLASS,
    DEFAULT_SEARCH_FILTERS,
    submitJob,
    debugApiCall,
};
