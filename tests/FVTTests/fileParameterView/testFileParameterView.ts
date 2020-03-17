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
require('geckodriver');

import {
    getDriver,
    setApimlAuthTokenCookie,
    testElementAppearsXTimesByCSS,
} from 'explorer-fvt-utilities';

import {
    waitForAndExtractParsedJobs,
    ParsedJobText,
    loadPageWithFilterOptions,
    DEFAULT_SEARCH_FILTERS,
} from '../utilities';

const {
    ZOWE_USERNAME: USERNAME, ZOWE_PASSWORD: PASSWORD, SERVER_HOST_NAME, SERVER_HTTPS_PORT,
} = process.env;

const BASE_URL = `https://${SERVER_HOST_NAME}:${SERVER_HTTPS_PORT}`;
const BASE_URL_WITH_PATH = `${BASE_URL}/ui/v1/explorer-jes`;
const FILTER_BASE_URL = `${BASE_URL_WITH_PATH}/#/`;
const VIEWER_BASE_URL = `${BASE_URL_WITH_PATH}/#/viewer`;
const loadUrlWithSearchFilters = loadPageWithFilterOptions(FILTER_BASE_URL, DEFAULT_SEARCH_FILTERS);
const ZOSMF_JOB_NAME = 'IZUSVR1';

// Need to use unnamed function so we can specify the retries
// eslint-disable-next-line
describe('JES explorer spool file in url query (explorer-jes/#/viewer)', function () {
    const loadUrlWithViewerFilters = loadPageWithFilterOptions(VIEWER_BASE_URL, {}, { checkJobsLoaded: false });
    let testFilters;
    let driver;
    this.retries(3);

    before('Initialise', async () => {
        driver = await getDriver();
        await setApimlAuthTokenCookie(driver, USERNAME, PASSWORD, `${BASE_URL}/api/v1/gateway/auth/login`, BASE_URL_WITH_PATH);
    });

    after('Close out', async () => {
        if (driver) {
            driver.quit();
        }
    });

    before('get jobIds list from jobs filtered by ZOSMF_JOB_NAME prefix', async () => {
        const filters = { prefix: ZOSMF_JOB_NAME, status: 'ACTIVE' };
        await loadUrlWithSearchFilters(driver, filters);
        const jobObjs :ParsedJobText[] = await waitForAndExtractParsedJobs(driver);
        expect(jobObjs && jobObjs.length > 0).to.be.true;

        testFilters = {
            jobName: jobObjs[0].prefix,
            jobId: jobObjs[0].jobId,
            fileId: 108,
        }

        // load driver with specified filter
        await loadUrlWithViewerFilters(driver, testFilters);
 
    });

    it('Should handle rendering expected components with viewer route (File Viewer)', async () => {
        // no tree card component on side
        expect(await testElementAppearsXTimesByCSS(driver, '.tree-card', 0)).to.be.true;

        // expect content viewer to be present
        expect(await testElementAppearsXTimesByCSS(driver, '#content-viewer', 1)).to.be.true;
    });

    it('Should render jobId and fileName in card header', async () => {
        // expect content viewer to be present
        expect(await testElementAppearsXTimesByCSS(driver, '.content-tab-label', 1)).to.be.true;
        const cardHeader = await driver.findElement(By.className('content-tab-label'));

        const cardHeaderText = await cardHeader.getText();
        expect(cardHeaderText).to.not.be.undefined;
        expect(cardHeaderText).to.not.be.empty;

        const [jobId, fileName] = cardHeaderText.split('-');
        expect(jobId).to.be.equal(testFilters.jobId);
        let testFileName = 'STDOUT';
        expect(fileName).to.be.equal(testFileName);
    });

    it('Should handle rendering file contents in Orion editor', async () => {
        // wait for content to load and check if the file is open correctly with specified strings
        let viewer = await driver.findElement(By.css('#embeddedEditor > div > div > .textviewContent'));
        let text = await viewer.getText();
        text = text.trim();
        expect(text).to.have.lengthOf.greaterThan(1);
        expect(text).to.have.string('zosmfServer has been launched');
    });
});
