/* eslint-disable no-unused-expressions */
const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const { assert } = require('chai');
const chai = require('chai');
chai.use(require('chai-things'));
require('geckodriver');

const {
    getDriver,
    loadPage,
    findAndClickApplyButton,
    reloadAndOpenFilterPanel,
    waitForAndExtractJobs,
    waitForAndExtractParsedJobs,
    loadPageWithFilterOptions,
    DEFAULT_SEARCH_FILTERS,
    getTextLineElements,
    VAR_LANG_CLASS,
    COMMENT_STR_CLASS,
    COMMENT_CLASS,
    COMMENT_ATTR_CLASS,
    NO_CLASS,
} = require('./utilities');

const {
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
} = require('./testFunctions');

require('dotenv').config();

const {
    ZOWE_USERNAME: USERNAME, ZOWE_PASSWORD: PASSWORD, ZOWE_JOB_NAME, SERVER_HOST_NAME, SERVER_HTTPS_PORT,
} = process.env;


const BASE_URL = `https://${SERVER_HOST_NAME}:${SERVER_HTTPS_PORT}/ui/v1/explorer-jes`;
const FILTER_BASE_URL = `${BASE_URL}/#/`;
const loadUrlWithSearchFilters = loadPageWithFilterOptions(FILTER_BASE_URL, DEFAULT_SEARCH_FILTERS);


describe('JES explorer function verification tests', () => {
    let driver;

    before('Initialise', async () => {
        expect(USERNAME, 'USERNAME is not defined').to.not.be.empty;
        expect(PASSWORD, 'PASSWORD is not defined').to.not.be.empty;
        expect(ZOWE_JOB_NAME, 'ZOWE_JOB_NAME is not defined').to.not.be.empty;
        expect(SERVER_HOST_NAME, 'SERVER_HOST_NAME is not defined').to.not.be.empty;
        expect(SERVER_HTTPS_PORT, 'SERVER_HTTPS_PORT is not defined').to.not.be.empty;

        // TODO:: Do we need to turn this into a singleton in order to have driver accessible by multiple files in global namespace?
        driver = await getDriver();
        try {
            await driver.get(`https://${USERNAME}:${PASSWORD}@tvt5003.svl.ibm.com:9554/api/v1/jobs/username`);
            await loadPage(driver, BASE_URL, USERNAME, PASSWORD);
            // Ensure tree and editor have loaded
            await driver.wait(until.elementLocated(By.id('job-list')), 30000);
            await driver.wait(until.elementLocated(By.id('embeddedEditor')), 30000);
            await driver.sleep(5000);
        } catch (e) {
            assert.fail(`Failed to initialise: ${e}`);
        }
    });

    after('Close out', () => {
        if (driver) {
            driver.quit();
        }
    });

    describe('JES explorer home view', () => {
        it('Should handle rendering expected components (Navigator[filters+tree] & File Viewer)');
        describe('Component resizing', () => {
            afterEach(async () => {
                await driver.manage().window().setRect({ width: 1600, height: 800 });
            });
            // TODO:: replace offset with constant
            it.skip('Should handle resizing of tree card component', async () => {
                expect(await testWindowHeightChangeForcesComponentHeightChange(driver, 'tree-text-content', 126)).to.be.true;
            });
            // TODO:: change overflow of job-list to scroll so we can check this correctly
            it.skip('Should handle resizing just the tree', async () => {
                expect(await testWindowHeightChangeForcesComponentHeightChange(driver, 'job-list', 126 + 104)).to.be.true;
            });
            // TODO:: need to remove browser offset from orion editor component in Content Viewer
            it.skip('Should handle resizing of editor card component', async () => {
                expect(await testWindowHeightChangeForcesComponentHeightChange(driver, 'content-viewer', 126)).to.be.true;
            });
            it.skip('Should handle resizing just the editor text area', async () => {
                expect(await testWindowHeightChangeForcesComponentHeightChange(driver, 'embeddedEditor', 126 + 8)).to.be.true;
            });
        });

        describe('Filter card component behaviour', () => {
            describe('Pre expansion', () => {
                it('Should render filter card (filter-view)', async () => {
                    const filterView = await driver.findElements(By.id('filter-view'));
                    expect(filterView).to.be.an('array').that.has.lengthOf(1);
                });

                it('Should render filter card title', async () => {
                    const cardTitle = await driver.findElements(By.css('#filter-view > div > div'));
                    const text = await cardTitle[0].getText();
                    expect(text).to.equal('Job Filters');
                });

                it('Should render filter card expand icon (svg)', async () => {
                    const expandIcon = await driver.findElements(By.css('#filter-view > div > div > span > svg'));
                    expect(expandIcon).to.be.an('array').that.has.lengthOf(1);
                });

                // Updating to newer react means the filter form is in the DOM now but the parent component has a height of 0 to hide it
                it.skip('Should not render filter-form before expansion', async () => {
                    const filterForm = await driver.findElements(By.id('filter-form'));
                    expect(filterForm).to.be.an('array').that.has.lengthOf(0);
                });

                // Same as filter-form, need a way of checking if element is visible
                it.skip('Should not render filter-input-fields before expansion', async () => {
                    expect(await testElementAppearsXTimesById(driver, 'filter-owner-field', 0), 'filter-owner-field wrong').to.be.true;
                    expect(await testElementAppearsXTimesById(driver, 'filter-prefix-field', 0), 'filter-prefix-field wrong').to.be.true;
                    expect(await testElementAppearsXTimesById(driver, 'filter-jobId-field', 0), 'filter-jobId-field wrong').to.be.true;
                    expect(await testElementAppearsXTimesById(driver, 'filter-status-field', 0), 'filter-status-field wrong').to.be.true;
                });

                it('Should render filter-form after card click', async () => {
                    await reloadAndOpenFilterPanel(driver);
                    const filterForm = await driver.findElements(By.id('filter-form'));
                    expect(filterForm).to.be.an('array').that.has.lengthOf(1);
                });
            });

            describe('Post expansion', () => {
                beforeEach(async () => {
                    await reloadAndOpenFilterPanel(driver);
                });

                it('Should render filter-input-fields after expansion', async () => {
                    expect(await testElementAppearsXTimesById(driver, 'filter-owner-field', 1), 'filter-owner-field wrong').to.be.true;
                    expect(await testElementAppearsXTimesById(driver, 'filter-prefix-field', 1), 'filter-prefix-field wrong').to.be.true;
                    expect(await testElementAppearsXTimesById(driver, 'filter-jobId-field', 1), 'filter-jobId-field wrong').to.be.true;
                    expect(await testElementAppearsXTimesById(driver, 'filter-status-field', 1), 'filter-status-field wrong').to.be.true;
                });

                it('Should pre-populate owner field with username', async () => {
                    const ownerField = await driver.findElement(By.id('filter-owner-field'));
                    expect(await ownerField.getAttribute('value')).to.equal(USERNAME.toUpperCase());
                });

                it('Should allow input fields to be changed', async () => {
                    expect(await testTextInputFieldCanBeModified(driver, 'filter-owner-field'), 'filter-owner-field wrong').to.be.true;
                    expect(await testTextInputFieldCanBeModified(driver, 'filter-prefix-field'), 'filter-prefix-field wrong').to.be.true;
                    expect(await testTextInputFieldCanBeModified(driver, 'filter-jobId-field'), 'filter-jobId-field wrong').to.be.true;
                });

                it('Should reset filter fields when reset clicked', async () => {
                    expect(await testTextInputFieldCanBeModified(driver, 'filter-owner-field'), 'filter-owner-field wrong').to.be.true;
                    expect(await testTextInputFieldCanBeModified(driver, 'filter-prefix-field'), 'filter-prefix-field wrong').to.be.true;
                    expect(await testTextInputFieldCanBeModified(driver, 'filter-jobId-field'), 'filter-jobId-field wrong').to.be.true;
                    const resetButton = await driver.findElement(By.id('filters-reset-button'));
                    await resetButton.click();
                    expect(await testTextInputFieldValue(driver, 'filter-owner-field', USERNAME.toUpperCase()), 'filter-owner-field wrong').to.be.true;
                    expect(await testTextInputFieldValue(driver, 'filter-prefix-field', '*'), 'filter-prefix-field wrong').to.be.true;
                    expect(await testTextInputFieldValue(driver, 'filter-jobId-field', '*'), 'filter-jobId-field wrong').to.be.true;
                });

                // Element is rendered with new react version, need to check if visibile now
                it.skip('Should handle closing the filter card when clicking apply', async () => {
                    await findAndClickApplyButton(driver);
                    expect(await testElementAppearsXTimesById(driver, 'filter-form', 0)).to.be.true;
                });
                // Same as above
                it.skip('Should handle closing the filter card when clicking card header');
            });
        });
        describe('Tree interaction', () => {
            // TODO:: Implement once we have an ID for refresh icon and loading icon
            it.skip('Should handle reloading jobs when clicking refresh icon');
            describe('Job status labels', () => {
                before(async () => {
                    await reloadAndOpenFilterPanel(driver);
                    expect(await testTextInputFieldCanBeModified(driver, 'filter-owner-field', '*'), 'filter-owner-field wrong').to.be.true;
                    expect(await testTextInputFieldCanBeModified(driver, 'filter-prefix-field', '*'), 'filter-prefix-field wrong').to.be.true;
                    expect(await testTextInputFieldCanBeModified(driver, 'filter-jobId-field', '*'), 'filter-jobId-field wrong').to.be.true;
                    await findAndClickApplyButton(driver);
                    await driver.wait(until.elementLocated(By.className('job-instance')), 10000);
                });

                it('Should handle showing jobs as ACTIVE', async () => {
                    expect(await testJobInstancesShowsStatus(driver, 'ACTIVE'), 'show job status: ACTIVE').to.be.true;
                });
                it('Should handle showing ACTIVE jobs with blue status', async () => {
                    const BLUE_STATUS = 'rgb(46, 119, 161)';
                    expect(await testColourOfStatus(driver, 'ACTIVE', BLUE_STATUS)).to.be.true;
                });

                it('Should handle showing jobs as finished with CC 00', async () => {
                    expect(await testJobInstancesShowsStatus(driver, 'CC 00'), 'show job status: CC 00').to.be.true;
                });
                it('Should handle showing CC 00** jobs with grey status', async () => {
                    const GREY_STATUS = 'rgb(128, 128, 128)';
                    expect(await testColourOfStatus(driver, 'CC 00', GREY_STATUS)).to.be.true;
                });

                it('Should handle showing jobs as in OUTPUT', async () => {
                    expect(await testJobInstancesShowsStatus(driver, 'OUTPUT'), 'show job status: OUTPUT').to.be.true;
                });
                // TODO:: Implement once https://github.com/zowe/explorer-jes/issues/86 is resolved
                it.skip('Should handle showing OUTPUT jobs with grey status', async () => {
                    const GREY_STATUS = 'rgb(128, 128, 128)';
                    expect(await testColourOfStatus(driver, 'OUTPUT', GREY_STATUS)).to.be.true;
                });

                // TODO: NOT ALWAYS HAVE ABEND
                it.skip('Should handle showing jobs as ABEND', async () => {
                    expect(await testJobInstancesShowsStatus(driver, 'ABEND'), 'show job status: ABEND').to.be.true;
                });
                it('Should handle showing ABEND jobs with red status', async () => {
                    const RED_STATUS = 'rgb(255, 0, 0)';
                    expect(await testColourOfStatus(driver, 'ABEND', RED_STATUS)).to.be.true;
                });

                // TODO: NOT ALWAYS HAVE JCL ERROR
                it.skip('Should handle showing jobs with JCL ERROR', async () => {
                    expect(await testJobInstancesShowsStatus(driver, 'JCL ERROR'), 'show job status: JCL ERROR').to.be.true;
                });
                it('Should handle showing JCL ERROR jobs with red status', async () => {
                    const RED_STATUS = 'rgb(255, 0, 0)';
                    expect(await testColourOfStatus(driver, 'ABEND', RED_STATUS)).to.be.true;
                });
            });
            describe('Job filtering', () => {
                beforeEach(async () => {
                    await reloadAndOpenFilterPanel(driver);
                });

                describe('Prefix Filter', () => {
                    it('Should handle fetching jobs based on full prefix (ZOWE_JOB_NAME)', async () => {
                        expect(await testPrefixFilterFetching(driver, ZOWE_JOB_NAME)).to.be.true;
                    });
                    it('Should handle fetching jobs based on prefix with asterisk (ZOWE*)', async () => {
                        expect(await testPrefixFilterFetching(driver, 'ZOWE*')).to.be.true;
                    });
                    // TODO:: remove skip flag and rework test once we have message in the tree showing no jobs found
                    it.skip('Should handle fetching no jobs based on crazy prefix (1ZZZZZZ1)', async () => {
                        expect(await testPrefixFilterFetching(driver, '1ZZZZZZ1')).to.be.true;
                    });
                });

                describe('Owner Filter', () => {
                    it('Should handle fetching jobs based on owner filter set to ZOWESVR owner (IZUSVR)', async () => {
                        expect(await testOwnerFilterFetching(driver, 'IZUSVR', ['IZU', 'ZOWE', 'ZWE'])).to.be.true;
                    });
                    // TODO:: remove skip flag and rework test once we have message in the tree showing no jobs found
                    it.skip('Should handle fetching no jobs based on crazy owner (1ZZZZZZ1)', async () => {
                        expect(await testOwnerFilterFetching(driver, '1ZZZZZZ1', [])).to.be.true;
                    });
                });

                describe('Status Filter', () => {
                    // TODO: restore after we figure out job with Active status and cancelled return code
                    it.skip('Should handle fetching only ACTIVE jobs', async () => {
                        expect(await testStatusFilterFetching(driver, 'ACTIVE', ['ACTIVE'])).to.be.true;
                    });
                    // TODO:: Can't guarantee we will have jobs in INPUT state so skip until we can
                    it.skip('Should handle fetching only INPUT jobs', async () => {
                        expect(await testStatusFilterFetching(driver, 'INPUT')).to.be.true;
                    });
                    it.skip('Should handle fetching only OUTPUT jobs', async () => {
                        expect(await testStatusFilterFetching(driver, 'OUTPUT', ['ABEND', 'OUTPUT', 'CC', 'CANCELED', 'JCL', 'SYS'])).to.be.true;
                    });
                });

                describe('Error handling', () => {
                    it('Should display warning when owner and prefix are *');
                    it('Should show no jobs found message when no jobs returned');
                });
            });

            describe('Job Files', () => {
                it('Should handle rendering job files when clicking on a job', async () => {
                    // TODO:: Is using ZFS safe, we should extract to a constant
                    expect(await testJobFilesLoad(driver, '*', 'ZFS', null)).to.be.true;
                });

                it('Should handle rendering multiple jobs files', async () => {
                    expect(await testJobFilesLoad(driver, '*', 'IZU*', null)).to.be.true;
                });

                it('Should handle un rendering job files when clicking an already toggle job', async () => {
                    expect(await testJobFilesLoad(driver, '*', 'ZFS', null)).to.be.true;

                    const jobLink = await driver.findElements(By.css('.job-instance > li > div> .content-link'));
                    expect(jobLink).to.be.an('array').that.has.lengthOf.at.least(1);
                    await jobLink[0].click();

                    const jobFiles = await driver.findElements(By.className('job-file'));
                    expect(jobFiles).to.be.an('array').that.has.lengthOf(0);
                });

                it('Should handle opening a files content when clicked', async () => {
                    expect(await testJobFilesLoad(driver, '*', ZOWE_JOB_NAME, null)).to.be.true;
                    const fileLink = await driver.findElements(By.css('.job-instance > ul > div > li > div > .content-link'));
                    expect(fileLink).to.be.an('array').that.has.lengthOf.at.least(1);
                    await fileLink[0].click();

                    const viewer = await driver.findElement(By.css('#embeddedEditor > div > div > .textviewContent'));
                    const text = await viewer.getText();
                    expect(text).to.have.lengthOf.greaterThan(1);
                });

                // TODO:: Implement once we have IDs for refresh vs loading icon
                it.skip('Should handle setting refresh icon to loading icon when job file loading', async () => {
                    expect(await testJobFilesLoad(driver, '*', ZOWE_JOB_NAME, null)).to.be.true;
                    // await findByCssAndClick(driver, '#tree-text-content > svg');
                });
                it('Should handle opening a files content unathorised for user and display error message');
            });
            it('Should handle rendering context menu on right click', async () => {
                await reloadAndOpenFilterPanel(driver);
                expect(await testTextInputFieldCanBeModified(driver, 'filter-owner-field', '*'), 'filter-owner-field wrong').to.be.true;
                expect(await testTextInputFieldCanBeModified(driver, 'filter-prefix-field', ZOWE_JOB_NAME), 'filter-prefix-field wrong').to.be.true;
                await findAndClickApplyButton(driver);

                const jobs = await waitForAndExtractJobs(driver);
                expect(jobs).to.be.an('array').that.has.lengthOf.at.least(1);
                const actions = driver.actions();
                await actions.contextClick(jobs[0]).perform();
                await driver.sleep(1000); // TODO:: replace with driver wait for element to be visible
                const contextMenuEntries = await driver.findElements(By.css('.job-instance > nav > div'));
                const text = await contextMenuEntries[0].getText();
                expect(text).to.equal('Purge Job');
            });
            // TODO: check after PURGE API is validated on HSS and ZD&T
            it('Should handle purging a job');
            it('Should handle closing context menu when clicking elsewhere on screen');
        });
        describe('Editor behaviour', () => {
            const jobFileName = 'JESJCL';

            before('before editor behavior', async () => {
                expect(await getJobAndOpenFile(driver, '*', ZOWE_JOB_NAME, null, jobFileName)).to.be.true;
                await driver.sleep(10000); // TODO:: replace with driver wait for element to be visible
            });

            it('Set content viewer header to Loading:');

            it('Should display job name, id and file name in card header', async () => {
                const viewer = await driver.findElements(By.className('content-tab-label'));
                const tabLabelText = await viewer[0].getText();
                expect(tabLabelText).to.contain(jobFileName);
            });

            it('Should display file contents in Orion text area', async () => {
                const textLineDivs = await driver.findElements(By.css('.textviewContent > div'));
                expect(textLineDivs).to.be.an('array').that.has.length.gte(1);
            });

            // TODO:: Need to add tests for checking tab functionality

            describe('Should highlight JESJCL correctly', () => {
                let elems;

                before('before highlight JESJCL correctly', async () => {
                    elems = await getTextLineElements(driver);
                    expect(elems).to.be.an('array').that.has.lengthOf.at.least(1);
                });

                it('test variable-language class color', () => {
                    const colorClass = VAR_LANG_CLASS;
                    expect(testHighlightColorByClass(colorClass, elems)).to.be.true;
                });
                it('test cm-string class color', () => {
                    const colorClass = COMMENT_STR_CLASS;
                    expect(testHighlightColorByClass(colorClass, elems)).to.be.true;
                });
                it('test comment class color', () => {
                    const colorClass = COMMENT_CLASS;
                    expect(testHighlightColorByClass(colorClass, elems)).to.be.true;
                });
                it('test cm-attribute class color', () => {
                    const colorClass = COMMENT_ATTR_CLASS;
                    expect(testHighlightColorByClass(colorClass, elems)).to.be.true;
                });
                it('test lines without color class', () => {
                    const colorClass = NO_CLASS;
                    expect(testHighlightColorByClass(colorClass, elems)).to.be.true;
                });
            });

            // TODO:: Need to add tests for checking read only changes when looking at output file vs SJ
            it('Should be read only', async () => {
                const textLines = await driver.findElements(By.css('.textviewContent > div > span'));
                expect(textLines)
                    .to.be.an('array')
                    .that.has.length.gte(1);
                const [line1] = textLines;
                await line1.click();
                const beforeText = await line1.getText();
                expect(beforeText).to.not.be.undefined;
                let isExceptionThrown = false;
                try {
                    await line1.sendKeys('dummy text');
                } catch (err) {
                    isExceptionThrown = true;
                }

                expect(isExceptionThrown).to.be.true;
                const afterText = await line1.getText();
                expect(beforeText).to.be.equal(afterText);
            });
        });
    });

    describe('JES explorer home view with filters in url query', () => {
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

                // raised github issue #84 against explorer-jes repo, remove skip after that resolution
                it.skip('Should handle a none recognised query parameter gracefully (still load page)', async () => {
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
                it('Should handle fetching jobs based on full prefix (ZOWE_JOB_NAME)', async () => {
                    const filters = { prefix: ZOWE_JOB_NAME };
                    const expectedFilter = { ...DEFAULT_SEARCH_FILTERS, ...filters };
                    const expectedPrefix = ZOWE_JOB_NAME;

                    await loadUrlWithSearchFilters(driver, filters);

                    expect(await testFilterDisplayStringValues(driver, expectedFilter)).to.be.true;
                    expect(await testJobPrefixFilter(driver, expectedPrefix)).to.be.true;
                });

                it('Should handle fetching jobs based on prefix with asterisk (ZOWE*)', async () => {
                    const expectedPrefix = 'ZOWE*';
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
            describe('JobId Url Filter', () => {
                let jobIds;
                before('get jobIds list from jobs filtered by IZUSVR owner', async () => {
                    const filters = { owner: 'IZUSVR' };
                    await loadUrlWithSearchFilters(driver, filters);
                    const jobObjs = await waitForAndExtractParsedJobs(driver);
                    jobIds = jobObjs.map(j => { return j.jobId; });
                });

                it('Should handle setting jobID from url query', async () => {
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
                    const expectedStatus = ['ABEND', 'OUTPUT', 'CC', 'CANCELED', 'JCL', 'SYS'];

                    await loadUrlWithSearchFilters(driver, filters);
                    expect(await testFilterDisplayStringValues(driver, expectedFilter)).to.be.true;
                    expect(await testJobStatusFilter(driver, expectedStatus)).to.be.true;
                });
            });
        });
    });
    describe('JES explorer spool file in url query (explorer-jes/#/viewer)', () => {
        const VIEWER_BASE_URL = `${BASE_URL}/#/viewer`;
        const loadUrlWithViewerFilters = loadPageWithFilterOptions(VIEWER_BASE_URL, {}, { checkJobsLoaded: false });
        const testFileName = 'JESJCL';
        let testFilters;

        before('get jobIds list from jobs filtered by ZOWE_JOB_NAME prefix', async () => {
            const filters = { prefix: ZOWE_JOB_NAME, status: 'ACTIVE' };
            await loadUrlWithSearchFilters(driver, filters);
            const jobObjs = await waitForAndExtractParsedJobs(driver);
            expect(jobObjs && jobObjs.length > 0).to.be.true;
            testFilters = {
                jobName: jobObjs[0].prefix,
                jobId: jobObjs[0].jobId,
                fileId: 3,
            };
            await loadUrlWithViewerFilters(driver, testFilters);
            await driver.sleep(10000);
        });

        it('Should handle rendering expected components with viewer route (File Viewer)', async () => {
            // no tree card component on side
            expect(await testElementAppearsXTimesByCSS(driver, '.tree-card', 0)).to.be.true;

            // expect content viewer to be present
            expect(await testElementAppearsXTimesByCSS(driver, '#content-viewer', 1)).to.be.true;
        });

        it('Should render file name, job name and job id in card header', async () => {
            // expect content viewer to be present
            expect(await testElementAppearsXTimesByCSS(driver, '.content-tab-label', 1)).to.be.true;
            const cardHeader = await driver.findElement(By.className('content-tab-label'));

            const cardHeaderText = await cardHeader.getText();
            expect(cardHeaderText).to.not.be.undefined;
            expect(cardHeaderText).to.not.be.empty;

            const [jobId, fileName] = cardHeaderText.split('-');
            expect(jobId).to.be.equal(testFilters.jobId);
            expect(fileName).to.be.equal(testFileName);
        });

        it('Should handle rendering file contents in Orion editor', async () => {
            const textElems = await getTextLineElements(driver);
            expect(textElems).to.be.an('array').that.has.lengthOf.at.least(1);
            expect(testAllHighlightColor(textElems)).to.be.true;
        });
    });
});
