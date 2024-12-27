export const dateUtils = {
  formatDisplayDate: (dateString: string): string => {
    if (!dateString) return '';
    const [date] = dateString.split('T');
    return date;
  },

  formatApiDate: (date: Date): string => {
    return date.toISOString();
  },

  getUserTimezone: (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  },

  getCurrentWeekBusinessDays: (): { startDate: string; endDate: string } => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(monday.getDate() - monday.getDay() + 1);
    
    const friday = new Date(monday);
    friday.setDate(friday.getDate() + 4);
    
    return {
      startDate: monday.toISOString().split('T')[0],
      endDate: friday.toISOString().split('T')[0]
    };
  },

  getCurrentMonthRange: (): { startDate: string; endDate: string } => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    };
  },

  formatBrazilianDate: (dateString: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }
};

export default dateUtils;