/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2020
 */
import { expect } from 'chai';
import { WebDriver, until, By } from "selenium-webdriver"

import { loadPage } from 'explorer-fvt-utilities';
import { getDriver, TEST_CONFIG } from '../testConfig';
const { BASE_URL_WITH_PATH } = TEST_CONFIG;


// Need to use unnamed function so we can specify the retries
// eslint-disable-next-line
describe('JES explorer page load', function () {
    let driver: WebDriver;
    this.retries(0);

    before('Initialise', async () => {
        driver = await getDriver();
    });

    after('Close out', async () => {
        if (driver) {
            driver.quit();
        }
    });

    describe('Sidebar resizing', () => {
        before('Initialise', async () => {
            await loadPage(driver, BASE_URL_WITH_PATH);
            await driver.wait(until.elementLocated(By.id('refresh-icon')));
            await driver.manage().window().setRect({ width: 1600, height: 800 });
        })
        it('Should be able to resize sidebar component (explorer-sidebar)', async () => {
            const barWidth = await getSidebarCSSValue('width');
            await resizeSidebarRelatively(200);
            expect(parseInt(await getSidebarCSSValue('width'))).to.be.above(parseInt(barWidth) + 190);
        });
        it('Should not be able to make sidebar component too small (explorer-sidebar)', async () => {
            await resizeSidebarRelatively(-500);
            expect(parseInt(await getSidebarCSSValue('width'))).to.be.above(250);
        });
    });

    describe('Sidebar collapsing', () => {
        it('Should handle collapsing of sidebar component (explorer-sidebar)', async () => {
            await switchSidebarState();
            expect(await getSidebarCSSValue('display')).to.equal('none');
        });
        it('Should handle expanding of sidebar component (explorer-sidebar)', async () => {
            await switchSidebarState();
            expect(await getSidebarCSSValue('display')).to.equal('block');
        });
    });

    async function resizeSidebarRelatively(x: number) {
        const resizeBar = await driver.findElement(By.id('resize-bar'));
        const actions = driver.actions({async: true});
        await actions.move({origin: resizeBar, y: 200}).press().move({origin: resizeBar, x: x}).release().perform();
    }

    async function getSidebarCSSValue(value: string) {
        const explorerSidebar = await driver.findElement(By.id('explorer-sidebar'));
        const explorerSidebarCSSValue = await explorerSidebar.getCssValue(value);
        return explorerSidebarCSSValue;
    }

    async function switchSidebarState() {
        const collapseButton = await driver.findElement(By.id('collapse-button'));
        await collapseButton.click();
    }

});
