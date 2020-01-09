/* eslint-disable no-unused-expressions */
const { By } = require('selenium-webdriver');
const { expect } = require('chai');
const chai = require('chai');
chai.use(require('chai-things'));
require('geckodriver');

const {
    getDriver,
    checkDriver,
    waitForAndExtractParsedJobs,
    loadPageWithFilterOptions,
    getTextLineElements,
    DEFAULT_SEARCH_FILTERS,
} = require('../utilities');

const {
    testElementAppearsXTimesByCSS,
    testAllHighlightColor,
} = require('../testFunctions');

const {
    ZOWE_USERNAME: USERNAME, ZOWE_PASSWORD: PASSWORD, SERVER_HOST_NAME, SERVER_HTTPS_PORT,
} = process.env;

const BASE_URL = `https://${SERVER_HOST_NAME}:${SERVER_HTTPS_PORT}/ui/v1/explorer-jes`;
const FILTER_BASE_URL = `${BASE_URL}/#/`;
const VIEWER_BASE_URL = `${BASE_URL}/#/viewer`;
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
        await checkDriver(driver, BASE_URL, USERNAME, PASSWORD, SERVER_HOST_NAME, SERVER_HTTPS_PORT);
    });

    after('Close out', async () => {
        if (driver) {
            driver.quit();
        }
    });


    before('get jobIds list from jobs filtered by ZOSMF_JOB_NAME prefix', async () => {
        const filters = { prefix: ZOSMF_JOB_NAME, status: 'ACTIVE' };
        await loadUrlWithSearchFilters(driver, filters);
        const jobObjs = await waitForAndExtractParsedJobs(driver);
        expect(jobObjs && jobObjs.length > 0).to.be.true;
        testFilters = {
            jobName: jobObjs[0].prefix,
            jobId: jobObjs[0].jobId,
            fileId: 3,
        };
        await loadUrlWithViewerFilters(driver, testFilters);

        // wait for content to load
        const viewer = await driver.findElement(By.css('#embeddedEditor > div > div > .textviewContent'));
        const text = await viewer.getText();
        expect(text).to.have.lengthOf.greaterThan(1);
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
        const testFileName = 'JESJCL';
        expect(fileName).to.be.equal(testFileName);
    });

    it('Should handle rendering file contents in Orion editor', async () => {
        const textElems = await getTextLineElements(driver);
        expect(textElems).to.be.an('array').that.has.lengthOf.at.least(1);
        expect(testAllHighlightColor(textElems)).to.be.true;
    });
});
