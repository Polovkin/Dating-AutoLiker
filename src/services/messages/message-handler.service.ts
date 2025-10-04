import browser from "webextension-polyfill";
import {
  MessageBrokerService,
  AutoSwipeEngine,
  SettingsService,
  TabManagerService,
  TimerService,
  AppLogger
} from "../index";
import type { IMessage } from "@/types/common.types";
import { MessageType } from "@/types/common.types";

class MessageHandlerService {
  /**
   * Initialize message handling
   */
  initialize(): void {
    // Extension installation handler
    browser.runtime.onInstalled.addListener((details) => {
      AppLogger.info("Extension installed", details);
    });

    // Setup message listener
    MessageBrokerService.setupMessageListener(async (message: IMessage, sender) => {
      AppLogger.debug("Received message in background", { message, sender });

      try {
        await this.handleMessage(message, sender);
      } catch (error) {
        AppLogger.error("Error handling message", error);
      }
    });
  }

  /**
   * Handle incoming messages
   */
  private async handleMessage(message: IMessage, sender: any): Promise<void> {
    // Get tab ID from sender or payload
    const tabId = sender?.tab?.id || message.payload?.tabId || await TabManagerService.getCurrentTabId();
    
    if (!tabId) {
      AppLogger.warn("No tab ID available for message", { message, sender });
      return;
    }

    switch (message.type) {
      case MessageType.START_ENGINE:
        await TabManagerService.startEngine(tabId, message.payload?.settings);
        break;

      case MessageType.STOP_ENGINE:
        await TabManagerService.stopEngine(tabId, message.payload?.reason);
        break;

      case MessageType.UPDATE_SETTINGS:
        await SettingsHandler.handleUpdate(message.payload);
        break;

      case MessageType.GET_STATUS:
        await this.handleGetStatus(tabId);
        break;

      case MessageType.ACTION_RESULT:
        await this.handleActionResult(tabId, message.payload);
        break;

      case MessageType.TIMER_START:
        await TimerService.start(tabId, message.payload?.duration);
        await TabManagerService.startTimer(tabId, message.payload?.duration);
        break;

      case MessageType.TIMER_PAUSE:
        await TimerService.pause(tabId);
        await TabManagerService.pauseTimer(tabId);
        break;

      case MessageType.TIMER_RESUME:
        await TimerService.resume(tabId);
        await TabManagerService.resumeTimer(tabId);
        break;

      case MessageType.TIMER_STOP:
        await TimerService.stop(tabId);
        await TabManagerService.stopTimer(tabId);
        break;

      default:
        AppLogger.warn("Unknown message type", message.type);
    }
  }

  /**
   * Handle get status request
   */
  private async handleGetStatus(tabId: number): Promise<void> {
    try {
      const tabState = TabManagerService.getTabState(tabId);
      const settings = SettingsService.getSettings();
      
      if (tabState) {
        await MessageBrokerService.sendToPopup(MessageType.STATUS_UPDATE, {
          tabId,
          isRunning: tabState.isEngineRunning,
          settings,
          timer: TimerService.getTimerState(tabId),
          statistics: tabState.statistics
        });
      } else {
        // No tab state exists, send default status
        await MessageBrokerService.sendToPopup(MessageType.STATUS_UPDATE, {
          tabId,
          isRunning: false,
          settings,
          timer: TimerService.getTimerState(tabId) || {
            isRunning: false,
            isPaused: false,
            duration: 0,
            elapsed: 0
          },
          statistics: {
            totalSwipes: 0
          }
        });
      }
    } catch (error) {
      AppLogger.error("Failed to get status", error);
    }
  }

  /**
   * Handle action result from content script
   */
  private async handleActionResult(tabId: number, payload: any): Promise<void> {
    try {
      // Update statistics
      if (payload?.action) {
        TabManagerService.updateStatistics(tabId, payload.action);
      }
      
      // Handle the action result
      await AutoSwipeEngine.handleActionResult(payload);
    } catch (error) {
      AppLogger.error("Failed to handle action result", error);
    }
  }
}

/**
 * Engine operations handler
 */
class EngineHandler {
  /**
   * Handle start engine command
   */
  static async handleStart(payload: any): Promise<void> {
    AppLogger.info("Starting engine", payload);

    try {
      await AutoSwipeEngine.start(payload?.site);

      // Send confirmation back to popup
      await MessageBrokerService.sendToPopup(MessageType.STATUS_UPDATE, {
        isRunning: true,
        message: 'Engine started successfully'
      });
    } catch (error) {
      AppLogger.error("Failed to start engine", error);

      await MessageBrokerService.sendToPopup(MessageType.STATUS_UPDATE, {
        isRunning: false,
        error: (error as Error).message
      });
    }
  }

  /**
   * Handle stop engine command
   */
  static async handleStop(payload: any): Promise<void> {
    AppLogger.info("Stopping engine", payload);

    try {
      await AutoSwipeEngine.stop(payload?.reason);

      // Send confirmation back to popup
      await MessageBrokerService.sendToPopup(MessageType.STATUS_UPDATE, {
        isRunning: false,
        message: 'Engine stopped successfully'
      });
    } catch (error) {
      AppLogger.error("Failed to stop engine", error);
    }
  }
}

/**
 * Settings operations handler
 */
class SettingsHandler {
  /**
   * Handle settings update
   */
  static async handleUpdate(payload: any): Promise<void> {
    AppLogger.info("Updating settings", payload);

    try {
      await SettingsService.updateSettings(payload);

      // Send confirmation back to popup
      await MessageBrokerService.sendToPopup(MessageType.STATUS_UPDATE, {
        message: 'Settings updated successfully'
      });
    } catch (error) {
      AppLogger.error("Failed to update settings", error);
    }
  }
}

export default new MessageHandlerService();
