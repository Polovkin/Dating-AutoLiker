/**
 * Common types and interfaces used across the application
 */

export enum MessageType {
  // Site detection
  SITE_DETECTED = 'SITE_DETECTED',
  SITE_READY = 'SITE_READY',
  
  // Swipe control
  START_SWIPE = 'START_SWIPE',
  STOP_SWIPE = 'STOP_SWIPE',
  SWIPE_ACTION = 'SWIPE_ACTION',
  ACTION_RESULT = 'ACTION_RESULT',
  
  // Status updates
  STATUS_UPDATE = 'STATUS_UPDATE',
  GET_STATUS = 'GET_STATUS',
  
  // Legacy (keep for compatibility)
  START_ENGINE = 'START_ENGINE',
  STOP_ENGINE = 'STOP_ENGINE',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  TIMER_START = 'TIMER_START',
  TIMER_PAUSE = 'TIMER_PAUSE',
  TIMER_RESUME = 'TIMER_RESUME',
  TIMER_STOP = 'TIMER_STOP',
  TIMER_TICK = 'TIMER_TICK'
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


export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  duration: number; // total duration in seconds
  elapsed: number; // elapsed time in seconds
  startTime?: number; // timestamp when timer was started
  pauseTime?: number; // timestamp when timer was paused
}
