/* eslint-disable no-await-in-loop */
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
 * @param {boolean} noJobsFound if we expect no jobs to be found
 */
async function testPrefixFilterFetching(driver, prefix, noJobsFound) {
    await testTextInputFieldCanBeModified(driver, 'filter-owner-field', '*');
    await testTextInputFieldCanBeModified(driver, 'filter-prefix-field', prefix);
    await findAndClickApplyButton(driver);

    const jobs = await waitForAndExtractJobs(driver);
    if (noJobsFound && jobs.length === 1) {
        const jobText = await jobs[0].getText();
        return jobText === 'No jobs found';
    }
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

    if (potentialJobs.length === 0) {
        const jobText = await jobs[0].getText();
        return jobText === 'No jobs found';
    }
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
    console.log('test job files load');
    const jobsInstances = await driver.findElements(By.className('job-instance'));
    await reloadAndOpenFilterPanel(driver, jobsInstances.length > 0);
    console.log('reload and open filter panel');
    await testTextInputFieldCanBeModified(driver, 'filter-owner-field', ownerFilter);
    console.log(`set owner field ${ownerFilter}`);
    await testTextInputFieldCanBeModified(driver, 'filter-prefix-field', prefixFilter);
    console.log(`set prefix field ${prefixFilter}`);
    if (statusFilter) {
        await setStatusFilter(driver, statusFilter);
    }

    await findAndClickApplyButton(driver);
    console.log('find and click apply');
    const jobs = await waitForAndExtractJobs(driver);
    console.log(`extracted jobs, jobs length: ${jobs.length}`);
    if (jobs.length === 1) {
        const text = await jobs[0].getText();
        if (text === 'No jobs found') {
            console.log('No jobs found');
            return false; // Couldn't find any jobs
        }
    }
    console.log('we have some jobs');

    let foundFiles = true;
    // TODO:: Currently slicing to just one element of array to avoid not being able to click a job that isn't in the viewport
    /* eslint-disable-next-line no-restricted-syntax */
    for (const job of jobs.slice(0, 1)) {
        const jobText = await job.getText();
        console.log(`clicking job: ${jobText}`);
        await job.click();
        console.log(`clicked job ${new Date().toLocaleString()}`);

        await driver.wait(until.elementLocated(By.className('job-file')), 20000);
        console.log(`located job-files ${new Date().toLocaleString()}`);
        const jobFiles = await driver.findElements(By.className('job-file'));
        console.log(`found files: ${jobFiles.length} ${new Date().toLocaleString()}`);
        if (jobFiles.length < 1) foundFiles = false;
    }
    return foundFiles;
}

/**
 * This function currently only supports an exact prefix and JESJCL as the file
 * @param {WebDriver} driver selenium-webdriver
 * @param {string} ownerFilter filter owner
 * @param {string} prefixFilter filter prefix
 * @param {string} statusFilter filter status
 * @param {string} jobFileNameFilter filter status
 */
async function getJobAndOpenFile(driver, ownerFilter, prefixFilter, statusFilter, jobFileName) {
    console.log('get job and open file');
    if (!await testJobFilesLoad(driver, ownerFilter, prefixFilter, statusFilter)) {
        // Unable to get job files to load
        console.log('Unable to get job files to load');
        return false;
    }
    const fileLinks = await driver.findElements(By.css('.job-instance > ul > div > li > div > .content-link'));
    console.log('got file links');

    // Find the jobFileName we're looking for from the list of job files
    for (const fileLink of fileLinks) {
        const text = await fileLink.getText();
        console.log(`file link text: ${text}`);
        if (text === jobFileName) {
            await fileLink.click();
            console.log('clicked file link');
            break;
        }
    }
    // Check the job name/prefix is in the content
    for (let i = 0; i < 15; i++) {
        const textviewContent = await driver.findElements(By.className('textviewContent'));
        console.log('got textviewContent');
        const text = await textviewContent[0].getText(textviewContent);
        console.log(`text view content: ${text}`);
        if (!text.includes(prefixFilter)) {
            await driver.sleep(1000);
            console.log('text didnt include prefixFilter, sleeping');
        } else {
            console.log('text inncluded prexif filter');
            break;
        }
    }
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
