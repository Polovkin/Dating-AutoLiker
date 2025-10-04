/**
 * Background Script Entry Point
 * 
 * This file serves as the main entry point for the browser extension's background script.
 * All business logic has been moved to dedicated service classes.
 */

import { 
  MessageHandlerService,
  TabManagerService,
  TimerService,
  AppLogger 
} from "@/services";

// Initialize the application
AppLogger.info("Background script initialized");

// Load tab states and timer states on startup
TabManagerService.loadTabStates();

// Initialize message handling
MessageHandlerService.initialize();


