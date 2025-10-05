import browser from "webextension-polyfill";
import type { IMessage } from "@/types/common.types";
import { MessageType } from "@/types/common.types";
import { LoggerService } from "@/services";
import { VENDORS } from "@/dom/vendors";

const logger = LoggerService.getInstance('ContentScript');
logger.info("Content script loaded");

// Detect current site and notify background
detectAndNotifySite();

/**
 * Detect current dating site and notify background script
 */
function detectAndNotifySite(): void {
  const hostname = window.location.hostname.toLowerCase();
  logger.debug(`Detecting site for hostname: ${hostname}`);

  // Check all registered sites
  const allSites = VENDORS.getAllSites();
  
  for (const site of allSites) {
    if (site.isCurrentSite && site.isCurrentSite()) {
      logger.info(`Detected site: ${site.label} (${site.id})`);
      
      // Send SITE_DETECTED message to background
      browser.runtime.sendMessage({
        type: MessageType.SITE_DETECTED,
        target: 'background',
        payload: { siteId: site.id }
      });
      return;
    }
  }

  logger.debug('No supported dating site detected');
}

// Listen for messages from background script
browser.runtime.onMessage.addListener((message: IMessage, sender, sendResponse?: (response?: any) => void) => {
  logger.debug("Content script received message", message);

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
      logger.warn("Unknown message type in content script", message.type);
      if (sendResponse) {
        sendResponse({ success: false, error: "Unknown message type" });
      }
  }
});

/**
 * Handle swipe action using the appropriate dating site implementation
 */
async function handleSwipeAction(payload: any): Promise<any> {
  logger.debug("Handling swipe action", payload);

  try {
    const { action, siteId } = payload;
    
    if (!action || !siteId) {
      throw new Error("Missing action or siteId in payload");
    }

    // Get the appropriate site implementation
    const site = VENDORS.getSiteById(siteId);
    if (!site) {
      throw new Error(`Site not found: ${siteId}`);
    }

    logger.info(`Performing ${action} action on ${site.label}`);

    // Perform the swipe action using the site implementation
    const success = site.swipe(action);
    
    if (success) {
      logger.info(`Swipe action completed successfully on ${site.label}`);
      
      // Check if there are more profiles available
      const hasMore = site.getCurrentProfileCard() !== null;
      
      return {
        success: true,
        action,
        siteId,
        message: `Swipe action completed on ${site.label}`,
        hasMore
      };
    } else {
      logger.warn(`Swipe action failed on ${site.label}`);
      return {
        success: false,
        action,
        siteId,
        message: `Swipe action failed on ${site.label}`,
        hasMore: false
      };
    }

  } catch (error) {
    logger.error("Error in swipe action", error);
    return {
      success: false,
      action: payload?.action,
      siteId: payload?.siteId,
      message: (error as Error).message,
      hasMore: false
    };
  }
}
