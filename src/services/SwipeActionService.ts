import { LoggerService } from './LoggerService';
import { VENDORS } from '../dom/vendors';

/**
 * Swipe action payload interface
 */
export interface SwipeActionPayload {
  action: 'like' | 'dislike';
  siteId: string;
  timestamp?: number;
}

/**
 * Swipe action result interface
 */
export interface SwipeActionResult {
  success: boolean;
  action?: string;
  siteId?: string;
  message: string;
  hasMore: boolean;
}

/**
 * SwipeActionService - Handles swipe actions on dating sites
 */
export class SwipeActionService {
  private static instance: SwipeActionService;
  private readonly logger: LoggerService;

  private constructor() {
    this.logger = LoggerService.getInstance('SwipeActionService');
  }

  /**
   * Get singleton instance of SwipeActionService
   */
  public static getInstance(): SwipeActionService {
    if (!SwipeActionService.instance) {
      SwipeActionService.instance = new SwipeActionService();
    }
    return SwipeActionService.instance;
  }

  /**
   * Handle swipe action using the appropriate dating site implementation
   */
  public async handleSwipeAction(payload: SwipeActionPayload): Promise<SwipeActionResult> {
    this.logger.info("🎯 SwipeActionService received SWIPE_ACTION");
    this.logger.debug("📋 Payload:", payload);

    try {
      const { action, siteId } = payload;
      
      if (!action || !siteId) {
        const errorMsg = "Missing action or siteId in payload";
        this.logger.error(`❌ ${errorMsg}`);
        return this.createErrorResult(payload, errorMsg);
      }

      this.logger.info(`🔍 Looking for site implementation: ${siteId}`);

      // Get the appropriate site implementation
      const site = VENDORS.getSiteById(siteId);
      if (!site) {
        const errorMsg = `Site not found: ${siteId}`;
        this.logger.error(`❌ ${errorMsg}`);
        return this.createErrorResult(payload, errorMsg);
      }

      this.logger.info(`✅ Found site implementation: ${site.label} (${siteId})`);
      this.logger.info(`🎯 Calling site.swipe(${action}) on ${site.label}`);

      // Perform the swipe action using the site implementation
      const success = site.swipe(action);
      
      if (success) {
        this.logger.info(`✅ Swipe action completed successfully on ${site.label}`);
        
        // Check if there are more profiles available
        const hasMore = site.getCurrentProfileCard() !== null;
        this.logger.debug(`🔍 More profiles available: ${hasMore}`);
        
        const result = {
          success: true,
          action,
          siteId,
          message: `Swipe action completed on ${site.label}`,
          hasMore
        };
        
        this.logger.info("📤 Returning success result:", result);
        return result;
      } else {
        this.logger.warn(`❌ Swipe action failed on ${site.label}`);
        return this.createErrorResult(payload, `Swipe action failed on ${site.label}`);
      }

    } catch (error) {
      this.logger.error("❌ Error in swipe action:", error);
      return this.createErrorResult(payload, (error as Error).message);
    }
  }

  /**
   * Create error result
   */
  private createErrorResult(payload: SwipeActionPayload, message: string): SwipeActionResult {
    return {
      success: false,
      action: payload?.action,
      siteId: payload?.siteId,
      message,
      hasMore: false
    };
  }
}
