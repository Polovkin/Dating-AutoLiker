import { LoggerService } from './LoggerService';
import { MessageService } from './MessageService';
import { SchedulerService } from './SchedulerService';
import { SwipeActionService } from './SwipeActionService';
import { VENDORS } from '../dom/vendors';
import { MessageType } from '../types/common.types';

/**
 * Swipe action types
 */
export type SwipeAction = 'like' | 'dislike';

/**
 * SwiperService - Handles swipe actions on dating apps
 * Currently provides basic logging, will be extended with DOM manipulation
 */
export class SwiperService {
  private static instance: SwiperService;
  private readonly logger: LoggerService;
  private readonly messageService: MessageService;
  private readonly schedulerService: SchedulerService;
  private readonly swipeActionService: SwipeActionService;
  private isRunning: boolean = false;
  private activeSiteId: string | null = null;
  private swipeTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    this.logger = LoggerService.getInstance('SwiperService');
    this.messageService = MessageService.getInstance();
    this.schedulerService = SchedulerService.getInstance();
    this.swipeActionService = SwipeActionService.getInstance();
  }

  /**
   * Get singleton instance of SwiperService
   */
  public static getInstance(): SwiperService {
    if (!SwiperService.instance) {
      SwiperService.instance = new SwiperService();
    }
    return SwiperService.instance;
  }

  /**
   * Start the swiper service with active site
   * @param siteId - The ID of the active dating site
   */
  public start(siteId?: string): void {
    this.logger.info(`🚀 SwiperService.start() called with siteId: ${siteId || 'undefined'}`);
    
    if (this.isRunning) {
      this.logger.warn('⚠️ SwiperService is already running, ignoring start request');
      return;
    }

    // Set active site if provided
    if (siteId) {
      this.activeSiteId = siteId;
      this.logger.info(`✅ Active site set to: ${siteId}`);
    } else if (!this.activeSiteId) {
      this.logger.error('❌ No active site set and no siteId provided');
      return;
    }

    this.isRunning = true;
    this.logger.info(`🎯 SwiperService started for ${this.activeSiteId}`);
    
    // Send status update message to popup
    this.logger.debug('📤 Sending STATUS_UPDATE message to popup');
    this.messageService.send(MessageType.STATUS_UPDATE, {
      isRunning: this.isRunning,
      activeSite: this.activeSiteId,
      timestamp: Date.now()
    }, 'popup');


    // Start the swipe loop
    this.logger.info('🔄 Starting swipe loop');
    this.startSwipeLoop();
  }

  /**
   * Stop the swiper service
   */
  public stop(): void {
    if (!this.isRunning) {
      this.logger.warn('SwiperService is not running');
      return;
    }

    this.isRunning = false;
    
    // Clear any pending swipe timeout
    if (this.swipeTimeout) {
      clearTimeout(this.swipeTimeout);
      this.swipeTimeout = null;
    }

    this.logger.info(`SwiperService stopped (was running on ${this.activeSiteId})`);
    
    // Send status update message to popup
    this.logger.debug('📤 Sending STATUS_UPDATE message to popup');
    this.messageService.send(MessageType.STATUS_UPDATE, {
      isRunning: this.isRunning,
      activeSite: this.activeSiteId,
      timestamp: Date.now()
    }, 'popup');

  }

  /**
   * Perform swipe action (like or dislike)
   * @param action - Type of swipe action to perform
   */
  public async swipe(action: SwipeAction): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn('SwiperService is not running, cannot perform swipe action');
      return;
    }

    if (!this.activeSiteId) {
      this.logger.warn('No active site set, cannot perform swipe action');
      return;
    }

    this.logger.info(`Performing swipe action: ${action} on ${this.activeSiteId}`);
    
    try {
      // Use SwipeActionService to perform the actual swipe
      const result = await this.swipeActionService.handleSwipeAction({
        action,
        siteId: this.activeSiteId,
        timestamp: Date.now()
      });

      if (result.success) {
        this.logger.info(`✅ Swipe action completed: ${action}`);
        
        // Send success message
        this.messageService.send(MessageType.ACTION_RESULT, {
          action,
          siteId: this.activeSiteId,
          timestamp: Date.now(),
          success: true,
          hasMore: result.hasMore
        });
      } else {
        this.logger.warn(`❌ Swipe action failed: ${result.message}`);
        
        // Send error message
        this.messageService.send(MessageType.ACTION_RESULT, {
          action,
          siteId: this.activeSiteId,
          timestamp: Date.now(),
          success: false,
          error: result.message
        });
      }

    } catch (error) {
      this.logger.error(`Failed to perform swipe action ${action}:`, error);
      
      // Send error message
      this.messageService.send(MessageType.ACTION_RESULT, {
        action,
        siteId: this.activeSiteId,
        timestamp: Date.now(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get current running status
   * @returns true if service is running
   */
  public getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get current active site ID
   * @returns active site ID or null
   */
  public getActiveSiteId(): string | null {
    return this.activeSiteId;
  }

  /**
   * Set active site ID
   * @param siteId - The ID of the dating site to set as active
   */
  public setActiveSite(siteId: string): void {
    this.activeSiteId = siteId;
    this.logger.info(`Active site set to: ${siteId}`);
  }

  /**
   * Start the swipe loop
   * Continuously sends swipe actions with random delays
   */
  private startSwipeLoop(): void {
    this.logger.info(`🔄 startSwipeLoop() called - isRunning: ${this.isRunning}, activeSiteId: ${this.activeSiteId}`);
    
    if (!this.isRunning || !this.activeSiteId) {
      this.logger.warn('⚠️ Cannot start swipe loop - service not running or no active site');
      return;
    }

    this.logger.info('✅ Starting swipe loop - calling performSwipeCycle()');
    this.performSwipeCycle();
  }

  /**
   * Perform one swipe cycle (swipe + delay)
   */
  private async performSwipeCycle(): Promise<void> {
    if (!this.isRunning || !this.activeSiteId) {
      this.logger.debug('Swipe cycle skipped - service not running or no active site');
      return;
    }

    this.logger.info(`🔄 Starting swipe cycle for ${this.activeSiteId}`);

    try {
      // Perform the actual swipe action
      this.logger.info(`🎯 Performing swipe action for ${this.activeSiteId}`);
      await this.swipe('like');
      this.logger.debug('✅ Swipe action completed');

      // Wait for random delay before next swipe
      this.logger.debug('⏳ Waiting for random delay before next swipe cycle');
      await this.schedulerService.randomDelay();
      this.logger.debug('✅ Random delay completed');
      
      // Schedule next swipe cycle if still running
      if (this.isRunning) {
        this.logger.debug('🔄 Scheduling next swipe cycle');
        this.swipeTimeout = setTimeout(() => {
          this.performSwipeCycle();
        }, 100); // Small delay to prevent blocking
        this.logger.debug('✅ Next swipe cycle scheduled');
      } else {
        this.logger.info('⏹️ Service stopped, not scheduling next cycle');
      }

    } catch (error) {
      this.logger.error('❌ Error in swipe cycle:', error);
      
      // Wait longer on error before retrying
      this.logger.debug('⏳ Waiting for exponential backoff after error');
      await this.schedulerService.exponentialBackoff(0);
      this.logger.debug('✅ Exponential backoff completed');
      
      if (this.isRunning) {
        this.logger.info('🔄 Retrying swipe cycle after error');
        this.performSwipeCycle();
      }
    }
  }

  /**
   * Handle action result from content script
   * @param result - Result of the swipe action
   */
  public handleActionResult(result: { success: boolean; error?: string }): void {
    if (!this.isRunning) {
      return;
    }

    if (result.success) {
      this.logger.debug('Swipe action completed successfully');
    } else {
      this.logger.warn(`Swipe action failed: ${result.error || 'Unknown error'}`);
    }
  }


  /**
   * Check if current page supports swiping
   * @returns true if swiping is supported on current page
   */
  public isSwipeSupported(): boolean {
    // TODO: Implement page detection logic
    // - Check if we're on a supported dating app
    // - Verify swipe elements are present
    // - Return appropriate boolean
    
    this.logger.debug('Checking if swipe is supported on current page');
    return false; // Placeholder
  }

  /**
   * Get available swipe actions for current page
   * @returns array of available actions
   */
  public getAvailableActions(): SwipeAction[] {
    // TODO: Implement logic to detect available actions
    // - Check which buttons/elements are present
    // - Return array of available actions
    
    this.logger.debug('Getting available swipe actions');
    return ['like', 'dislike']; // Placeholder
  }
}
