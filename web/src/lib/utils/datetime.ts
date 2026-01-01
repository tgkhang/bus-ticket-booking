const GMT7_TIME_ZONE = 'Asia/Ho_Chi_Minh'

function getDatePartsInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  }
}

export function formatDateTimeGmt7(dateInput: string | Date, locale: string = 'en-US') {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  return new Intl.DateTimeFormat(locale, {
    timeZone: GMT7_TIME_ZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDateOnlyGmt7(yyyyMmDd: string, locale: string = 'en-US') {
  if (!yyyyMmDd) return ''
  // Treat the date-only string as midnight UTC to avoid local timezone shifting.
  const date = new Date(`${yyyyMmDd}T00:00:00.000Z`)
  return new Intl.DateTimeFormat(locale, {
    timeZone: GMT7_TIME_ZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

// Converts an ISO datetime string (usually UTC from backend) into a datetime-local value in GMT+7.
export function isoToDatetimeLocalGmt7(isoDateTime: string) {
  const date = new Date(isoDateTime)
  const { year, month, day, hour, minute } = getDatePartsInTimeZone(date, GMT7_TIME_ZONE)
  return `${year}-${month}-${day}T${hour}:${minute}`
}

// Converts a datetime-local value that the UI treats as GMT+7 into an ISO (UTC) string.
export function datetimeLocalGmt7ToIso(datetimeLocal: string) {
  // Expected format: YYYY-MM-DDTHH:mm
  const [datePart, timePart] = datetimeLocal.split('T')
  if (!datePart || !timePart) {
    throw new Error('Invalid datetime-local value')
  }

  const [yearStr, monthStr, dayStr] = datePart.split('-')
  const [hourStr, minuteStr] = timePart.split(':')

  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  const hour = Number(hourStr)
  const minute = Number(minuteStr)

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    throw new Error('Invalid datetime-local value')
  }

  // GMT+7 -> UTC means subtract 7 hours.
  const utcMs = Date.UTC(year, month - 1, day, hour - 7, minute, 0, 0)
  return new Date(utcMs).toISOString()
}
