// Level Up Planner: Date Handling Utilities
// Uses local device date to prevent UTC offset shifting bugs

export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getGreeting(hour: number = new Date().getHours()): string {
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

export function formatDisplayDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const todayStr = formatLocalDate(new Date());
  if (dateString === todayStr) {
    return 'Today';
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateString === formatLocalDate(tomorrow)) {
    return 'Tomorrow';
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateString === formatLocalDate(yesterday)) {
    return 'Yesterday';
  }

  try {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateString;
  }
}

export function formatHeaderDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function isDateInThisWeek(dateString: string, weekStart: number = 1): boolean {
  const target = parseLocalDate(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Determine the start of the current week
  const currentDayOfWeek = today.getDay(); // 0 is Sunday
  const diffToStart = (currentDayOfWeek - weekStart + 7) % 7;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - diffToStart);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return target >= startOfWeek && target <= endOfWeek;
}

export function isDateToday(dateString: string): boolean {
  return dateString === formatLocalDate(new Date());
}

export function isDateUpcoming(dateString: string): boolean {
  const todayStr = formatLocalDate(new Date());
  return dateString > todayStr;
}

export function getLast7Days(today: Date = new Date()): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(formatLocalDate(d));
  }
  return days;
}

export function getDayAbbr(dateString: string): string {
  const d = parseLocalDate(dateString);
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return weekdays[d.getDay()];
}

export function getCurrentTimeString(now: Date = new Date()): string {
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function isTaskOverdue(
  dueDate: string | null | undefined,
  dueTime: string | null | undefined,
  refDate?: string,
  refTime?: string
): boolean {
  if (!dueDate) return false;
  const today = refDate || formatLocalDate(new Date());

  if (dueDate < today) {
    return true;
  }

  if (dueDate === today) {
    if (dueTime) {
      const currentTime = refTime || getCurrentTimeString(new Date());
      return currentTime > dueTime;
    }
    // If no due time specified, task is valid for the whole day, so not overdue until next day
    return false;
  }

  return false;
}

export interface MonthPeriod {
  year: number;
  month: number; // 1-12
  monthName: string; // e.g. "November"
  monthLabel: string; // e.g. "November 2026"
  monthStartDate: string; // YYYY-MM-DD
  monthEndDate: string; // YYYY-MM-DD
  prevYear: number;
  prevMonth: number;
  nextYear: number;
  nextMonth: number;
}

export function getMonthPeriod(year: number = new Date().getFullYear(), month: number = new Date().getMonth() + 1): MonthPeriod {
  // Ensure valid year and month
  let y = year;
  let m = month;
  if (m < 1) {
    y -= 1;
    m = 12;
  } else if (m > 12) {
    y += 1;
    m = 1;
  }

  const firstDay = new Date(y, m - 1, 1);
  const lastDayDate = new Date(y, m, 0);
  const lastDay = lastDayDate.getDate();

  const monthStartDate = `${y}-${String(m).padStart(2, '0')}-01`;
  const monthEndDate = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const monthName = firstDay.toLocaleDateString('en-US', { month: 'long' });
  const monthLabel = `${monthName} ${y}`;

  const prevMonth = m === 1 ? 12 : m - 1;
  const prevYear = m === 1 ? y - 1 : y;

  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;

  return {
    year: y,
    month: m,
    monthName,
    monthLabel,
    monthStartDate,
    monthEndDate,
    prevYear,
    prevMonth,
    nextYear,
    nextMonth,
  };
}

export interface WeekPeriod {
  weekStartDate: string; // YYYY-MM-DD
  weekEndDate: string; // YYYY-MM-DD
  periodKey: string; // e.g. "2026-W47"
  label: string; // e.g. "Nov 17 - Nov 23"
}

export function getWeekPeriod(referenceDate: Date = new Date(), weekStart: number = 1): WeekPeriod {
  const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const currentDayOfWeek = d.getDay(); // 0 is Sunday
  const diffToStart = (currentDayOfWeek - weekStart + 7) % 7;

  const startOfWeek = new Date(d);
  startOfWeek.setDate(d.getDate() - diffToStart);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startStr = formatLocalDate(startOfWeek);
  const endStr = formatLocalDate(endOfWeek);

  // Calculate ISO week-like number for period key
  // Target Thursday of the week to get reliable year & week number
  const thursday = new Date(startOfWeek);
  thursday.setDate(startOfWeek.getDate() + 3);
  const year = thursday.getFullYear();
  const firstJan = new Date(year, 0, 1);
  const dayOfYear = Math.floor((thursday.getTime() - firstJan.getTime()) / 86400000) + 1;
  const weekNumber = Math.ceil(dayOfYear / 7);
  const periodKey = `${year}-W${String(weekNumber).padStart(2, '0')}`;

  const startLabel = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endLabel = endOfWeek.toLocaleDateString('en-US', {
    month: startOfWeek.getMonth() === endOfWeek.getMonth() ? undefined : 'short',
    day: 'numeric',
  });
  const label = `${startLabel} – ${endLabel}`;

  return {
    weekStartDate: startStr,
    weekEndDate: endStr,
    periodKey,
    label,
  };
}

export function getPreviousWeekPeriod(referenceDate: Date = new Date(), weekStart: number = 1): WeekPeriod {
  const prevDate = new Date(referenceDate);
  prevDate.setDate(prevDate.getDate() - 7);
  return getWeekPeriod(prevDate, weekStart);
}

export function getNextWeekPeriod(referenceDate: Date = new Date(), weekStart: number = 1): WeekPeriod {
  const nextDate = new Date(referenceDate);
  nextDate.setDate(nextDate.getDate() + 7);
  return getWeekPeriod(nextDate, weekStart);
}

export function formatTimeDisplay(timeString: string | null | undefined): string {
  if (!timeString) return '';
  const [hoursStr, minutesStr] = timeString.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (isNaN(hours) || isNaN(minutes)) return timeString;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
}
