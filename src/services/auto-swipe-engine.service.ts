import MessageBrokerService from "./messages/message-broker.service";
import SettingsService from "./settings.service";
import AppLogger from "./logger.service";
import type { ActionResultPayload } from "@/types/common.types";
import { MessageType } from "@/types/common.types";

class AutoSwipeEngine {
  private messageBroker = MessageBrokerService;
  private settings = SettingsService;
  private logger = AppLogger;

  private isRunning = false;
  private currentInterval: NodeJS.Timeout | null = null;
  private totalActions = 0;
  private currentSite: string | null = null;

  /**
   * Start the auto swipe engine
   */
  async start(site?: string): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Engine is already running');
      return;
    }

    if (!this.settings.isEnabled()) {
      this.logger.warn('App is disabled, cannot start engine');
      return;
    }

    this.isRunning = true;
    this.totalActions = 0;
    this.currentSite = site || this.settings.getSelectedSite();

    this.logger.info('Starting auto swipe engine', {
      site: this.currentSite,
      interval: this.settings.getInterval()
    });

    // Send status update to popup
    await this.sendStatusUpdate();

    // Start the swipe loop
    this.startSwipeLoop();
  }

  /**
   * Stop the auto swipe engine
   */
  async stop(reason?: string): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn('Engine is not running');
      return;
    }

    this.isRunning = false;

    if (this.currentInterval) {
      clearTimeout(this.currentInterval);
      this.currentInterval = null;
    }

    this.logger.info('Stopped auto swipe engine', {
      reason,
      totalActions: this.totalActions,
      site: this.currentSite
    });

    // Send status update to popup
    await this.sendStatusUpdate();
  }

  /**
   * Check if engine is running
   */
  isEngineRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentSite: this.currentSite,
      totalActions: this.totalActions,
      interval: this.settings.getInterval()
    };
  }

  /**
   * Start the main swipe loop
   */
  private async startSwipeLoop(): Promise<void> {
    if (!this.isRunning) return;

    try {
      // Send swipe action to content script
      const result = await this.messageBroker.sendToContentScript(MessageType.SWIPE_ACTION, {
        action: 'like'
      });

      if (result && result.success) {
        this.totalActions++;
        this.logger.debug('Swipe action completed', {
          totalActions: this.totalActions,
          result
        });
      } else {
        this.logger.warn('Swipe action failed', result);
      }

      // Send status update
      await this.sendStatusUpdate();

    } catch (error) {
      this.logger.error('Error in swipe loop', error);

      // If we can't communicate with content script, stop the engine
      await this.stop('Content script communication error');
      return;
    }

    // Schedule next swipe
    if (this.isRunning) {
      const interval = this.settings.getInterval();
      this.currentInterval = setTimeout(() => {
        this.startSwipeLoop();
      }, interval);
    }
  }

  /**
   * Send status update to popup
   */
  private async sendStatusUpdate(): Promise<void> {
    try {
      await this.messageBroker.sendToPopup(MessageType.STATUS_UPDATE, {
        isRunning: this.isRunning,
        currentSite: this.currentSite,
        totalActions: this.totalActions,
        interval: this.settings.getInterval()
      });
    } catch (error) {
      this.logger.error('Failed to send status update', error);
    }
  }

  /**
   * Handle action result from content script
   */
  async handleActionResult(result: ActionResultPayload): Promise<void> {
    if (result.success) {
      this.totalActions++;
      this.logger.debug('Action result received', {
        success: result.success,
        message: result.message,
        hasMore: result.hasMore,
        totalActions: this.totalActions
      });

      // If no more profiles, we might want to stop or change behavior
      if (!result.hasMore) {
        this.logger.info('No more profiles available');
        // Could add logic here to handle end of profiles
      }
    } else {
      this.logger.warn('Action failed', result);
    }

    // Send updated status
    await this.sendStatusUpdate();
  }
}

export default new AutoSwipeEngine();
