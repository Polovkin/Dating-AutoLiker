import browser from "webextension-polyfill";
import type { IMessage, MessageType, MessageTarget } from "@/types/common.types";
import { MessageType as MessageTypeEnum, MessageTarget as MessageTargetEnum } from "@/types/common.types";
import AppLogger from "../logger.service";

class MessageBrokerService {
  private logger = AppLogger;

  /**
   * Send message to content script
   */
  async sendToContentScript(type: MessageType, payload?: any): Promise<any> {
    try {
      const message: IMessage = {
        type,
        target: MessageTargetEnum.CONTENT_SCRIPT,
        payload
      };

      this.logger.debug('Sending message to content script', { type, payload });

      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.id) {
        const response = await browser.tabs.sendMessage(tabs[0].id, message);
        this.logger.debug('Received response from content script', response);
        return response;
      }
    } catch (error) {
      this.logger.error('Failed to send message to content script', error);
      throw error;
    }
  }

  /**
   * Send message to popup
   */
  async sendToPopup(type: MessageType, payload?: any): Promise<void> {
    try {
      const message: IMessage = {
        type,
        target: MessageTargetEnum.POPUP,
        payload
      };

      this.logger.debug('Sending message to popup', { type, payload });
      await browser.runtime.sendMessage(message);
    } catch (error) {
      this.logger.error('Failed to send message to popup', error);
    }
  }

  /**
   * Listen for messages from popup and content script
   */
  setupMessageListener(handler: (message: IMessage, sender: any) => void): void {
    browser.runtime.onMessage.addListener((message: IMessage, sender, sendResponse?: (response?: any) => void) => {
      this.logger.debug('Received message', { message, sender });

      try {
        handler(message, sender);
        if (sendResponse) {
          sendResponse({ success: true });
        }
      } catch (error) {
        this.logger.error('Error handling message', error);
        if (sendResponse) {
          sendResponse({ success: false, error: (error as Error).message });
        }
      }

      return true; // Keep message channel open for async response
    });
  }

  /**
   * Get current active tab
   */
  async getCurrentTab(): Promise<browser.Tabs.Tab | null> {
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      return tabs[0] || null;
    } catch (error) {
      this.logger.error('Failed to get current tab', error);
      return null;
    }
  }
}

export default new MessageBrokerService();
