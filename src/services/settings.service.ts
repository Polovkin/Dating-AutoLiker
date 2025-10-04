import browser from "webextension-polyfill";
import AppLogger from "./logger.service";

export interface AppSettings {
  interval: number; // milliseconds between actions
  autoStart: boolean;
  selectedSite: string;
  isEnabled: boolean;
}

class SettingsService {
  private logger = AppLogger;
  private defaultSettings: AppSettings = {
    interval: 3000, // 3 seconds default
    autoStart: false,
    selectedSite: 'tinder',
    isEnabled: true
  };

  private currentSettings: AppSettings = { ...this.defaultSettings };

  constructor() {
    this.loadSettings();
  }

  /**
   * Load settings from browser storage
   */
  private async loadSettings(): Promise<void> {
    try {
      const result = await browser.storage.local.get('appSettings');
      if (result.appSettings) {
        this.currentSettings = { ...this.defaultSettings, ...result.appSettings };
        this.logger.debug('Settings loaded', this.currentSettings);
      }
    } catch (error) {
      this.logger.error('Failed to load settings', error);
    }
  }

  /**
   * Save settings to browser storage
   */
  private async saveSettings(): Promise<void> {
    try {
      await browser.storage.local.set({ appSettings: this.currentSettings });
      this.logger.debug('Settings saved', this.currentSettings);
    } catch (error) {
      this.logger.error('Failed to save settings', error);
    }
  }

  /**
   * Get current settings
   */
  getSettings(): AppSettings {
    return { ...this.currentSettings };
  }

  /**
   * Update settings
   */
  async updateSettings(newSettings: Partial<AppSettings>): Promise<void> {
    this.currentSettings = { ...this.currentSettings, ...newSettings };
    await this.saveSettings();
    this.logger.info('Settings updated', newSettings);
  }

  /**
   * Get interval in milliseconds
   */
  getInterval(): number {
    return this.currentSettings.interval;
  }

  /**
   * Set interval in milliseconds
   */
  async setInterval(interval: number): Promise<void> {
    if (interval < 1000) {
      this.logger.warn('Interval too low, setting to 1000ms', { interval });
      interval = 1000;
    }
    await this.updateSettings({ interval });
  }

  /**
   * Get selected site
   */
  getSelectedSite(): string {
    return this.currentSettings.selectedSite;
  }

  /**
   * Set selected site
   */
  async setSelectedSite(site: string): Promise<void> {
    await this.updateSettings({ selectedSite: site });
  }

  /**
   * Check if auto start is enabled
   */
  isAutoStartEnabled(): boolean {
    return this.currentSettings.autoStart;
  }

  /**
   * Set auto start
   */
  async setAutoStart(enabled: boolean): Promise<void> {
    await this.updateSettings({ autoStart: enabled });
  }

  /**
   * Check if app is enabled
   */
  isEnabled(): boolean {
    return this.currentSettings.isEnabled;
  }

  /**
   * Set app enabled state
   */
  async setEnabled(enabled: boolean): Promise<void> {
    await this.updateSettings({ isEnabled: enabled });
  }

  /**
   * Reset settings to default
   */
  async resetToDefault(): Promise<void> {
    this.currentSettings = { ...this.defaultSettings };
    await this.saveSettings();
    this.logger.info('Settings reset to default');
  }
}

export default new SettingsService();
