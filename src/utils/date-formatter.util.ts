import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

export const dateFormats = {
    DD_MM_YYYY_HH_MM: 'DD-MM-YYYY HH:mm',
    YYYY_MM_DD_HH_MM: 'YYYY-MM-DD HH:mm',
    YYYY_MM_DD: 'YYYY-MM-DD',
    YYYY: 'YYYY',
    ISO_8601: 'YYYY-MM-DDTHH:mm:ss',
}

type DatePatterns = keyof typeof dateFormats

export interface DateUtilInterface {
    fromDateToPattern(date: Date, pattern?: DatePatterns): string
    fromStringToPattern(date: string, pattern: DatePatterns): string
    fromStringToDate(date: string): Date
}

class DateFormatterUtil implements DateUtilInterface {
    dateFormatter: typeof dayjs

    constructor() {
        this.dateFormatter = dayjs
    }

    fromDateToPattern(date: Date, pattern: DatePatterns = 'YYYY_MM_DD'): string {
        return this.dateFormatter(date).format(dateFormats[pattern])
    }

    fromStringToDate(date: string): Date {
        return new Date(date)
    }

    fromStringToPattern(date: string, pattern: DatePatterns): string {
        return this.dateFormatter(date).format(dateFormats[pattern])
    }
}

export default new DateFormatterUtil()
