
import { format, isSaturday, isSunday, parse } from 'date-fns';

/**
 * Checks if a given date is a weekend (Saturday or Sunday)
 */
export const isWeekend = (date: Date): boolean => {
    return isSaturday(date) || isSunday(date);
};

/**
 * Checks if a given time string (HH:mm) is within the peak hour range
 */
export const isPeakHour = (timeStr: string, startTime: string = "18:00", endTime: string = "21:00"): boolean => {
    const [hours] = timeStr.split(':').map(Number);
    const [startH] = startTime.split(':').map(Number);
    const [endH] = endTime.split(':').map(Number);

    return hours >= startH && hours < endH;
};

interface PricingInfo {
    basePrice: number;
    multiplier: number;
    finalPrice: number;
    isPeak: boolean;
    isWeekend: boolean;
}

/**
 * Calculates the dynamic price for a turf based on date and time
 */
export const calculateDynamicPrice = (
    turf: {
        weekday_price: number;
        weekend_price: number;
        peak_hour_multiplier: number;
        peak_start_time?: string;
        peak_end_time?: string;
    },
    date: Date,
    timeStr: string
): PricingInfo => {
    const weekend = isWeekend(date);
    const basePrice = weekend ? turf.weekend_price : turf.weekday_price;

    const peak = isPeakHour(timeStr, turf.peak_start_time, turf.peak_end_time);
    const multiplier = peak ? turf.peak_hour_multiplier : 1.0;

    const finalPrice = Math.round(basePrice * multiplier);

    return {
        basePrice,
        multiplier,
        finalPrice,
        isPeak: peak,
        isWeekend: weekend
    };
};
