/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2020
 */

/* eslint-disable no-await-in-loop */
const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');

const {
    testTextInputFieldCanBeModified,
} = require('explorer-fvt-utilities');

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
    const jobsInstances = await driver.findElements(By.className('job-instance'));
    await reloadAndOpenFilterPanel(driver, jobsInstances.length > 0);
    await testTextInputFieldCanBeModified(driver, 'filter-owner-field', ownerFilter);
    await testTextInputFieldCanBeModified(driver, 'filter-prefix-field', prefixFilter);
    if (statusFilter) {
        await setStatusFilter(driver, statusFilter);
    }

    await findAndClickApplyButton(driver);
    const jobs = await waitForAndExtractJobs(driver);
    if (jobs.length === 1) {
        const text = await jobs[0].getText();
        if (text === 'No jobs found') {
            console.log('No jobs found');
            return false; // Couldn't find any jobs
        }
    }

    let foundFiles = true;
    // TODO:: Currently slicing to just one element of array to avoid not being able to click a job that isn't in the viewport
    for (const job of jobs.slice(0, 1)) {
        await job.click();
        await driver.wait(until.elementLocated(By.className('job-file')), 20000);
        const jobFiles = await driver.findElements(By.className('job-file'));
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
    if (!await testJobFilesLoad(driver, ownerFilter, prefixFilter, statusFilter)) {
        // Unable to get job files to load
        console.log('Unable to get job files to load');
        return false;
    }
    const fileLinks = await driver.findElements(By.css('.job-instance > ul > div > li > div > .content-link'));

    // Find the jobFileName we're looking for from the list of job files
    for (const fileLink of fileLinks) {
        const text = await fileLink.getText();
        console.log(`file link text: ${text}`);
        if (text === jobFileName) {
            await fileLink.click();
            break;
        }
    }
    // Check the job name/prefix is in the content
    for (let i = 0; i < 15; i++) {
        const textviewContent = await driver.findElements(By.className('textviewContent'));
        const text = await textviewContent[0].getText(textviewContent);
        if (!text.includes(prefixFilter)) {
            await driver.sleep(1000);
            console.log('text didnt include prefixFilter, sleeping');
        } else {
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
    testJobInstancesShowsStatus,
    testColourOfStatus,
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
