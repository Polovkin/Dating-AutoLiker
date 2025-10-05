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
  GET_STATUS = 'GET_STATUS',
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
