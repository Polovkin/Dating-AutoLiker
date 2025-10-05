import { LoggerService } from './LoggerService';
import { MessageType, type IMessage } from '../types/common.types';

/**
 * Message payload interface
 */
export interface MessagePayload {
  [key: string]: any;
}

/**
 * Message handler function type
 */
export type MessageHandler = (payload?: MessagePayload) => void;

/**
 * MessageService - Handles communication between background, content-script and popup
 * Uses Chrome extension messaging API for cross-component communication
 */
export class MessageService {
  private static instance: MessageService;
  private readonly logger: LoggerService;
  private readonly handlers: Map<MessageType, Set<MessageHandler>> = new Map();

  private constructor() {
    this.logger = LoggerService.getInstance('MessageService');
    this.setupMessageListener();
  }

  /**
   * Get singleton instance of MessageService
   */
  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  /**
   * Send message to other components
   * @param type - Message type
   * @param payload - Optional message payload
   * @param target - Optional target component (defaults to background)
   */
  public send(type: MessageType, payload?: MessagePayload, target?: string): void {
    this.logger.debug(`Sending message: ${type} to ${target || 'background'}`, payload);

    const message: IMessage = {
      type,
      target: target as any || 'background',
      payload
    };

    // Send to background script or popup
    if (typeof window !== 'undefined' && window.chrome?.runtime) {
      try {
        window.chrome.runtime.sendMessage(message, (response: any) => {
          if (window.chrome?.runtime.lastError) {
            this.logger.error('Failed to send message:', window.chrome.runtime.lastError.message);
          } else {
            this.logger.debug(`Message sent successfully: ${type} to ${target || 'background'}`);
          }
        });
      } catch (error) {
        this.logger.error('Error sending message:', error);
      }
    }

    // Dispatch local event for same-context components
    this.dispatchLocalEvent(type, payload);
  }

  /**
   * Subscribe to messages of specific type
   * @param type - Message type to listen for
   * @param handler - Handler function to execute when message is received
   */
  public on(type: MessageType, handler: MessageHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    
    this.handlers.get(type)!.add(handler);
    this.logger.debug(`Subscribed to message type: ${type}`);
  }

  /**
   * Unsubscribe from messages of specific type
   * @param type - Message type to stop listening for
   * @param handler - Handler function to remove
   */
  public off(type: MessageType, handler: MessageHandler): void {
    const typeHandlers = this.handlers.get(type);
    if (typeHandlers) {
      typeHandlers.delete(handler);
      this.logger.debug(`Unsubscribed from message type: ${type}`);
    }
  }

  /**
   * Register background script listeners for swiper actions
   * @param swiperService - SwiperService instance to handle swipe actions
   */
  public registerBackgroundListeners(swiperService: any): void {
    this.logger.info('Registering background listeners for swiper actions');

    // Listen for START_SWIPE message
    this.on(MessageType.START_SWIPE, (payload) => {
      this.logger.info('Received START_SWIPE message', payload);
      const siteId = payload?.siteId || swiperService.getActiveSiteId();
      swiperService.start(siteId);
    });

    // Listen for STOP_SWIPE message
    this.on(MessageType.STOP_SWIPE, () => {
      this.logger.info('Received STOP_SWIPE message');
      swiperService.stop();
    });

    // Listen for ACTION_RESULT message
    this.on(MessageType.ACTION_RESULT, (payload) => {
      this.logger.debug('Received ACTION_RESULT message', payload);
      swiperService.handleActionResult(payload);
    });

    // Legacy support for old message types
    this.on(MessageType.START_ENGINE, () => {
      this.logger.info('Received legacy START_ENGINE message');
      swiperService.start();
    });

    this.on(MessageType.STOP_ENGINE, () => {
      this.logger.info('Received legacy STOP_ENGINE message');
      swiperService.stop();
    });

    this.logger.info('Background listeners registered successfully');
  }

  /**
   * Setup Chrome runtime message listener
   */
  private setupMessageListener(): void {
    if (typeof window !== 'undefined' && window.chrome?.runtime?.onMessage) {
      window.chrome.runtime.onMessage.addListener((message: IMessage, sender: any, sendResponse: (response?: any) => void) => {
        this.logger.debug('Received message:', message);
        
        if (message.type) {
          this.handleMessage(message.type, message.payload);
        }
        
        sendResponse({ success: true });
        return true; // Keep message channel open for async response
      });
    }
  }

  /**
   * Handle incoming message by calling registered handlers
   */
  private handleMessage(type: MessageType, payload?: MessagePayload): void {
    const typeHandlers = this.handlers.get(type);
    if (typeHandlers) {
      typeHandlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          this.logger.error(`Error in message handler for ${type}:`, error);
        }
      });
    }
  }

  /**
   * Dispatch local event for same-context components
   */
  private dispatchLocalEvent(type: MessageType, payload?: MessagePayload): void {
    // Use custom event for same-context communication
    const event = new CustomEvent(`message-${type}`, {
      detail: payload
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  }
}
