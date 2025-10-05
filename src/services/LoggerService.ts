/**
 * LoggerService - Simple logging utility for Chrome Extension
 * Provides different log levels and consistent formatting
 */
export class LoggerService {
  private static instance: LoggerService;
  private readonly prefix: string;

  private constructor(prefix: string = 'DatingAutoLiker') {
    this.prefix = prefix;
  }

  /**
   * Get singleton instance of LoggerService
   */
  public static getInstance(prefix?: string): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService(prefix);
    }
    return LoggerService.instance;
  }

  /**
   * Log info message
   */
  public info(message: string, ...args: any[]): void {
    console.log(`[${this.prefix}] INFO: ${message}`, ...args);
  }

  /**
   * Log warning message
   */
  public warn(message: string, ...args: any[]): void {
    console.warn(`[${this.prefix}] WARN: ${message}`, ...args);
  }

  /**
   * Log error message
   */
  public error(message: string, ...args: any[]): void {
    console.error(`[${this.prefix}] ERROR: ${message}`, ...args);
  }

  /**
   * Log debug message (only in development)
   */
  public debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.prefix}] DEBUG: ${message}`, ...args);
    }
  }
}
