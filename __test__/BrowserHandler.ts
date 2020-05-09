import puppeteer, { Browser, Page } from "puppeteer";

const target = "http://localhost:3000";

export class PageHandler {
    constructor(public page: Page) { }

    public matchImage = async () => {
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
            const height = await this.page.$eval(".content", (e) => (e as any).offsetHeight);

            await this.page.setViewport(
                {
                    ...this.page.viewport(),
                    height,
                }
            );

            await this.page.evaluate(() => {
                document.querySelector(".content").scrollIntoView();
            });

            (expect(await this.page.screenshot()) as any)
                .toMatchImageSnapshot({
                    customSnapshotIdentifier: ({ defaultIdentifier }) => {
                        return `${defaultIdentifier.slice(13, defaultIdentifier.length)}-${device}`
                    }
                });
        }
    }

    public matchSnapshot = async () => {
        let snapshot = await this.page.$eval(".content", ({ innerHTML }) => innerHTML)
            .catch(e => "");

        expect(snapshot).toMatchSnapshot();
    }

    public close = async () => {
        await this.page.close();
    }
}

export default class BrowserHandler {
    private browser: Browser;

    public init = async () => {
        if (!!this.browser) return;
        this.browser = await puppeteer.launch({
            // headless: false,
            // slowMo: 100,
        });
    }

    public createPageHandler = async (data: string) => {
        const page = await this.browser.newPage();

        await page.goto(target);
        await page.evaluate((innerHTML) => {
            document.querySelector("textarea").innerHTML = innerHTML;
            document.querySelector("form").submit();
        }, data);

        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        return new PageHandler(page);
    };

    public close = async () => {
        await Promise.all((await this.browser.pages()).map(page => page.close()));
        await this.browser.close();
    }
}