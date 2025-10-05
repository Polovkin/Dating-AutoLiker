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

// Initialize logger for background script
const logger = LoggerService.getInstance('Background');

// Initialize services
const messageService = MessageService.getInstance();
const swiperService = SwiperService.getInstance();

// Register background listeners for swiper actions
messageService.registerBackgroundListeners(swiperService);

logger.info('Background script initialized successfully');
