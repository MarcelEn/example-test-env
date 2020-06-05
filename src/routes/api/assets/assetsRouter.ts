import { Router } from "express";
import { resolve } from "path";
import { existsSync } from "fs";
import { Request } from "express";

const assetsRouter = Router();

const createAssetPath = (params: Request["params"]) => {
    const assetPath = ["src", "__test__", "components"];
    const assetDescription = Object.entries(params).map(entry => entry[1].replace("..", "")) as string[];
    return resolve(...assetPath, ...assetDescription);
}

const createDefaultAssetPath = (asset: string) => resolve("defaultAssets", asset.replace("..", ""));

assetsRouter.get("/:describer/:itter/:asset", ({ params }, res) => {
    try {
        const assetPath = createAssetPath(params);
        const defaultAssetPath = createDefaultAssetPath(params.asset);

        if (existsSync(assetPath)) {
            res.sendFile(assetPath);
        } else if (existsSync(defaultAssetPath)) {
            res.sendFile(defaultAssetPath);
        } else {
            res.sendStatus(404);
        }
    } catch (ignore) {
        res.sendStatus(404);
    }
});

export default assetsRouter;