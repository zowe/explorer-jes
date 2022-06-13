import { getDriver as getBrowserDriver, setApimlAuthTokenCookie } from 'explorer-fvt-utilities';
import { WebDriver } from 'selenium-webdriver';
import { DEFAULT_SEARCH_FILTERS, loadPageWithFilterOptions } from './utilities';

const {
    ZOWE_USERNAME: USERNAME, ZOWE_PASSWORD: PASSWORD, SERVER_HOST_NAME, SERVER_HTTPS_PORT, TEST_BROWSER
} = process.env;

const BASE_URL = `https://${SERVER_HOST_NAME}:${SERVER_HTTPS_PORT}`;
const BASE_URL_WITH_PATH = `${BASE_URL}/explorer-jes/ui/v1`;
const FILTER_BASE_URL = `${BASE_URL_WITH_PATH}/#/`;
const VIEWER_BASE_URL = `${BASE_URL_WITH_PATH}/#/viewer`;
const loadUrlWithSearchFilters = loadPageWithFilterOptions(FILTER_BASE_URL, DEFAULT_SEARCH_FILTERS);
const ZOSMF_JOB_NAME = 'IZUSVR1';

export async function getDriver():Promise<WebDriver> {
    let driver: WebDriver;
    try {
        driver = await getBrowserDriver(TEST_BROWSER) as WebDriver;
        await setApimlAuthTokenCookie(driver, USERNAME, PASSWORD, `${BASE_URL}/gateway/api/v1/auth/login`, BASE_URL_WITH_PATH);
        return driver;
    } catch (err) {
        console.error(err);
    }
};

export const TEST_CONFIG = {
  SERVER_HOST_NAME, SERVER_HTTPS_PORT, USERNAME, PASSWORD,
  BASE_URL, BASE_URL_WITH_PATH, FILTER_BASE_URL, VIEWER_BASE_URL, loadUrlWithSearchFilters, ZOSMF_JOB_NAME
};
