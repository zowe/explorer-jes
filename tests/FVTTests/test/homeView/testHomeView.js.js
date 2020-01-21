/* eslint-disable no-unused-expressions */
const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const chai = require('chai');
chai.use(require('chai-things'));
require('geckodriver');

const {
    getDriver,
    checkDriver,
    findAndClickApplyButton,
    reloadAndOpenFilterPanel,
    waitForAndExtractJobs,
    getTextLineElements,
    VAR_LANG_CLASS,
    COMMENT_STR_CLASS,
    COMMENT_CLASS,
    COMMENT_ATTR_CLASS,
    NO_CLASS,
    submitJob,
} = require('../utilities');

const {
    testElementAppearsXTimesById,
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
    testHighlightColorByClass,
} = require('../testFunctions');

const {
    TEST_JOB_PREFIX,
    SHORT_JOB,
    LONG_JOB,
} = require('../testResources');

require('dotenv').config();

const {
    ZOWE_USERNAME: USERNAME, ZOWE_PASSWORD: PASSWORD, ZOWE_JOB_NAME, SERVER_HOST_NAME, SERVER_HTTPS_PORT,
} = process.env;

const BASE_URL = `https://${SERVER_HOST_NAME}:${SERVER_HTTPS_PORT}/ui/v1/explorer-jes`;
const ZOSMF_JOB_NAME = 'IZUSVR1';

// Need to use unnamed function so we can specify the retries
// eslint-disable-next-line
describe('JES explorer function verification tests', function () {
    let driver;
    this.retries(3);

    before('Initialise', async () => {
        // TODO:: Do we need to turn this into a singleton in order to have driver accessible by multiple files in global namespace?
        driver = await getDriver();
        await checkDriver(driver, BASE_URL, USERNAME, PASSWORD, SERVER_HOST_NAME, SERVER_HTTPS_PORT);

        // Make sure we have a job in output and active
        await submitJob(SHORT_JOB, SERVER_HOST_NAME, SERVER_HTTPS_PORT, USERNAME, PASSWORD);
        await submitJob(LONG_JOB, SERVER_HOST_NAME, SERVER_HTTPS_PORT, USERNAME, PASSWORD);
        // await debugApiCall('jobs?owner=*&prefix=*', SERVER_HOST_NAME, SERVER_HTTPS_PORT, USERNAME, PASSWORD);
    });

    after('Close out', async () => {
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
                    await driver.sleep(1000);
                    await driver.wait(until.elementLocated(By.id('refresh-icon')), 10000);
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
                    it('Should handle fetching jobs based on full prefix (ZOSMF_JOB_NAME)', async () => {
                        expect(await testPrefixFilterFetching(driver, ZOSMF_JOB_NAME)).to.be.true;
                    });
                    it('Should handle fetching jobs based on prefix with asterisk (IZU*)', async () => {
                        expect(await testPrefixFilterFetching(driver, 'IZU*')).to.be.true;
                    });
                    it('Should handle fetching no jobs based on crazy prefix (1ZZZZZZ1)', async () => {
                        expect(await testPrefixFilterFetching(driver, '1ZZZZZZ1', true)).to.be.true;
                    });
                });

                describe('Owner Filter', () => {
                    it('Should handle fetching jobs based on owner filter set to ZOWESVR owner (IZUSVR)', async () => {
                        expect(await testOwnerFilterFetching(driver, 'IZUSVR', ['IZU', 'ZOWE', 'ZWE'])).to.be.true;
                    });
                    it('Should handle fetching no jobs based on crazy owner (1ZZZZZZ1)', async () => {
                        expect(await testOwnerFilterFetching(driver, '1ZZZZZZ1', [])).to.be.true;
                    });
                });

                describe('Status Filter', () => {
                    // Job-instance elements go stale on pipeline infrastructure
                    it.skip('Should handle fetching only ACTIVE jobs', async () => {
                        expect(await testStatusFilterFetching(driver, 'ACTIVE', ['ACTIVE'])).to.be.true;
                    });
                    // TODO:: Can't guarantee we will have jobs in INPUT state so skip until we can
                    it.skip('Should handle fetching only INPUT jobs', async () => {
                        expect(await testStatusFilterFetching(driver, 'INPUT')).to.be.true;
                    });
                    it.skip('Should handle fetching only OUTPUT jobs', async () => {
                        expect(await testStatusFilterFetching(driver, 'OUTPUT', ['ABEND', 'OUTPUT', 'CC', 'CANCELED', 'JCL', 'SYS', 'SEC'])).to.be.true;
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
                // TODO:: Can we find a way to scroll more jobs in to view for clicking
                it.skip('Should handle rendering multiple jobs files', async () => {
                    expect(await testJobFilesLoad(driver, '*', `${TEST_JOB_PREFIX}*`, null)).to.be.true;
                });

                it('Should handle un rendering job files when clicking an already toggle job', async () => {
                    expect(await testJobFilesLoad(driver, '*', 'ZFS', null)).to.be.true;

                    const jobLink = await driver.findElements(By.css('.job-instance > li > div> .content-link'));
                    expect(jobLink).to.be.an('array').that.has.lengthOf.at.least(1);
                    await jobLink[0].click();

                    await driver.sleep(1000);

                    const jobFiles = await driver.findElements(By.className('job-file'));
                    expect(jobFiles).to.be.an('array').that.has.lengthOf(0);
                });

                it('Should handle opening a files content when clicked', async () => {
                    expect(await testJobFilesLoad(driver, '*', ZOSMF_JOB_NAME, null)).to.be.true;
                    const fileLink = await driver.findElements(By.css('.job-instance > ul > div > li > div > .content-link'));
                    expect(fileLink).to.be.an('array').that.has.lengthOf.at.least(1);
                    await fileLink[0].click();

                    const viewer = await driver.findElement(By.css('#embeddedEditor > div > div > .textviewContent'));
                    const text = await viewer.getText();
                    expect(text).to.have.lengthOf.greaterThan(1);
                });

                it('Should handle setting refresh icon to loading icon when job file loading', async () => {
                    expect(await testJobFilesLoad(driver, '*', ZOSMF_JOB_NAME, null)).to.be.true;
                    expect(await testElementAppearsXTimesById(driver, 'refresh-icon', 1)).to.be.true;
                });
                it('Should handle opening a files content unathorised for user and display error message');
            });
            it('Should handle rendering context menu on right click', async () => {
                await reloadAndOpenFilterPanel(driver);
                expect(await testTextInputFieldCanBeModified(driver, 'filter-owner-field', '*'), 'filter-owner-field wrong').to.be.true;
                expect(await testTextInputFieldCanBeModified(driver, 'filter-prefix-field', ZOSMF_JOB_NAME), 'filter-prefix-field wrong').to.be.true;
                await findAndClickApplyButton(driver);

                const jobs = await waitForAndExtractJobs(driver);
                expect(jobs).to.be.an('array').that.has.lengthOf.at.least(1);
                const actions = driver.actions();
                await actions.contextClick(jobs[0]).perform();
                await driver.sleep(1000); // TODO:: replace with driver wait for element to be visible
                const contextMenuEntries = await driver.findElements(By.css('.job-instance > nav > div'));
                const text = await contextMenuEntries[0].getText();
                expect(text).to.equal('Open');
            });
            // TODO: check after PURGE API is validated on HSS and ZD&T
            it('Should handle purging a job');
            it('Should handle getting JCL of job');
            it('Should handle closing context menu when clicking elsewhere on screen');
        });
        describe.skip('Editor behaviour', () => {
            const jobFileName = 'JESJCL';

            it('Should open a file when clicking on it', async () => {
                expect(await getJobAndOpenFile(driver, '*', `${TEST_JOB_PREFIX}S`, null, jobFileName)).to.be.true;
            });

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
                // TODO:: We need to get comments in the test jcl
                it.skip('test comment class color', async () => {
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
});
