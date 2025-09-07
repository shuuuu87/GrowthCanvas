import { format, parseISO } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

// Indian Standard Time timezone
export const IST_TIMEZONE = 'Asia/Kolkata';

// Get current date and time in IST
export const getCurrentIST = (): Date => {
  return toZonedTime(new Date(), IST_TIMEZONE);
};

// Format date in IST timezone
export const formatDateIST = (date: Date | string, formatString: string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const istDate = toZonedTime(dateObj, IST_TIMEZONE);
  return format(istDate, formatString);
};

// Format current date for display (e.g., "December 6, 2024")
export const getCurrentDateFormatted = (): string => {
  const now = getCurrentIST();
  return format(now, 'MMMM d, yyyy');
};

// Convert UTC date to IST for form inputs (YYYY-MM-DD format)
export const formatDateForInput = (date: Date | string): string => {
  return formatDateIST(date, 'yyyy-MM-dd');
};

// Convert UTC datetime to IST for datetime-local inputs
export const formatDateTimeForInput = (date: Date | string): string => {
  return formatDateIST(date, "yyyy-MM-dd'T'HH:mm");
};

// Format date for display (e.g., "Dec 6, 2024")
export const formatDateForDisplay = (date: Date | string): string => {
  return formatDateIST(date, 'MMM d, yyyy');
};

// Format datetime for display (e.g., "Dec 6, 2024 at 2:30 PM")
export const formatDateTimeForDisplay = (date: Date | string): string => {
  return formatDateIST(date, 'MMM d, yyyy \'at\' h:mm a');
};

// Format time only (e.g., "2:30 PM")
export const formatTimeForDisplay = (date: Date | string): string => {
  return formatDateIST(date, 'h:mm a');
};

// Convert local date input to UTC for storage
export const convertLocalDateToUTC = (dateString: string): string => {
  // Assume the input date is in IST and convert to UTC
  const localDate = new Date(dateString);
  const utcDate = fromZonedTime(localDate, IST_TIMEZONE);
  return utcDate.toISOString();
};

// Check if two dates are the same day in IST
export const isSameDayIST = (date1: Date | string, date2: Date | string): boolean => {
  const date1Obj = typeof date1 === 'string' ? parseISO(date1) : date1;
  const date2Obj = typeof date2 === 'string' ? parseISO(date2) : date2;
  
  const ist1 = toZonedTime(date1Obj, IST_TIMEZONE);
  const ist2 = toZonedTime(date2Obj, IST_TIMEZONE);
  
  return format(ist1, 'yyyy-MM-dd') === format(ist2, 'yyyy-MM-dd');
};