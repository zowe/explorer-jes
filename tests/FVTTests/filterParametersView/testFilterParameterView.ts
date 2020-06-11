/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2020
 */

/* eslint-disable no-unused-expressions */
import { By } from 'selenium-webdriver';
import { expect } from 'chai';

const chai = require('chai');
chai.use(require('chai-things'));

import {
    testElementAppearsXTimesByCSS 
} from 'explorer-fvt-utilities';

import {
    waitForAndExtractParsedJobs,
    loadPageWithFilterOptions,
    DEFAULT_SEARCH_FILTERS,
} from '../utilities';

import {
    testJobOwnerFilter,
    testJobPrefixFilter,
    testJobStatusFilter,
    testJobIdFilter,
    testFilterDisplayStringValues,
    testFilterFormInputValues,
} from '../testFunctions';

import {getDriver, TEST_CONFIG} from "../../FVTTests/testConfig";

const {
    FILTER_BASE_URL, loadUrlWithSearchFilters, ZOSMF_JOB_NAME
} = TEST_CONFIG;

// Need to use unnamed function so we can specify the retries
// eslint-disable-next-line
describe('JES explorer home view with filter parameters in url query', function () {
    let driver;
    this.retries(3);

    before('Initialise', async () => {
        driver = await getDriver();
    });

    after('Close out', async () => {
        if (driver) {
            driver.quit();
        }
    });

    it('Should handle rendering the expected components when url filter params are specified (same as home)');
    describe('url queries detected and put in filter component', () => {
        describe('basic url load test', () => {
            it('Should handle setting all filters from url query', async () => {
                const filters = {
                    owner: 'IZU*', prefix: 'pre*', jobId: 'st', status: 'INPUT',
                };
                const expectedFilter = { ...DEFAULT_SEARCH_FILTERS, ...filters };

                await loadUrlWithSearchFilters(driver, filters);

                expect(await testFilterDisplayStringValues(driver, expectedFilter)).to.be.true;
                expect(await testFilterFormInputValues(driver, expectedFilter)).to.be.true;
            });

            it('Should handle a none recognised query parameter gracefully (still load page)', async () => {
                const expectedFilter = {
                    owner: 'IZU*',
                    prefix: 'pre*',
                    jobId: 'st',
                    status: 'INPUT',
                };
                const filters = { ...DEFAULT_SEARCH_FILTERS, ...expectedFilter, ...{ noParam: 'noValue' } };

                await loadUrlWithSearchFilters(driver, filters);

                expect(await testFilterDisplayStringValues(driver, expectedFilter)).to.be.true;
                expect(await testFilterFormInputValues(driver, expectedFilter)).to.be.true;
            });
        });
        describe('Owner Url Filter', () => {
            it('Should handle setting owner from url query', async () => {
                const filters = { owner: 'IZUSVR' };
                const expectedFilter = { ...DEFAULT_SEARCH_FILTERS, ...filters };
                const expectedJobs = ['IZU', 'ZOWE', 'ZWE'];

                await loadUrlWithSearchFilters(driver, filters);

                expect(await testFilterDisplayStringValues(driver, expectedFilter)).to.be.true;
                expect(await testJobOwnerFilter(driver, expectedJobs)).to.be.true;
            });
        });
        describe('Prefix Url Filter', () => {
            it('Should handle fetching jobs based on full prefix (ZOSMF_JOB_NAME)', async () => {
                const filters = { prefix: ZOSMF_JOB_NAME };
                const expectedFilter = { ...DEFAULT_SEARCH_FILTERS, ...filters };
                const expectedPrefix = ZOSMF_JOB_NAME;

                await loadUrlWithSearchFilters(driver, filters);

                expect(await testFilterDisplayStringValues(driver, expectedFilter)).to.be.true;
                expect(await testJobPrefixFilter(driver, expectedPrefix)).to.be.true;
            });

            it('Should handle fetching jobs based on prefix with asterisk (IZU*)', async () => {
                const expectedPrefix = 'IZU*';
                const filters = { prefix: expectedPrefix };
                const expectedFilter = { ...DEFAULT_SEARCH_FILTERS, ...filters };

                await loadUrlWithSearchFilters(driver, filters);

                expect(await testFilterDisplayStringValues(driver, expectedFilter)).to.be.true;
                expect(await testJobPrefixFilter(driver, expectedPrefix)).to.be.true;
            });

            it('Should handle fetching no jobs based on crazy prefix (1ZZZZZZ1)', async () => {
                const testPrefix = '1ZZZZZZ1';
                const filters = { prefix: testPrefix };
                const expectedFilter = { ...DEFAULT_SEARCH_FILTERS, ...filters };

                await loadPageWithFilterOptions(FILTER_BASE_URL, DEFAULT_SEARCH_FILTERS, { checkJobsLoaded: false })(driver, filters);

                expect(await testFilterDisplayStringValues(driver, expectedFilter)).to.be.true;
                expect(await testElementAppearsXTimesByCSS(driver, '.job-instance', 1)).to.be.true;

                const jobsNotFoundElement = await driver.findElement(By.css('.job-instance'));
                expect(await jobsNotFoundElement.getText()).to.be.equal('No jobs found');
            });
        });
        // TODO:: Revist test, on shared infrastructure currently is never able to find a job with jobId set in query params
        describe.skip('JobId Url Filter', () => {
            let jobIds;
            before('get jobIds list from jobs filtered by IZUSVR owner', async () => {
                const filters = { owner: 'IZUSVR' };
                await loadUrlWithSearchFilters(driver, filters);
                const jobObjs = await waitForAndExtractParsedJobs(driver);
                jobIds = jobObjs.map(j => { return j.jobId; });
            });

            it('Should handle setting jobId from url query', async () => {
                const expectedJobId = jobIds[0];
                const filters = { jobId: expectedJobId };
                const expectedFilter = { ...DEFAULT_SEARCH_FILTERS, ...filters };

                await loadUrlWithSearchFilters(driver, filters);

                expect(await testFilterDisplayStringValues(driver, expectedFilter)).to.be.true;
                expect(await testJobIdFilter(driver, [expectedJobId])).to.be.true;
            });
        });

        describe('Status Url Filter', () => {
            it('Should handle setting status from url query');
            // TODO: restore after we figure out job with Active status and cancelled return code
            it.skip('Should handle fetching only ACTIVE jobs', async () => {
                const filters = { status: 'ACTIVE' };
                const expectedFilter = { ...DEFAULT_SEARCH_FILTERS, ...filters };
                const expectedStatus = ['ACTIVE'];

                await loadUrlWithSearchFilters(driver, filters);

                expect(await testFilterDisplayStringValues(driver, expectedFilter)).to.be.true;
                expect(await testJobStatusFilter(driver, expectedStatus)).to.be.true;
            });

            // TODO:: Can't guarantee we will have jobs in INPUT state so skip until we can
            it.skip('Should handle fetching only INPUT jobs', async () => {
                const filters = { status: 'INPUT' };
                const expectedFilter = { ...DEFAULT_SEARCH_FILTERS, ...filters };
                const expectedStatus = ['INPUT'];

                await loadUrlWithSearchFilters(driver, filters);

                expect(await testFilterDisplayStringValues(driver, expectedFilter)).to.be.true;
                expect(await testJobStatusFilter(driver, expectedStatus)).to.be.true;
            });

            it('Should handle fetching only OUTPUT jobs', async () => {
                const filters = { status: 'OUTPUT' };
                const expectedFilter = { ...DEFAULT_SEARCH_FILTERS, ...filters };
                const expectedStatus = ['ABEND', 'OUTPUT', 'CC', 'CANCELED', 'JCL', 'SYS', 'SEC'];

                await loadUrlWithSearchFilters(driver, filters);
                expect(await testFilterDisplayStringValues(driver, expectedFilter)).to.be.true;
                expect(await testJobStatusFilter(driver, expectedStatus)).to.be.true;
            });
        });
    });
});
