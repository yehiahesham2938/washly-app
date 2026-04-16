const { buildSlotsInRange } = require('./timeSlots');

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ALL_WEEKDAYS = [...DAY_ORDER];

function sortWeekdays(days) {
  return [...new Set(days)].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
}

function parseWeekdayToken(s) {
  const t = String(s).trim();
  if (t.length < 3) return null;
  const head = t.slice(0, 3);
  const hit = DAY_ORDER.find((d) => d.toLowerCase() === head.toLowerCase());
  return hit ?? null;
}

function expandDayPrefix(prefix) {
  const norm = String(prefix)
    .replace(/\s+/g, ' ')
    .replace(/[—]/g, '–')
    .trim();
  if (!norm) return [...ALL_WEEKDAYS];

  const chunks = norm.split(',').map((c) => c.trim()).filter(Boolean);
  const out = [];

  for (const chunk of chunks) {
    const parts = chunk.split(/\s*[–-]\s*/).map((p) => p.trim());
    if (parts.length === 2 && parts[0] && parts[1]) {
      const a = parseWeekdayToken(parts[0]);
      const b = parseWeekdayToken(parts[1]);
      if (a && b) {
        const i0 = DAY_ORDER.indexOf(a);
        const i1 = DAY_ORDER.indexOf(b);
        if (i0 <= i1) {
          for (let i = i0; i <= i1; i++) out.push(DAY_ORDER[i]);
        } else {
          for (let i = i0; i <= 6; i++) out.push(DAY_ORDER[i]);
          for (let i = 0; i <= i1; i++) out.push(DAY_ORDER[i]);
        }
        continue;
      }
    }
    const one = parseWeekdayToken(chunk);
    if (one) out.push(one);
  }

  return sortWeekdays([...new Set(out)]);
}

function parseWorkingDaysFromHours(hours) {
  const s = String(hours ?? '').trim();
  if (!s) return [...ALL_WEEKDAYS];
  const colon = s.indexOf(':');
  if (colon < 0) return [...ALL_WEEKDAYS];
  const prefix = s.slice(0, colon).trim();
  if (!prefix) return [...ALL_WEEKDAYS];
  const expanded = expandDayPrefix(prefix);
  return expanded.length ? expanded : [...ALL_WEEKDAYS];
}

function stripDayPrefixFromHours(hours) {
  return String(hours ?? '').replace(/^[^:]+:\s*/, '').trim();
}

function stripDaySummaryFromHoursShort(s) {
  const t = String(s ?? '').trim();
  if (!t) return t;
  if (t.includes('·')) return t.split('·').pop()?.trim() ?? t;
  return t;
}

function to24h(hour12, minute, mer) {
  const pm = String(mer).toUpperCase() === 'PM';
  const am = String(mer).toUpperCase() === 'AM';
  let h = hour12;
  if (am) {
    if (hour12 === 12) h = 0;
  } else if (pm) {
    if (hour12 !== 12) h = hour12 + 12;
  }
  return { h, m: minute };
}

function toHHmm(t) {
  return `${String(t.h).padStart(2, '0')}:${String(t.m).padStart(2, '0')}`;
}

function parseDailyHoursToTimeInputs(hours, hoursShort) {
  const fromShort = hoursShort && String(hoursShort).trim() ? String(hoursShort).trim() : '';
  const raw =
    stripDaySummaryFromHoursShort(fromShort) || stripDayPrefixFromHours(hours || '');
  const m = raw.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–\u2013\-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i
  );
  if (!m) {
    return { open: '09:00', close: '18:00' };
  }
  const h1 = Number.parseInt(m[1], 10);
  const min1 = Number.parseInt(m[2], 10);
  const h2 = Number.parseInt(m[4], 10);
  const min2 = Number.parseInt(m[5], 10);
  const o24 = to24h(h1, min1, m[3]);
  const c24 = to24h(h2, min2, m[6]);
  return { open: toHHmm(o24), close: toHHmm(c24) };
}

function openCloseToMinutes(center) {
  const { open, close } = parseDailyHoursToTimeInputs(center.hours, center.hoursShort);
  const [oh, om] = open.split(':').map((x) => Number.parseInt(x, 10));
  const [ch, cm] = close.split(':').map((x) => Number.parseInt(x, 10));
  return { openMin: oh * 60 + om, closeMin: ch * 60 + cm };
}

function ymdToWeekday(ymd) {
  const [y, m, d] = String(ymd).split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const map = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return map[dt.getUTCDay()];
}

function getWorkingDaysFromCenter(center) {
  if (Array.isArray(center.workingDays) && center.workingDays.length > 0) {
    return sortWeekdays(center.workingDays.filter((d) => DAY_ORDER.includes(d)));
  }
  return parseWorkingDaysFromHours(center.hours);
}

function isYmdOpenForCenter(center, ymd) {
  return getWorkingDaysFromCenter(center).includes(ymdToWeekday(ymd));
}

/**
 * Bookable slot labels for this center on yyyy-MM-dd (empty if closed).
 * Must match client `getCenterTimeSlotsForYmd`.
 */
function getCenterSlotsForYmd(center, ymd) {
  if (!isYmdOpenForCenter(center, ymd)) return [];
  const { openMin, closeMin } = openCloseToMinutes(center);
  return buildSlotsInRange(openMin, closeMin);
}

module.exports = {
  getCenterSlotsForYmd,
  getWorkingDaysFromCenter,
  ymdToWeekday,
};
