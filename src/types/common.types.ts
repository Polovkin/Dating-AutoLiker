/**
 * Common types and interfaces used across the application
 */

export enum MessageType {
  START_ENGINE = 'START_ENGINE',
  STOP_ENGINE = 'STOP_ENGINE',
  SWIPE_ACTION = 'SWIPE_ACTION',
  ACTION_RESULT = 'ACTION_RESULT',
  STATUS_UPDATE = 'STATUS_UPDATE',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  GET_STATUS = 'GET_STATUS'
}

export enum MessageTarget {
  POPUP = 'popup',
  CONTENT_SCRIPT = 'content-script',
  BACKGROUND = 'background'
}

export interface IMessage {
  type: MessageType;
  target: MessageTarget;
  payload?: any;
}

export interface StartEnginePayload {
  interval: number;
  site?: string;
}

export interface StopEnginePayload {
  reason?: string;
}

export interface SwipeActionPayload {
  action: 'like' | 'dislike';
}

export interface ActionResultPayload {
  success: boolean;
  message?: string;
  hasMore?: boolean;
}

export interface StatusUpdatePayload {
  isRunning: boolean;
  currentSite?: string;
  totalActions?: number;
}

export interface UpdateSettingsPayload {
  interval?: number;
  autoStart?: boolean;
  selectedSite?: string;
}

export interface LogMessagePayload {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: unknown;
}