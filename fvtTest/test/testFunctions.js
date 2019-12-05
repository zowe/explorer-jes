const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');

const {
    findAndClickApplyButton,
    waitForAndExtractJobs,
    waitForAndExtractFilters,
    setStatusFilter,
    reloadAndOpenFilterPanel,
    checkJobsOwner,
    checkJobsStatus,
    checkJobsId,
    checkJobsPrefix,
    compareFilters,
    getAllFilterValues,
    textHighlightColors,
    NO_CLASS,
    textColorClasses,
} = require('./utilities');

/**
 *
 * @param {WebDriver} driver selenium-webdriver
 * @param {string} id html id
 * @param {int} count expected occurrences
 */
async function testElementAppearsXTimesById(driver, id, count) {
    try {
        const elements = await driver.findElements(By.id(id));
        expect(elements).to.be.an('array').that.has.lengthOf(count);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 *
 * @param {WebDriver} driver selenium-webdriver
 * @param {string} id html css path
 * @param {int} count expected occurrences
 */
async function testElementAppearsXTimesByCSS(driver, css, count) {
    try {
        const elements = await driver.findElements(By.css(css));
        expect(elements).to.be.an('array').that.has.lengthOf(count);
    } catch (e) {
        return false;
    }
    return true;
}

async function testWindowHeightChangeForcesComponentHeightChange(driver, component, browserOffSet) {
    let allResized = true;
    for (let i = 300; i <= 1000 && allResized; i += 100) {
        await driver.manage().window().setRect({ width: 1600, height: i });
        const contentViewer = await driver.findElement(By.id(component));
        const height = await contentViewer.getCssValue('height');
        const heightInt = parseInt(height.substr(0, height.length - 2), 10);
        if (heightInt + browserOffSet !== i) allResized = false;
    }
    return allResized;
}

/**
 *
 * @param {WebDriver} driver selenium-webdriver
 * @param {string} id html id
 * @param {string} replaceText optional replace text, defaults to "TEST"
 */
async function testTextInputFieldCanBeModified(driver, id, replaceText = 'TEST') {
    try {
        const element = await driver.findElement(By.id(id));
        await element.clear();
        await element.sendKeys(replaceText);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 *
 * @param {WebDriver} driver selenium-webdriver
 * @param {string} id html id
 * @param {string} expectedValue expected text field value
 */
async function testTextInputFieldValue(driver, id, expectedValue) {
    try {
        const element = await driver.findElement(By.id(id));
        const val = await element.getAttribute('value');
        expect(val).to.equal(expectedValue);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 *
 * @param {WebDriver} driver selenium-webdirver
 * @param {string} status status to be checked e.g ACTIVE, ABEND, etc.
 */
async function testJobInstancesShowsStatus(driver, status) {
    await driver.wait(until.elementLocated(By.className('job-instance')));
    const jobs = await driver.findElements(By.className('job-instance'));
    let statusFound = false;
    for (const job of jobs) {
        const text = await job.getText();
        if (text.includes(status)) {
            statusFound = true;
            break;
        }
    }
    return statusFound;
}

/**
 *
 * @param {WebDriver} driver selenium-webdriver
 * @param {string} statusText status to check colour of
 * @param {string} expectedColour rgb color we're expecting e.g 'rgb(128, 128, 128)'
 */
async function testColourOfStatus(driver, statusText, expectedColour) {
    // TODO:: When better classname available to get label change the way we get elements
    await driver.findElements(By.css('.job-instance > li > div > span > span > div'));
    const statuses = await driver.findElements(By.css('.job-instance > li > div > span > span > div'));
    let correctColourFlag = true;
    for (const jobStatus of statuses) {
        const text = await jobStatus.getText();
        if (text.includes(statusText)) {
            const css = await jobStatus.getCssValue('color');
            if (css !== expectedColour) {
                correctColourFlag = false;
            }
        }
    }
    return correctColourFlag;
}

/**
 *
 * @param {WebDriver} driver selenium-webdriver
 * @param {string} prefix filter prefix
 */
async function testPrefixFilterFetching(driver, prefix) {
    await testTextInputFieldCanBeModified(driver, 'filter-owner-field', '*');
    await testTextInputFieldCanBeModified(driver, 'filter-prefix-field', prefix);
    await findAndClickApplyButton(driver);

    const jobs = await waitForAndExtractJobs(driver);
    return checkJobsPrefix(jobs, prefix);
}

/**
 *
 * @param {WebDriver} driver selenium-webdriver
 * @param {string} prefix filter owner
 * @param {Array<String>} potentialJobs job prefixes that could be present in fetch
 */
async function testOwnerFilterFetching(driver, owner, potentialJobs) {
    await testTextInputFieldCanBeModified(driver, 'filter-owner-field', owner);
    await findAndClickApplyButton(driver);
    const jobs = await waitForAndExtractJobs(driver);
    return checkJobsOwner(jobs, potentialJobs);
}


async function testStatusFilterFetching(driver, status, potentialStatuses) {
    await testTextInputFieldCanBeModified(driver, 'filter-owner-field', '*');
    await setStatusFilter(driver, `status-${status}`);
    await findAndClickApplyButton(driver);

    const jobs = await waitForAndExtractJobs(driver);

    return checkJobsStatus(jobs, potentialStatuses);
}

/**
 *
 * @param {WebDriver} driver selenium-webdriver
 * @param {string} owner filter owner
 * @param {string} prefix filter prefix
 * @param {string} status filter status
 */
async function testJobFilesLoad(driver, ownerFilter, prefixFilter, statusFilter) {
    const jobsInstances = await driver.findElements(By.className('job-instance'));
    await reloadAndOpenFilterPanel(driver, jobsInstances.length > 0);
    await testTextInputFieldCanBeModified(driver, 'filter-owner-field', ownerFilter);
    await testTextInputFieldCanBeModified(driver, 'filter-prefix-field', prefixFilter);
    if (statusFilter) {
        await setStatusFilter(driver, statusFilter);
    }

    await findAndClickApplyButton(driver);
    const jobs = await waitForAndExtractJobs(driver);
    console.log(`found jobs: ${jobs}`);
    console.log(`jobs length: ${jobs.length}`);
    if (jobs.length === 0) return false; // Couldnt find any jobs

    let foundFiles = true;
    for (const job of jobs) {
        await job.click();
        await driver.wait(until.elementLocated(By.className('job-file')));
        const jobFiles = await driver.findElements(By.className('job-file'));
        console.log(`jobFiles: ${jobFiles}`);
        if (jobFiles.length < 1) foundFiles = false;
    }
    return foundFiles;
}

/**
 *
 * @param {WebDriver} driver selenium-webdriver
 * @param {string} ownerFilter filter owner
 * @param {string} prefixFilter filter prefix
 * @param {string} statusFilter filter status
 * @param {string} jobFileNameFilter filter status
 */
async function getJobAndOpenFile(driver, ownerFilter, prefixFilter, statusFilter, jobFileName) {
    await testJobFilesLoad(driver, ownerFilter, prefixFilter, statusFilter);
    const fileLinks = await driver.findElements(By.css('.job-instance > ul > div > li > div > .content-link > span'));

    // Find the jobFileName we're looking for from the list of job files
    for (const fileLink of fileLinks) {
        const text = await fileLink.getText();
        if (text === jobFileName) {
            await fileLink.click();
            break;
        }
    }
    // TODO:: Can we check that content has rendered first?
    return true;
}

const testHighlightColorByClass = (colorClass, elems) => {
    const colorVal = textHighlightColors[colorClass];

    let classStr = colorClass;
    if (colorClass === NO_CLASS) {
        classStr = '';
    }

    const colorArray = [
        ...new Set(
            elems
                .filter(e => {
                    return e.elemCss === classStr;
                })
                .map(e => {
                    return e.elemColor;
                }),
        )];
    let testColor = colorArray.length === 1;
    testColor = testColor && colorArray[0] === colorVal;
    return testColor;
};

const testAllHighlightColor = elems => {
    let testHighlights = true;
    textColorClasses.forEach(colorClass => {
        testHighlights = testHighlights && testHighlightColorByClass(colorClass, elems);
    });

    return testHighlights;
};

const testFilterDisplayStringValues = async (driver, expectedFilters) => {
    const actualFilters = await waitForAndExtractFilters(driver);
    return compareFilters(actualFilters, expectedFilters);
};

const testFilterFormInputValues = async (driver, expectedFilters) => {
    const element = await driver.findElement(By.id('filter-view'));
    await element.click();
    const actualFilters = await getAllFilterValues(driver);
    return compareFilters(actualFilters, expectedFilters);
};


const testJobUrlFilters = checkFunc => {
    return async (driver, expectedVals) => {
        const jobs = await waitForAndExtractJobs(driver);
        const isExpected = await checkFunc(jobs, expectedVals);
        return isExpected;
    };
};

const testJobOwnerFilter = testJobUrlFilters(checkJobsOwner);
const testJobPrefixFilter = testJobUrlFilters(checkJobsPrefix);
const testJobStatusFilter = testJobUrlFilters(checkJobsStatus);
const testJobIdFilter = testJobUrlFilters(checkJobsId);


module.exports = {
    testElementAppearsXTimesById,
    testElementAppearsXTimesByCSS,
    testWindowHeightChangeForcesComponentHeightChange,
    testJobInstancesShowsStatus,
    testColourOfStatus,
    testTextInputFieldCanBeModified,
    testTextInputFieldValue,
    testPrefixFilterFetching,
    testOwnerFilterFetching,
    testStatusFilterFetching,
    testJobFilesLoad,
    getJobAndOpenFile,
    testJobOwnerFilter,
    testJobPrefixFilter,
    testJobStatusFilter,
    testJobIdFilter,
    testFilterDisplayStringValues,
    testFilterFormInputValues,
    testHighlightColorByClass,
    testAllHighlightColor,
};
