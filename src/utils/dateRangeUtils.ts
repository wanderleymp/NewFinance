export interface DateRange {
  startDate: string;
  endDate: string;
}

export class DateRangeUtils {
  public static getDateRangeForPeriod(period: 'today' | 'week' | 'month'): DateRange {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (period) {
      case 'today':
        return { startDate: today, endDate: today };
      
      case 'week': {
        const start = new Date(now);
        start.setDate(now.getDate() - 7);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: today
        };
      }
      
      case 'month': {
        const start = new Date(now);
        start.setMonth(now.getMonth() - 1);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: today
        };
      }
      
      default:
        return { startDate: today, endDate: today };
    }
  }
}

// Create a default instance for convenience
export const dateRangeUtils = {
  getDateRangeForPeriod: DateRangeUtils.getDateRangeForPeriod
};