import {IS_ENV_DEV} from "../constants";

type LogLevel = 'info' | 'error' | 'warn';

class LoggerService {

    public info(message: string): void {
        if (IS_ENV_DEV) {
            this.logToFile(message, 'info');
        }
    }

    public error(message: string): void {
        this.logToFile(message, 'error');
    }

    public warn(message: string): void {
        this.logToFile(message, 'warn');
    }

    private logToFile(message: string, level: LogLevel): void {
        const loggerPrefix = "[LoggerService] ";

        switch (level) {
            case 'info':
                console.log(`${loggerPrefix}INFO: ${message}`);
                break;
            case 'error':
                console.error(`${loggerPrefix}ERROR: ${message}`);
                break;
            case 'warn':
                console.warn(`${loggerPrefix}WARN: ${message}`);
                break;
            default:
                console.log(message);
        }

    }
}

export default new LoggerService()
