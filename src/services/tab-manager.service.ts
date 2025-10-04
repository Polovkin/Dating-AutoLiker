import browser from "webextension-polyfill";
import type { TabState, TabManagerPayload } from "@/types/common.types";
import { MessageType } from "@/types/common.types";
import { MessageBrokerService, AutoSwipeEngine, TimerService, AppLogger } from "./index";

class TabManagerService {
  private tabStates: Map<number, TabState> = new Map();

  /**
   * Get current active tab ID
   */
  async getCurrentTabId(): Promise<number | null> {
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      return tabs[0]?.id || null;
    } catch (error) {
      AppLogger.error("Failed to get current tab", error);
      return null;
    }
  }

  /**
   * Get tab state by tab ID
   */
  getTabState(tabId: number): TabState | null {
    return this.tabStates.get(tabId) || null;
  }

  /**
   * Get or create tab state
   */
  private getOrCreateTabState(tabId: number): TabState {
    let tabState = this.tabStates.get(tabId);
    
    if (!tabState) {
      tabState = {
        tabId,
        isEngineRunning: false,
        timerState: TimerService.getTimerState(tabId) || {
          isRunning: false,
          isPaused: false,
          duration: 0,
          elapsed: 0
        },
        statistics: {
          totalSwipes: 0,
          lastAction: undefined,
          lastActionTime: undefined
        },
        lastActivity: Date.now()
      };
      
      this.tabStates.set(tabId, tabState);
      AppLogger.info(`Created new tab state for tab ${tabId}`);
    }
    
    return tabState!;
  }

  /**
   * Start timer for specific tab (delegates to TimerService)
   */
  async startTimer(tabId: number, duration?: number): Promise<void> {
    await TimerService.start(tabId, duration);
    const tabState = this.getOrCreateTabState(tabId);
    tabState.lastActivity = Date.now();
    await this.saveTabStates();
  }

  /**
   * Pause timer for specific tab (delegates to TimerService)
   */
  async pauseTimer(tabId: number): Promise<void> {
    await TimerService.pause(tabId);
    const tabState = this.getOrCreateTabState(tabId);
    tabState.lastActivity = Date.now();
    await this.saveTabStates();
  }

  /**
   * Resume timer for specific tab (delegates to TimerService)
   */
  async resumeTimer(tabId: number): Promise<void> {
    await TimerService.resume(tabId);
    const tabState = this.getOrCreateTabState(tabId);
    tabState.lastActivity = Date.now();
    await this.saveTabStates();
  }

  /**
   * Stop timer for specific tab (delegates to TimerService)
   */
  async stopTimer(tabId: number): Promise<void> {
    await TimerService.stop(tabId);
    const tabState = this.getOrCreateTabState(tabId);
    tabState.lastActivity = Date.now();
    await this.saveTabStates();
  }

  /**
   * Start engine for specific tab
   */
  async startEngine(tabId: number, settings?: any): Promise<void> {
    AppLogger.info(`Starting engine for tab ${tabId}`, { settings });
    
    try {
      const tabState = this.getOrCreateTabState(tabId);
      
      // Stop existing engine if running
      if (tabState.isEngineRunning) {
        await this.stopEngine(tabId);
      }
      
      tabState.isEngineRunning = true;
      tabState.engineSettings = settings;
      tabState.lastActivity = Date.now();
      
      await this.saveTabStates();
      await this.notifyPopup(tabId, 'engine');
      
      AppLogger.info(`Engine started for tab ${tabId}`);
    } catch (error) {
      AppLogger.error(`Failed to start engine for tab ${tabId}`, error);
      throw error;
    }
  }

  /**
   * Stop engine for specific tab
   */
  async stopEngine(tabId: number, reason?: string): Promise<void> {
    AppLogger.info(`Stopping engine for tab ${tabId}`, { reason });
    
    try {
      const tabState = this.tabStates.get(tabId);
      if (!tabState) {
        AppLogger.warn(`No tab state found for tab ${tabId}`);
        return;
      }
      
      tabState.isEngineRunning = false;
      tabState.lastActivity = Date.now();
      
      await this.saveTabStates();
      await this.notifyPopup(tabId, 'engine');
      
      AppLogger.info(`Engine stopped for tab ${tabId}`);
    } catch (error) {
      AppLogger.error(`Failed to stop engine for tab ${tabId}`, error);
      throw error;
    }
  }

  /**
   * Update statistics for specific tab
   */
  updateStatistics(tabId: number, action: string): void {
    const tabState = this.tabStates.get(tabId);
    if (tabState) {
      tabState.statistics.totalSwipes++;
      tabState.statistics.lastAction = action;
      tabState.statistics.lastActionTime = Date.now();
      tabState.lastActivity = Date.now();
      
      AppLogger.debug(`Updated statistics for tab ${tabId}`, tabState.statistics);
    }
  }

  /**
   * Get all tab states
   */
  getAllTabStates(): Map<number, TabState> {
    return new Map(this.tabStates);
  }

  /**
   * Clean up tab state when tab is closed
   */
  async cleanupTab(tabId: number): Promise<void> {
    AppLogger.info(`Cleaning up tab state for tab ${tabId}`);
    
    try {
      // Stop timer
      await TimerService.cleanupTimer(tabId);
      
      // Remove from states
      this.tabStates.delete(tabId);
      
      await this.saveTabStates();
      
      AppLogger.info(`Tab state cleaned up for tab ${tabId}`);
    } catch (error) {
      AppLogger.error(`Failed to cleanup tab ${tabId}`, error);
    }
  }

  /**
   * Load tab states from storage
   */
  async loadTabStates(): Promise<void> {
    try {
      if (typeof browser === 'undefined' || !browser.storage) {
        AppLogger.warn("Browser storage API not available");
        return;
      }

      const result = await browser.storage.local.get(['tabStates']);
      if (result.tabStates) {
        const savedStates = result.tabStates as Record<string, TabState>;
        
        for (const [tabIdStr, tabState] of Object.entries(savedStates)) {
          const tabId = parseInt(tabIdStr);
          this.tabStates.set(tabId, tabState);
        }
        
        AppLogger.info(`Loaded ${this.tabStates.size} tab states from storage`);
      }
      
      // Load timer states separately
      await TimerService.loadTimerStates();
    } catch (error) {
      AppLogger.error("Failed to load tab states", error);
    }
  }


  /**
   * Save tab states to storage
   */
  private async saveTabStates(): Promise<void> {
    try {
      if (typeof browser === 'undefined' || !browser.storage) {
        AppLogger.warn("Browser storage API not available, cannot save tab states");
        return;
      }

      const tabStatesObj: Record<string, TabState> = {};
      for (const [tabId, tabState] of this.tabStates.entries()) {
        tabStatesObj[tabId.toString()] = tabState;
      }

      await browser.storage.local.set({ tabStates: tabStatesObj });
    } catch (error) {
      AppLogger.error("Failed to save tab states", error);
    }
  }

  /**
   * Notify popup about state changes
   */
  private async notifyPopup(tabId: number, type: 'timer' | 'engine'): Promise<void> {
    try {
      const tabState = this.tabStates.get(tabId);
      if (!tabState) return;

      if (type === 'timer') {
        const timerState = TimerService.getTimerState(tabId);
        if (timerState) {
          await MessageBrokerService.sendToPopup(MessageType.TIMER_TICK, {
            ...timerState,
            tabId
          });
        }
      } else if (type === 'engine') {
        await MessageBrokerService.sendToPopup(MessageType.STATUS_UPDATE, {
          tabId,
          isRunning: tabState.isEngineRunning,
          settings: tabState.engineSettings,
          statistics: tabState.statistics,
          timer: TimerService.getTimerState(tabId)
        });
      }
    } catch (error) {
      AppLogger.error(`Failed to notify popup for tab ${tabId}`, error);
    }
  }
}

export default new TabManagerService();
