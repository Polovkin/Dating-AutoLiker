/**
 * Central export for all services
 */

// Core services
export { default as MessageBrokerService } from './message-broker.service';
export { default as AppLogger } from './logger.service';

// Re-export types for convenience
export type { 
    IMessageBroker, 
    IMessage, 
    IMessageSender, 
    MessageTarget, 
    MessageType,
    StartEnginePayload,
    StopEnginePayload,
    UpdateSettingsPayload,
    StatusUpdatePayload,
    SwipeActionPayload,
    ActionResultPayload,
    PopupDetectedPayload,
    NoLikesPayload,
    PageErrorPayload,
    LogMessagePayload
} from '../types/interfaces/message-broker.interface';
