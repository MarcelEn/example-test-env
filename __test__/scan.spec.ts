import fs from "fs";
import BrowserHandler from "./BrowserHandler";
import { toMatchImageSnapshot } from "jest-image-snapshot";

expect.extend({ toMatchImageSnapshot });

const componentPath = "__test__/components";

interface TestSuite {
    [describer: string]: {
        [itter: string]: {
            data: string;
            additionalProcess?: string;
        }
    }
}

const testSuite: TestSuite = {};

fs.readdirSync(componentPath)
    .map(describer => ({
        describer,
        itters: fs.readdirSync(`${componentPath}/${describer}`),
    }))
    .map(({ describer, itters }) => {
        testSuite[describer] = {};
        itters.forEach(itter => {
            testSuite[describer][itter] = {
                data: fs.readFileSync(`${componentPath}/${describer}/${itter}/data.xml`).toString(),
                additionalProcess: fs.existsSync(`${componentPath}/${describer}/${itter}/process.ts`) ?
                    `./components/${describer}/${itter}/process.ts`
                    :
                    undefined
            };
        });
    })


jest.setTimeout(30000);

let browserHandler: BrowserHandler = new BrowserHandler();

const testSuiteCount = Object.entries(testSuite).map(([_, entry]) => entry).map(obj => Object.keys(obj)).reduce((p = [], c) => [...p, ...c]).length;
let testSuitesDone = 0;

const checkBrowserClose = async () => {
    if (testSuitesDone >= testSuiteCount) {
        await browserHandler.close();
    }
}

Object.keys(testSuite).forEach(describer => {
    describe(describer, () => {
        Object.keys(testSuite[describer]).forEach(itter => {
            const { data, additionalProcess } = testSuite[describer][itter];
            it(itter, async (done) => {
                try {
                    await browserHandler.init();
                    const pageHandler = await browserHandler.createPageHandler(data);
                    await pageHandler.matchSnapshot();
                    await pageHandler.matchImage();

                    if (!!additionalProcess) {
                        await (await import(additionalProcess)).default(pageHandler);
                    }
                    done();
                } finally {
                    testSuitesDone++;
                    await checkBrowserClose();
                }
            });
        });
    });
});