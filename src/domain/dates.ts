// Level Up Planner — Date Handling Utilities
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
