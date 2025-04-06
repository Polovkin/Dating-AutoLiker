import LoggerService from "./services/logger.service";
import browser from "webextension-polyfill";

LoggerService.info("🧠 Background script loaded!");

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "CLICK_BUTTON") {
        LoggerService.info("📥 Received CLICK_BUTTON message in background");
    }

    sendResponse();
});
