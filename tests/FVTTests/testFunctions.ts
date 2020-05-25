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
import { By, until, WebDriver, WebElement } from 'selenium-webdriver';
import { expect } from 'chai';

import {
    testTextInputFieldCanBeModified,
} from 'explorer-fvt-utilities';

import {
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
    textColorClasses,
    EditorElementTextLine,
} from './utilities';

/**
 *
 * @param {WebDriver} driver selenium-webdriver
 * @param {string} id html id
 * @param {string} expectedValue expected text field value
 */
export async function testTextInputFieldValue(driver, id, expectedValue) {
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
export async function testJobInstancesShowsStatus(driver, status) {
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
export async function testColourOfStatus(driver, statusText, expectedColour) {
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
export async function testPrefixFilterFetching(driver, prefix, noJobsFound) {
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
export async function testOwnerFilterFetching(driver, owner, potentialJobs) {
    await testTextInputFieldCanBeModified(driver, 'filter-owner-field', owner);
    await findAndClickApplyButton(driver);
    const jobs = await waitForAndExtractJobs(driver);

    if (potentialJobs.length === 0) {
        const jobText = await jobs[0].getText();
        return jobText === 'No jobs found';
    }
    return checkJobsOwner(jobs, potentialJobs);
}


export async function testStatusFilterFetching(driver, status, potentialStatuses) {
    await testTextInputFieldCanBeModified(driver, 'filter-owner-field', '*');
    await setStatusFilter(driver, `status-${status}`);
    await findAndClickApplyButton(driver);

    const jobs = await waitForAndExtractJobs(driver);

    return checkJobsStatus(jobs, potentialStatuses);
}

export async function testJobFilesLoad(driver :WebDriver, ownerFilter :string, prefixFilter :string, statusFilter :string) {
    const jobsInstances = await driver.findElements(By.className('job-instance'));
    await reloadAndOpenFilterPanel(driver, jobsInstances.length > 0);
    await testTextInputFieldCanBeModified(driver, 'filter-owner-field', ownerFilter);
    await testTextInputFieldCanBeModified(driver, 'filter-prefix-field', prefixFilter);
    if (statusFilter) {
        await setStatusFilter(driver, statusFilter);
    }

    await findAndClickApplyButton(driver);
    const jobs :WebElement[] = await waitForAndExtractJobs(driver);
    if (jobs.length === 1) {
        const text = await jobs[0].getText();
        if (text === 'No jobs found') {
            console.log('No jobs found');
            return false; // Couldn't find any jobs
        }
    }
    console.log('Total jobs found: ' + jobs.length);

    let foundFiles :boolean = true;
    let filesCount :number = 0;
    await Promise.all(jobs.map(async (job) => {
        await job.click();
        await driver.sleep(1000); //Sleep to allow for loading
        await driver.wait(until.elementLocated(By.id('refresh-icon')), 20000);
        const jobFiles :WebElement[] = await driver.findElements(By.className('job-file'));
        // If we don't find new files
        if (filesCount === (filesCount + jobFiles.length)) {
            foundFiles = false;
        } else {
            filesCount += jobFiles.length;
        }
    }));
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
export async function getJobAndOpenFile(driver, ownerFilter, prefixFilter, statusFilter, jobFileName) {
    if (!await testJobFilesLoad(driver, ownerFilter, prefixFilter, statusFilter)) {
        // Unable to get job files to load
        console.log('Unable to get job files to load');
        return false;
    }
    const jobLinks = await driver.findElements(By.css('.job-instance .content-link'));
    const jobNames :string[] = await Promise.all(jobLinks.map(j => { return j.getText(); }));

    let filterLinks = []
    // Find the jobFileName we're looking for from the list of job files
    await Promise.all(jobNames.map(async (jobName, idx) => {
            if(jobName===jobFileName) {
                console.log('job clicked', idx,  jobFileName );
                filterLinks.push(jobLinks[idx]);
                await jobLinks[idx].click();
                return true;
            }
        }));

    // Check the job name/prefix is in the content
    await Promise.all(filterLinks.map(async () => {
        const textviewContent = await driver.findElements(By.className('textviewContent'));
        const text = await textviewContent[0].getText(textviewContent);
        return text.includes(prefixFilter);
    }));

    return true;
}

export const testHighlightColorByClass = (colorClass :string, elements :EditorElementTextLine[]) => {
    const expectedColorValue = textHighlightColors[colorClass];
    let className = colorClass || '';

    const elementsMatchingCurrentClass = elements.filter(element => { return element.css === className });
    const elementColors :string[] = elementsMatchingCurrentClass.map(element => { return element.color });
    const elementsNotMatchingExpected :string[] = elementColors.filter(elementcolor => { return elementcolor !== expectedColorValue; });
    
    return elementsNotMatchingExpected.length === 0;
};

export const testAllHighlightColor = elems => {
    let testHighlights = true;
    textColorClasses.forEach(colorClass => {
        testHighlights = testHighlights && testHighlightColorByClass(colorClass, elems);
    });

    return testHighlights;
};

export const testFilterDisplayStringValues = async (driver, expectedFilters) => {
    const actualFilters = await waitForAndExtractFilters(driver);
    return compareFilters(actualFilters, expectedFilters);
};

export const testFilterFormInputValues = async (driver, expectedFilters) => {
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

export const testJobOwnerFilter = testJobUrlFilters(checkJobsOwner);
export const testJobPrefixFilter = testJobUrlFilters(checkJobsPrefix);
export const testJobStatusFilter = testJobUrlFilters(checkJobsStatus);
export const testJobIdFilter = testJobUrlFilters(checkJobsId);
