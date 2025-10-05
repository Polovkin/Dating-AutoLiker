import { LoggerService } from './LoggerService';

/**
 * SchedulerService - Handles timing and delays for swipe actions
 * Provides random delays to make automation look more human-like
 */
export class SchedulerService {
  private static instance: SchedulerService;
  private readonly logger: LoggerService;

  // Default delay ranges (in milliseconds)
  private minDelay: number = 1000; // 1 second
  private maxDelay: number = 3000; // 3 seconds

  private constructor() {
    this.logger = LoggerService.getInstance('SchedulerService');
  }

  /**
   * Get singleton instance of SchedulerService
   */
  public static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  /**
   * Generate a random delay between min and max values
   * @param min - Minimum delay in milliseconds (default: 1000)
   * @param max - Maximum delay in milliseconds (default: 3000)
   * @returns Promise that resolves after the random delay
   */
  public randomDelay(min: number = this.minDelay, max: number = this.maxDelay): Promise<void> {
    const delay = this.getRandomInt(min, max);
    this.logger.debug(`Scheduling delay: ${delay}ms`);
    
    return new Promise(resolve => {
      setTimeout(() => {
        this.logger.debug(`Delay completed: ${delay}ms`);
        resolve();
      }, delay);
    });
  }

  /**
   * Generate a random integer between min and max (inclusive)
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns Random integer
   */
  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Set custom delay ranges
   * @param min - Minimum delay in milliseconds
   * @param max - Maximum delay in milliseconds
   */
  public setDelayRange(min: number, max: number): void {
    if (min >= max) {
      this.logger.warn(`Invalid delay range: min (${min}) must be less than max (${max})`);
      return;
    }

    this.minDelay = min;
    this.maxDelay = max;
    this.logger.info(`Delay range updated: ${min}ms - ${max}ms`);
  }

  /**
   * Get current delay range
   * @returns Object with min and max delay values
   */
  public getDelayRange(): { min: number; max: number } {
    return {
      min: this.minDelay,
      max: this.maxDelay
    };
  }

  /**
   * Create a delay with exponential backoff
   * Useful for handling rate limiting or errors
   * @param attempt - Current attempt number (0-based)
   * @param baseDelay - Base delay in milliseconds (default: 1000)
   * @param maxDelay - Maximum delay in milliseconds (default: 10000)
   * @returns Promise that resolves after the calculated delay
   */
  public exponentialBackoff(attempt: number, baseDelay: number = 1000, maxDelay: number = 10000): Promise<void> {
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    this.logger.debug(`Exponential backoff delay: ${delay}ms (attempt ${attempt})`);
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, delay);
    });
  }

  /**
   * Create a delay that varies based on time of day
   * Longer delays during peak hours to appear more human-like
   * @returns Promise that resolves after the time-based delay
   */
  public timeBasedDelay(): Promise<void> {
    const hour = new Date().getHours();
    
    // Peak hours (9-11 AM, 7-10 PM) - longer delays
    const isPeakHour = (hour >= 9 && hour <= 11) || (hour >= 19 && hour <= 22);
    
    const min = isPeakHour ? 2000 : this.minDelay;
    const max = isPeakHour ? 5000 : this.maxDelay;
    
    this.logger.debug(`Time-based delay: ${isPeakHour ? 'peak' : 'normal'} hours (${hour}:00)`);
    return this.randomDelay(min, max);
  }
}
