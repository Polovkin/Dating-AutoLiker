import { LoggerService } from './LoggerService';
import { MessageService } from './MessageService';
import { SchedulerService } from './SchedulerService';
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
  private isRunning: boolean = false;
  private activeSiteId: string | null = null;
  private swipeTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    this.logger = LoggerService.getInstance('SwiperService');
    this.messageService = MessageService.getInstance();
    this.schedulerService = SchedulerService.getInstance();
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
    if (this.isRunning) {
      this.logger.warn('SwiperService is already running');
      return;
    }

    // Set active site if provided
    if (siteId) {
      this.activeSiteId = siteId;
      this.logger.info(`Starting SwiperService for site: ${siteId}`);
    } else if (!this.activeSiteId) {
      this.logger.error('No active site set and no siteId provided');
      return;
    }

    this.isRunning = true;
    this.logger.info(`SwiperService started for ${this.activeSiteId}`);
    
    // Send status update message
    this.messageService.send(MessageType.STATUS_UPDATE, {
      isRunning: this.isRunning,
      activeSite: this.activeSiteId,
      timestamp: Date.now()
    });

    // Start the swipe loop
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
    
    // Send status update message
    this.messageService.send(MessageType.STATUS_UPDATE, {
      isRunning: this.isRunning,
      activeSite: this.activeSiteId,
      timestamp: Date.now()
    });
  }

  /**
   * Perform swipe action (like or dislike)
   * @param action - Type of swipe action to perform
   */
  public swipe(action: SwipeAction): void {
    if (!this.isRunning) {
      this.logger.warn('SwiperService is not running, cannot perform swipe action');
      return;
    }

    this.logger.info(`Performing swipe action: ${action}`);
    
    try {
      // TODO: Implement actual DOM manipulation for swipe actions
      // This will include:
      // - Finding swipe buttons/elements
      // - Simulating click or swipe gestures
      // - Handling different dating app layouts
      
      switch (action) {
        case 'like':
          this.performLikeAction();
          break;
        case 'dislike':
          this.performDislikeAction();
          break;
        default:
          this.logger.warn(`Unknown swipe action: ${action}`);
          return;
      }

      // Send message about the performed action
      this.messageService.send(MessageType.SWIPE_ACTION, {
        action,
        timestamp: Date.now(),
        success: true
      });

    } catch (error) {
      this.logger.error(`Failed to perform swipe action ${action}:`, error);
      
      // Send error message
      this.messageService.send(MessageType.SWIPE_ACTION, {
        action,
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
    if (!this.isRunning || !this.activeSiteId) {
      return;
    }

    this.logger.debug('Starting swipe loop');
    this.performSwipeCycle();
  }

  /**
   * Perform one swipe cycle (swipe + delay)
   */
  private async performSwipeCycle(): Promise<void> {
    if (!this.isRunning || !this.activeSiteId) {
      return;
    }

    try {
      // Send swipe action to content script
      this.logger.debug(`Sending swipe action for ${this.activeSiteId}`);
      this.messageService.send(MessageType.SWIPE_ACTION, {
        action: 'like',
        siteId: this.activeSiteId,
        timestamp: Date.now()
      });

      // Wait for random delay before next swipe
      await this.schedulerService.randomDelay();
      
      // Schedule next swipe cycle if still running
      if (this.isRunning) {
        this.swipeTimeout = setTimeout(() => {
          this.performSwipeCycle();
        }, 100); // Small delay to prevent blocking
      }

    } catch (error) {
      this.logger.error('Error in swipe cycle:', error);
      
      // Wait longer on error before retrying
      await this.schedulerService.exponentialBackoff(0);
      
      if (this.isRunning) {
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
   * Perform like action
   * Currently just logs the action
   */
  private performLikeAction(): void {
    this.logger.info('Like action performed');
    
    // TODO: Implement actual like functionality
    // - Find like button (heart, swipe right, etc.)
    // - Click or simulate swipe right gesture
    // - Handle success/failure states
  }

  /**
   * Perform dislike action
   * Currently just logs the action
   */
  private performDislikeAction(): void {
    this.logger.info('Dislike action performed');
    
    // TODO: Implement actual dislike functionality
    // - Find dislike button (X, swipe left, etc.)
    // - Click or simulate swipe left gesture
    // - Handle success/failure states
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
