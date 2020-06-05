import { PageHandler } from "../../../BrowserHandler";

export default async (pageHandler: PageHandler) => {
    await pageHandler.page.evaluate(() => {
        document.querySelectorAll("[data-form-element = 'form-label']").forEach(e => e.remove());
    })
}