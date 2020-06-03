import puppeteer, { Browser, Page } from "puppeteer";
import { toMatchImageSnapshot } from "jest-image-snapshot";

expect.extend({ toMatchImageSnapshot });
jest.setTimeout(60000);

const headless = false//process.env.HEADLESS !== "false";

export class PageHandler {
    constructor(public page: Page) { }

    public async matchImage() {
        for (const [device, width] of Object.entries({
            mobile: 580,
            tablet: 1050,
            desktop: 1920,
        })) {
            await this.page.setViewport(
                {
                    ...this.page.viewport(),
                    width,
                }
            );
            const height = await this.page.$eval("#content", (e) => (e as any).offsetHeight);

            await this.page.setViewport(
                {
                    ...this.page.viewport(),
                    height,
                }
            );

            await this.page.evaluate(() => {
                document.querySelector("#content").scrollIntoView();
            });

            (expect(await this.page.screenshot()) as any)
                .toMatchImageSnapshot({
                    failureThreshold: headless ? 0 : 1,
                    failureThresholdType: 'percent',
                    customSnapshotIdentifier: ({ defaultIdentifier }) => `${defaultIdentifier}-${device}`
                });
        }
    }

    public async matchSnapshot() {
        let snapshot = await this.page.$eval("#content", ({ innerHTML }) => innerHTML)
            .catch(e => "");

        expect(snapshot).toMatchSnapshot();
    }

    public async close() {
        await this.page.close();
    }
}

export class BrowserHandler {
    private browser: Browser;

    public async init() {
        this.browser = await puppeteer.launch({
            headless,
            slowMo: headless ? 0 : 100,
            ignoreDefaultArgs: ["--hide-scrollbars"]
        });
    }

    public async createPageHandler(data: string) {
        const page = await this.browser.newPage();

        await page.goto("http://localhost:3000/form.html");
        await page.evaluate((innerHTML) => {
            document.querySelector("textarea").innerHTML = innerHTML;
            document.querySelector("form").submit();
        }, data);

        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        await page.evaluate(() => {
            var consentConfirm = document.getElementById("selectAll");
            if (!!consentConfirm) consentConfirm.click();

            var stageassistent = document.getElementById("stageassistent");
            if (!!stageassistent) stageassistent.remove();

            document.querySelector("html").setAttribute("style", "overflow: hidden");
        });

        return new PageHandler(page);
    };

    public async close() {
        await this.browser.close();
    }
}

export default new BrowserHandler();