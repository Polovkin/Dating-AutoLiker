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
}
