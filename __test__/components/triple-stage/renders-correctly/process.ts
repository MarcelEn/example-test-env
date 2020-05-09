import { PageHandler } from "../../../BrowserHandler";

export default async (pageHandler: PageHandler) => {
    await pageHandler.page.evaluate(() => {
        document.querySelector("h1").innerHTML = "nope";
    });
    await pageHandler.matchSnapshot();
}