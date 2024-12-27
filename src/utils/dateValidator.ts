export class DateValidator {
  private static DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

  public static isValidDateFormat(date: string): boolean {
    if (!this.DATE_REGEX.test(date)) {
      return false;
    }

    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }

  public static validateDateRange(startDate: string, endDate: string): void {
    if (!this.isValidDateFormat(startDate)) {
      throw new Error(`Invalid start date format: ${startDate}. Expected format: YYYY-MM-DD`);
    }

    if (!this.isValidDateFormat(endDate)) {
      throw new Error(`Invalid end date format: ${endDate}. Expected format: YYYY-MM-DD`);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new Error('Start date cannot be later than end date');
    }
  }

  public static validateOptionalDate(date: string | undefined): void {
    if (date && !this.isValidDateFormat(date)) {
      throw new Error(`Invalid date format: ${date}. Expected format: YYYY-MM-DD`);
    }
  }
}