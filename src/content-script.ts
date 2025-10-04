import browser from "webextension-polyfill";
import type { IMessage } from "@/types/common.types";
import { MessageType } from "@/types/common.types";
import AppLogger from "@/services/logger.service";

AppLogger.info("Content script loaded");

// Listen for messages from background script
browser.runtime.onMessage.addListener((message: IMessage, sender, sendResponse?: (response?: any) => void) => {
  AppLogger.debug("Content script received message", message);

  switch (message.type) {
    case MessageType.SWIPE_ACTION:
      handleSwipeAction(message.payload)
        .then(result => {
          if (sendResponse) {
            sendResponse(result);
          }
        })
        .catch(error => {
          if (sendResponse) {
            sendResponse({ success: false, error: (error as Error).message });
          }
        });
      return true; // Keep message channel open for async response

    default:
      AppLogger.warn("Unknown message type in content script", message.type);
      if (sendResponse) {
        sendResponse({ success: false, error: "Unknown message type" });
      }
  }
});

/**
 * Handle swipe action - this would contain the actual dating site logic
 */
async function handleSwipeAction(payload: any): Promise<any> {
  AppLogger.debug("Handling swipe action", payload);

  try {
    // Simulate finding swipe buttons (this would be actual DOM manipulation)
    const likeButton = document.querySelector('[data-testid="like-button"]') || 
                      document.querySelector('.like-button') ||
                      document.querySelector('button[aria-label*="like" i]');

    if (likeButton) {
      // Simulate clicking the button
      (likeButton as HTMLElement).click();
      
      AppLogger.info("Swipe action completed successfully");
      
      // Simulate checking if there are more profiles
      const hasMore = document.querySelector('[data-testid="profile-card"]') !== null;
      
      return {
        success: true,
        message: "Swipe action completed",
        hasMore: hasMore
      };
    } else {
      AppLogger.warn("No like button found");
      return {
        success: false,
        message: "No like button found on page",
        hasMore: false
      };
    }
  } catch (error) {
    AppLogger.error("Error in swipe action", error);
    return {
      success: false,
      message: (error as Error).message,
      hasMore: false
    };
  }
}
