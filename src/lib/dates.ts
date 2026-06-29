import {
  addDays,
  format,
  parseISO,
  startOfWeek,
} from 'date-fns'
import type { DateStr } from '../types'

/** Today as an ISO day string in local time. */
export function todayStr(): DateStr {
  return format(new Date(), 'yyyy-MM-dd')
}

export function shiftDay(date: DateStr, days: number): DateStr {
  return format(addDays(parseISO(date), days), 'yyyy-MM-dd')
}

/** Human label like "Mon, Jun 29". */
export function prettyDay(date: DateStr): string {
  return format(parseISO(date), 'EEE, MMM d')
}

export function shortDay(date: DateStr): string {
  return format(parseISO(date), 'EEE')
}

export function dayNum(date: DateStr): string {
  return format(parseISO(date), 'd')
}

/** The 7 ISO day strings for the week containing `date` (week starts Monday). */
export function weekDays(date: DateStr): DateStr[] {
  const start = startOfWeek(parseISO(date), { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(start, i), 'yyyy-MM-dd'),
  )
}

export function isToday(date: DateStr): boolean {
  return date === todayStr()
}
