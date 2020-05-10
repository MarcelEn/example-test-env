import browserHandler from "./BrowserHandler";
import { readFileSync } from "fs";
import { resolve } from "path";

beforeAll(async (done) => {
    await browserHandler.init();
    done();
});

afterAll(async (done) => {
    await browserHandler.close();
    done();
});

export default (describer: string, itter: string) => async (done: () => void) => {
    const data = readFileSync(resolve("__test__", "components", describer, itter, "data.xml")).toString()
    const pageHandler = await browserHandler.createPageHandler(data);

    try {
        await pageHandler.matchSnapshot();
        await pageHandler.matchImage();

        await (await import(`./components/${describer}/${itter}/process`)
            .catch((notFound) => ({ default: async () => { } }))
        ).default(pageHandler);

    } finally {
        await pageHandler.close();
        done();
    }
}