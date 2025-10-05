import { LoggerService } from './LoggerService';
import { MessageService } from './MessageService';
import { SiteDetectionService } from './SiteDetectionService';
import { SwipeActionService } from './SwipeActionService';
import { MessageType } from '../types/common.types';
import type { IMessage } from '../types/common.types';

/**
 * ContentScriptService - Main service for content script functionality
 */
export class ContentScriptService {
  private static instance: ContentScriptService;
  private readonly logger: LoggerService;
  private readonly messageService: MessageService;
  private readonly siteDetectionService: SiteDetectionService;
  private readonly swipeActionService: SwipeActionService;

  private constructor() {
    this.logger = LoggerService.getInstance('ContentScriptService');
    this.messageService = MessageService.getInstance();
    this.siteDetectionService = SiteDetectionService.getInstance();
    this.swipeActionService = SwipeActionService.getInstance();
  }

  /**
   * Get singleton instance of ContentScriptService
   */
  public static getInstance(): ContentScriptService {
    if (!ContentScriptService.instance) {
      ContentScriptService.instance = new ContentScriptService();
    }
    return ContentScriptService.instance;
  }

  /**
   * Initialize content script
   */
  public initialize(): void {
    this.logger.info("Content script initialized");
    this.logger.info(`Current URL: ${window.location.href}`);
    this.logger.info(`Current hostname: ${window.location.hostname}`);

    // Test browser runtime availability
    this.logger.info(`Browser runtime available: ${!!(window as any).chrome?.runtime}`);

    // Detect current site and notify background
    this.siteDetectionService.detectAndNotifySite();

    // Setup message listener
    this.setupMessageListener();
  }

  /**
   * Setup message listener for background script communication
   */
  private setupMessageListener(): void {
    if (typeof window !== 'undefined' && (window as any).chrome?.runtime?.onMessage) {
      (window as any).chrome.runtime.onMessage.addListener(
        (message: IMessage, sender: any, sendResponse?: (response?: any) => void) => {
          this.logger.debug("Content script received message", message);

          switch (message.type) {
            case MessageType.SWIPE_ACTION:
              this.handleSwipeAction(message.payload, sendResponse);
              return true; // Keep message channel open for async response

            default:
              this.logger.warn("Unknown message type in content script", message.type);
              if (sendResponse) {
                sendResponse({ success: false, error: "Unknown message type" });
              }
          }
        }
      );
    }
  }

  /**
   * Handle swipe action message
   */
  private async handleSwipeAction(
    payload: any, 
    sendResponse?: (response?: any) => void
  ): Promise<void> {
    try {
      const result = await this.swipeActionService.handleSwipeAction(payload);
      
      if (sendResponse) {
        sendResponse(result);
      }
    } catch (error) {
      this.logger.error("Error handling swipe action:", error);
      
      if (sendResponse) {
        sendResponse({ 
          success: false, 
          error: (error as Error).message 
        });
      }
    }
  }
}
