import browser from "webextension-polyfill";
import type { TimerState, TimerPayload } from "@/types/common.types";
import { MessageType } from "@/types/common.types";
import { MessageBrokerService, AppLogger } from "./index";

class TimerService {
  private timerStates: Map<number, TimerState> = new Map(); // tabId -> TimerState
  private timerIntervals: Map<number, NodeJS.Timeout> = new Map(); // tabId -> interval
  private readonly DEFAULT_TIMER_DURATION = 300; // 5 minutes

  /**
   * Start timer for specific tab
   */
  async start(tabId: number, duration?: number): Promise<void> {
    AppLogger.info(`Starting timer for tab ${tabId}`, { duration });
    
    try {
      // Stop any existing timer for this tab
      this.stop(tabId);
      
      const timerDuration = duration || this.DEFAULT_TIMER_DURATION;
      const now = Date.now();
      
      const timerState: TimerState = {
        isRunning: true,
        isPaused: false,
        duration: timerDuration,
        elapsed: 0,
        startTime: now
      };
      
      this.timerStates.set(tabId, timerState);
      
      // Start timer interval
      const interval = setInterval(async () => {
        await this.updateTimer(tabId);
      }, 1000);
      
      this.timerIntervals.set(tabId, interval);
      
      // Save state and notify
      await this.saveTimerStates();
      await this.notifyTimerUpdate(tabId);
      
      AppLogger.info(`Timer started for tab ${tabId}`);
    } catch (error) {
      AppLogger.error(`Failed to start timer for tab ${tabId}`, error);
      throw error;
    }
  }

  /**
   * Pause timer for specific tab
   */
  async pause(tabId: number): Promise<void> {
    AppLogger.info(`Pausing timer for tab ${tabId}`);
    
    try {
      const timerState = this.timerStates.get(tabId);
      if (!timerState) {
        AppLogger.warn(`No timer state found for tab ${tabId}`);
        return;
      }
      
      // Stop timer interval
      const interval = this.timerIntervals.get(tabId);
      if (interval) {
        clearInterval(interval);
        this.timerIntervals.delete(tabId);
      }
      
      timerState.isRunning = false;
      timerState.isPaused = true;
      timerState.pauseTime = Date.now();
      
      await this.saveTimerStates();
      await this.notifyTimerUpdate(tabId);
      
      AppLogger.info(`Timer paused for tab ${tabId}`);
    } catch (error) {
      AppLogger.error(`Failed to pause timer for tab ${tabId}`, error);
      throw error;
    }
  }

  /**
   * Resume timer for specific tab
   */
  async resume(tabId: number): Promise<void> {
    AppLogger.info(`Resuming timer for tab ${tabId}`);
    
    try {
      const timerState = this.timerStates.get(tabId);
      if (!timerState || !timerState.isPaused) {
        AppLogger.warn(`Cannot resume timer for tab ${tabId} - not paused`);
        return;
      }
      
      const remainingDuration = timerState.duration - timerState.elapsed;
      const now = Date.now();
      
      timerState.isRunning = true;
      timerState.isPaused = false;
      timerState.startTime = now;
      timerState.duration = remainingDuration;
      timerState.elapsed = 0;
      timerState.pauseTime = undefined;
      
      // Start new timer interval
      const interval = setInterval(async () => {
        await this.updateTimer(tabId);
      }, 1000);
      
      this.timerIntervals.set(tabId, interval);
      
      await this.saveTimerStates();
      await this.notifyTimerUpdate(tabId);
      
      AppLogger.info(`Timer resumed for tab ${tabId}`);
    } catch (error) {
      AppLogger.error(`Failed to resume timer for tab ${tabId}`, error);
      throw error;
    }
  }

  /**
   * Stop timer for specific tab
   */
  async stop(tabId: number): Promise<void> {
    AppLogger.info(`Stopping timer for tab ${tabId}`);
    
    try {
      // Stop timer interval
      const interval = this.timerIntervals.get(tabId);
      if (interval) {
        clearInterval(interval);
        this.timerIntervals.delete(tabId);
      }
      
      // Reset timer state
      this.timerStates.set(tabId, {
        isRunning: false,
        isPaused: false,
        duration: 0,
        elapsed: 0
      });
      
      await this.saveTimerStates();
      await this.notifyTimerUpdate(tabId);
      
      AppLogger.info(`Timer stopped for tab ${tabId}`);
    } catch (error) {
      AppLogger.error(`Failed to stop timer for tab ${tabId}`, error);
      throw error;
    }
  }

  /**
   * Get timer state for specific tab
   */
  getTimerState(tabId: number): TimerState | null {
    return this.timerStates.get(tabId) || null;
  }

  /**
   * Get all timer states
   */
  getAllTimerStates(): Map<number, TimerState> {
    return new Map(this.timerStates);
  }

  /**
   * Load timer states from storage
   */
  async loadTimerStates(): Promise<void> {
    try {
      if (typeof browser === 'undefined' || !browser.storage) {
        AppLogger.warn("Browser storage API not available");
        return;
      }

      const result = await browser.storage.local.get(['timerStates']);
      if (result.timerStates) {
        const savedStates = result.timerStates as Record<string, TimerState>;
        
        for (const [tabIdStr, timerState] of Object.entries(savedStates)) {
          const tabId = parseInt(tabIdStr);
          this.timerStates.set(tabId, timerState);
          
          // Restart timer if it was running
          if (timerState.isRunning && timerState.startTime) {
            const now = Date.now();
            const elapsed = Math.floor((now - timerState.startTime) / 1000);
            
            if (elapsed < timerState.duration) {
              // Resume timer
              const remainingDuration = timerState.duration - elapsed;
              await this.start(tabId, remainingDuration);
            } else {
              // Timer finished
              await this.stop(tabId);
            }
          }
        }
        
        AppLogger.info(`Loaded ${this.timerStates.size} timer states from storage`);
      }
    } catch (error) {
      AppLogger.error("Failed to load timer states", error);
    }
  }

  /**
   * Clean up timer for specific tab
   */
  async cleanupTimer(tabId: number): Promise<void> {
    AppLogger.info(`Cleaning up timer for tab ${tabId}`);
    
    try {
      // Stop timer
      const interval = this.timerIntervals.get(tabId);
      if (interval) {
        clearInterval(interval);
        this.timerIntervals.delete(tabId);
      }
      
      // Remove from states
      this.timerStates.delete(tabId);
      
      await this.saveTimerStates();
      
      AppLogger.info(`Timer cleaned up for tab ${tabId}`);
    } catch (error) {
      AppLogger.error(`Failed to cleanup timer for tab ${tabId}`, error);
    }
  }

  /**
   * Update timer for specific tab
   */
  private async updateTimer(tabId: number): Promise<void> {
    try {
      const timerState = this.timerStates.get(tabId);
      if (!timerState || !timerState.isRunning || !timerState.startTime) {
        return;
      }

      const now = Date.now();
      const elapsed = Math.floor((now - timerState.startTime) / 1000);

      timerState.elapsed = elapsed;

      // Notify about timer update
      await this.notifyTimerUpdate(tabId);

      // Check if timer is finished
      if (elapsed >= timerState.duration) {
        await this.stop(tabId);
      }
    } catch (error) {
      AppLogger.error(`Failed to update timer for tab ${tabId}`, error);
    }
  }

  /**
   * Save timer states to storage
   */
  private async saveTimerStates(): Promise<void> {
    try {
      if (typeof browser === 'undefined' || !browser.storage) {
        AppLogger.warn("Browser storage API not available, cannot save timer states");
        return;
      }

      const timerStatesObj: Record<string, TimerState> = {};
      for (const [tabId, timerState] of this.timerStates.entries()) {
        timerStatesObj[tabId.toString()] = timerState;
      }

      await browser.storage.local.set({ timerStates: timerStatesObj });
    } catch (error) {
      AppLogger.error("Failed to save timer states", error);
    }
  }

  /**
   * Notify about timer update
   */
  private async notifyTimerUpdate(tabId: number): Promise<void> {
    try {
      const timerState = this.timerStates.get(tabId);
      if (!timerState) return;

      await MessageBrokerService.sendToPopup(MessageType.TIMER_TICK, {
        ...timerState,
        tabId
      });
    } catch (error) {
      AppLogger.error(`Failed to notify timer update for tab ${tabId}`, error);
    }
  }
}

export default new TimerService();
