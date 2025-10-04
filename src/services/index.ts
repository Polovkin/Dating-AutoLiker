/**
 * Central export for all services
 */

// Core services
export { default as MessageBrokerService } from './messages/message-broker.service';
export { default as MessageHandlerService } from './messages/message-handler.service';
export { default as TabManagerService } from './tab-manager.service';
export { default as TimerService } from './timer.service';
export { default as SettingsService } from './settings.service';
export { default as AutoSwipeEngine } from './auto-swipe-engine.service';
export { default as AppLogger } from './logger.service';

// Re-export types for convenience
export type { 
    MessageType,
    MessageTarget,
    IMessage,
    StartEnginePayload,
    StopEnginePayload,
    UpdateSettingsPayload,
    StatusUpdatePayload,
    SwipeActionPayload,
    ActionResultPayload,
    LogMessagePayload,
    TimerPayload,
    TimerState,
    TabState,
    TabManagerPayload,
} from '@/types/common.types';
