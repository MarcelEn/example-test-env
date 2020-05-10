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

const componentPath = ["__test__", "components"];

const testSuites = fs.readdirSync(resolve(...componentPath))
    .map(describer => ({
        [describer]: fs.readdirSync(resolve(...componentPath, describer)),
    }))
    .reduce((all = {}, current) => ({ ...all, ...current }));

Object.entries(testSuites).forEach(([describer, itters]) => {
    const targetFile = resolve(dynamicPath, `${describer}.spec.ts`);
    fs.writeFileSync(targetFile, `import p from "../performTest";

describe("${describer}", () => {
    ${
        itters.map(itter => `it("${itter}", p("${describer}","${itter}"));`).join("\n    ")}
});`);
});

module.exports = {}