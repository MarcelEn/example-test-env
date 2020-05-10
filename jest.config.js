const { resolve } = require("path");
const fs = require("fs");

const dynamicPath = resolve("__test__", "dynamic");

if (fs.existsSync(dynamicPath)) {
    fs.readdirSync(dynamicPath, {
        withFileTypes: true,
    }).forEach((file) => {
        if (file.isFile()) {
            fs.unlinkSync(resolve(dynamicPath, file.name));
        }
    });
}

const componentPath = resolve("__test__", "components");

const testSuites = {};

fs.readdirSync(componentPath)
    .map(describer => ({
        describer,
        itters: fs.readdirSync(resolve(componentPath, describer)),
    }))
    .map(({ describer, itters }) => {
        testSuites[describer] = {};
        itters.forEach(itter => {
            testSuites[describer][itter] = {
                data: fs.readFileSync(resolve(componentPath, describer, itter, "data.xml")).toString(),
                additionalProcess: fs.existsSync(resolve(componentPath, describer, itter, "process.ts")) ?
                    `../components/${describer}/${itter}/process`
                    :
                    null
            };
        });
    });

Object.keys(testSuites).forEach((describer) => {
    const targetFile = resolve(dynamicPath, `${describer}.spec.ts`);
    fs.writeFileSync(targetFile, `import browserHandler from "../BrowserHandler";

describe("${describer}", () => {${
        Object.keys(testSuites[describer]).map(itter => {
            return `
    it("${itter}", async (done) => {
        const { data, additionalProcess } = ${JSON.stringify(testSuites[describer][itter])};
        
        await browserHandler.init();
        const pageHandler = await browserHandler.createPageHandler(data);
        try {
            await pageHandler.matchSnapshot();
            await pageHandler.matchImage();

            if (!!additionalProcess) {
                await (await import(additionalProcess)).default(pageHandler);
            }
        } finally {
            await pageHandler.close();
            done();
        }
    });`
        })
            .join("\n")
        }
});`);
});

module.exports = {}