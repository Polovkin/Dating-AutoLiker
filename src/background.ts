import browser from "webextension-polyfill";
import { 
  MessageBrokerService, 
  AutoSwipeEngine, 
  SettingsService,
  AppLogger 
} from "@/services";
import type { IMessage } from "@/types/common.types";
import { MessageType } from "@/types/common.types";

AppLogger.info("Background script initialized");

// Extension installation handler
browser.runtime.onInstalled.addListener((details) => {
  AppLogger.info("Extension installed", details);
});

// Setup message listener
MessageBrokerService.setupMessageListener(async (message: IMessage, sender) => {
  AppLogger.debug("Received message in background", { message, sender });

  try {
    switch (message.type) {
      case MessageType.START_ENGINE:
        await handleStartEngine(message.payload);
        break;

      case MessageType.STOP_ENGINE:
        await handleStopEngine(message.payload);
        break;

      case MessageType.UPDATE_SETTINGS:
        await handleUpdateSettings(message.payload);
        break;

      case MessageType.GET_STATUS:
        await handleGetStatus();
        break;

      case MessageType.ACTION_RESULT:
        await AutoSwipeEngine.handleActionResult(message.payload);
        break;

      default:
        AppLogger.warn("Unknown message type", message.type);
    }
  } catch (error) {
    AppLogger.error("Error handling message", error);
  }
});

/**
 * Handle start engine command
 */
async function handleStartEngine(payload: any): Promise<void> {
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
async function handleStopEngine(payload: any): Promise<void> {
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

/**
 * Handle settings update
 */
async function handleUpdateSettings(payload: any): Promise<void> {
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

/**
 * Handle get status request
 */
async function handleGetStatus(): Promise<void> {
  try {
    const status = AutoSwipeEngine.getStatus();
    const settings = SettingsService.getSettings();
    
    await MessageBrokerService.sendToPopup(MessageType.STATUS_UPDATE, {
      ...status,
      settings
    });
  } catch (error) {
    AppLogger.error("Failed to get status", error);
  }
}

