import browserHandler from "./BrowserHandler";
import { readFileSync } from "fs";
import { resolve } from "path";

export default (describer: string, itter: string) => async (done: () => void) => {
    await browserHandler.init();
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