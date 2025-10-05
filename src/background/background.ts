/**
 * Background Script Entry Point
 * 
 * This file serves as the main entry point for the browser extension's background script.
 * It only initializes services and sets up message listeners.
 * All business logic is handled by dedicated service classes.
 */

import { MessageService } from '../services/MessageService';
import { SwiperService } from '../services/SwiperService';
import { LoggerService } from '../services/LoggerService';
import { VENDORS } from '../dom/vendors';
import { MessageType } from '../types/common.types';

// Initialize logger for background script
const logger = LoggerService.getInstance('Background');

// Initialize services
const messageService = MessageService.getInstance();
const swiperService = SwiperService.getInstance();

// Register background listeners for swiper actions
messageService.registerBackgroundListeners(swiperService);

// Register additional background listeners
setupBackgroundListeners();

// Listen for tab updates to inject content script when needed
setupTabListeners();

// Setup direct chrome runtime message listener for popup communication
setupChromeRuntimeListener();

logger.info('Background script initialized successfully');

/**
 * Setup additional background script listeners
 */
function setupBackgroundListeners(): void {
  // Listen for SITE_DETECTED message from content scripts
  messageService.on(MessageType.SITE_DETECTED, (payload) => {
    logger.info('Site detected:', payload);
    
    if (payload?.siteId) {
      // Verify the site is supported
      const site = VENDORS.getSiteById(payload.siteId);
      if (site) {
        // Set active site in SwiperService
        swiperService.setActiveSite(payload.siteId);
        
        // Send SITE_READY message to popup
        messageService.send(MessageType.SITE_READY, {
          siteId: payload.siteId,
          siteLabel: site.label,
          timestamp: Date.now()
        }, 'popup');
        
        logger.info(`Site ready: ${site.label} (${payload.siteId})`);
      } else {
        logger.warn(`Unsupported site detected: ${payload.siteId}`);
      }
    }
  });

  // Listen for GET_STATUS message from popup
  messageService.on(MessageType.GET_STATUS, () => {
    logger.debug('Status requested by popup');
    
    messageService.send(MessageType.STATUS_UPDATE, {
      isRunning: swiperService.getIsRunning(),
      activeSite: swiperService.getActiveSiteId(),
      timestamp: Date.now()
    }, 'popup');
  });

  // Listen for TEST_INJECTION message from popup
  messageService.on('TEST_INJECTION', async () => {
    logger.info('Test injection requested by popup');
    
    try {
      // Get current active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tabs.length === 0) {
        logger.warn('No active tab found for test injection');
        return;
      }

      const activeTab = tabs[0];
      await tryInjectContentScript(activeTab);
      
    } catch (error) {
      logger.error('Failed to perform test injection:', error);
    }
  });
}

/**
 * Setup tab listeners for automatic content script injection
 */
function setupTabListeners(): void {
  // Listen for tab updates
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Only inject when page is completely loaded
    if (changeInfo.status === 'complete' && tab.url) {
      await tryInjectContentScript(tab);
    }
  });

  // Listen for tab activation
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      await tryInjectContentScript(tab);
    } catch (error) {
      logger.debug('Failed to get tab info:', error);
    }
  });
}

/**
 * Try to programmatically inject content script if needed
 */
async function tryInjectContentScript(tab: chrome.tabs.Tab): Promise<void> {
  try {
    const url = tab.url || '';
    const tabId = tab.id;
    
    if (!url || !tabId) {
      return;
    }
    
    logger.debug(`Checking tab: ${url}`);

    // Check if it's a supported dating site
    const isSupportedSite = url.includes('tinder.com') || 
                           url.includes('gotinder.com') || 
                           url.includes('badoo.com');

    if (!isSupportedSite) {
      logger.debug('Tab is not a supported dating site');
      return;
    }

    // Check if content script is already injected
    try {
      await chrome.tabs.sendMessage(tabId, { type: 'PING' });
      logger.debug('Content script already injected');
      return;
    } catch (error) {
      logger.debug('Content script not found, attempting injection');
    }

    // Inject content script programmatically
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['src/content-script.js']
    });

    logger.info(`Content script injected into ${url}`);

  } catch (error) {
    logger.error('Failed to inject content script:', error);
  }
}

/**
 * Setup direct chrome runtime message listener for popup communication
 */
function setupChromeRuntimeListener(): void {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    logger.debug('Background received message:', message);
    
    try {
      switch (message.type) {
        case 'GET_STATUS':
          logger.debug('GET_STATUS requested');
          const activeSiteId = swiperService.getActiveSiteId();
          const site = activeSiteId ? VENDORS.getSiteById(activeSiteId) : null;
          
          sendResponse({
            isRunning: swiperService.getIsRunning(),
            activeSite: activeSiteId,
            siteLabel: site?.label || '',
            timestamp: Date.now()
          });
          break;
          
          
        case 'START_SWIPE':
          logger.info('START_SWIPE requested:', message.payload);
          const siteId = message.payload?.siteId || swiperService.getActiveSiteId();
          swiperService.start(siteId);
          sendResponse({ success: true, message: 'Swipe started' });
          break;
          
        case 'STOP_SWIPE':
          logger.info('STOP_SWIPE requested');
          swiperService.stop();
          sendResponse({ success: true, message: 'Swipe stopped' });
          break;
          
        case 'SITE_DETECTED':
          logger.info('SITE_DETECTED requested:', message.payload);
          
          if (message.payload?.siteId) {
            // Verify the site is supported
            const site = VENDORS.getSiteById(message.payload.siteId);
            if (site) {
              // Set active site in SwiperService
              swiperService.setActiveSite(message.payload.siteId);
              
              // Send SITE_READY message to popup
              const siteReadyPayload = {
                siteId: message.payload.siteId,
                siteLabel: site.label,
                timestamp: Date.now()
              };
              
              logger.info(`Sending SITE_READY to popup:`, siteReadyPayload);
              messageService.send(MessageType.SITE_READY, siteReadyPayload, 'popup');
              
              logger.info(`Site ready: ${site.label} (${message.payload.siteId})`);
            } else {
              logger.warn(`Unsupported site detected: ${message.payload.siteId}`);
            }
          }
          
          sendResponse({ success: true, message: 'Site detection processed' });
          break;
          
        default:
          logger.warn('Unknown message type:', message.type);
          sendResponse({ success: false, message: 'Unknown message type' });
      }
    } catch (error) {
      logger.error('Error handling message:', error);
      sendResponse({ success: false, message: 'Error handling message' });
    }
    
    return true; // Keep message channel open for async response
  });
}

