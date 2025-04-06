import browser from "webextension-polyfill";
import LoggerService from "../services/logger.service";


export async function executeInActiveTab<T>(fn: () => T): Promise<T | null> {
    try {
        const [tab] = await browser.tabs.query({active: true, currentWindow: true});

        if (!tab?.id) {
            LoggerService.error("❌ No active tab found");
            return null;
        }

        const [{result}] = await browser.scripting.executeScript({
            target: {tabId: tab.id},
            func: fn,
        });

        return result;
    } catch (e) {
        LoggerService.error(`❌ Failed to execute script in tab: ${e}`);
        return null;
    }
}
