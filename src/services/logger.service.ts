import DateFormatterUtil from "../utils/date-formatter.util";

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

class AppLogger {
    toDoAlert(message: string) {
        if (this.isDevelopment()) {
            if (typeof window !== 'undefined') {
                alert(`To do alert: ${message}`)
            }
            this.error(`To do alert: ${message}`)
        }
    }

    error(message: string, data?: unknown): void {
        this.logToConsole('error', message, data)
    }

    info(message: string, data?: unknown): void {
        this.logToConsole('info', message, data)
    }

    warn(message: string, data?: unknown): void {
        this.logToConsole('warn', message, data)
    }

    debug(message: string, data?: unknown): void {
        this.logToConsole('debug', message, data)
    }

    private logToVendor(level: LogLevel, message: string, data?: unknown): void {
        // Sentry removed - vendor logging disabled
    }

    private formatMessage(level: LogLevel, message: string): string {
        return `[${DateFormatterUtil.fromDateToPattern(new Date(), 'DD_MM_YYYY_HH_MM')}] [${level.toUpperCase()}]: ${message}`
    }

    private isDevelopment(): boolean {
        if (typeof process !== 'undefined') {
            return process.env.NODE_ENV === 'development'
        }
        return false
    }

    private isProduction(): boolean {
        if (typeof process !== 'undefined') {
            return (
                process.env.NODE_ENV === 'production' ||
                process.env.NEXT_PUBLIC_IS_PRODUCTION === 'true'
            )
        }
        return false
    }

    private logToConsole(level: LogLevel, message: string, data?: unknown): void {
        const formattedMessage = this.formatMessage(level, message)

        if (this.isProduction()) {
            this.logToVendor(level, message, data)
        }

        if (typeof window === 'undefined') {
            switch (level) {
                case 'info':
                    console.info(formattedMessage, data || '')
                    break
                case 'warn':
                    console.warn(formattedMessage, data || '')
                    break
                case 'error':
                    console.error(formattedMessage, data || '')
                    break
                case 'debug':
                    console.debug(formattedMessage, data || '')
                    break
                default:
                    break
            }
        } else if (this.isDevelopment()) {
            console[level]?.(formattedMessage, data || '')
        } else {
            console.log(formattedMessage)
        }
    }
}

export default new AppLogger()
