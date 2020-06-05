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

const resolveAssets = (data: string, describer: string, itter: string) => {
    return data.replace(new RegExp(/\[\[asset:.+?(?=\]\])\]\]/gm), (hit) => {
        const asset = hit.slice(8, hit.length - 2);
        return `http://localhost:3000/api/assets/${describer}/${itter}/${asset}`;
    })
}


export default (describer: string, itter: string) => async (done: () => void) => {
    const data = readFileSync(resolve("src", "__test__", "components", describer, itter, "data.xml")).toString();
    const pageHandler = await browserHandler.createPageHandler(resolveAssets(data, describer, itter));

    const dynamicProcess = async (key: string) => (await import(`./components/${describer}/${itter}/${key}`)
        .catch((notFound) => ({ default: async () => { } }))
    ).default(pageHandler)

    try {
        await dynamicProcess("before");
        await pageHandler.matchSnapshot();
        await pageHandler.matchImage();
        await dynamicProcess("process");
    } finally {
        await pageHandler.close();
        done();
    }
}