/**
 * IST timezone helpers.
 *
 * The backend stores all datetimes in UTC.
 * Every display function here converts to Asia/Kolkata before formatting
 * so the user always sees IST regardless of their browser locale.
 */

const IST = 'Asia/Kolkata';

const IST_TIME_OPTS = { hour: '2-digit', minute: '2-digit', timeZone: IST };
const IST_DATE_OPTS = { month: 'short', day: 'numeric', timeZone: IST };
const IST_DATETIME_OPTS = { dateStyle: 'medium', timeStyle: 'short', timeZone: IST };

/**
 * "3:15 PM" in IST.
 * @param {string|Date} value – ISO string or Date object from the API
 */
export function toISTTime(value) {
  try {
    return new Date(value).toLocaleTimeString('en-IN', IST_TIME_OPTS);
  } catch {
    return '';
  }
}

/**
 * "Apr 3" in IST.
 */
export function toISTDate(value) {
  try {
    return new Date(value).toLocaleDateString('en-IN', IST_DATE_OPTS);
  } catch {
    return '';
  }
}

/**
 * "3 Apr 2026, 3:15 PM" in IST – used in the mentor dashboard session list.
 */
export function toISTDateTime(value) {
  try {
    return new Date(value).toLocaleString('en-IN', IST_DATETIME_OPTS);
  } catch {
    return '';
  }
}

/**
 * Returns a Date object representing "now" in IST.
 * JavaScript Date objects are always UTC internally; this just creates a
 * new Date whose numeric value is correct – useful for arithmetic
 * like "is this session within 150 seconds of now?".
 *
 * NOTE: for pure arithmetic (difference in seconds) you never need to
 * convert – Date.now() is UTC ms and the ISO strings from the API are
 * also UTC, so subtraction is timezone-independent.
 * Use this only when you need to display "now" in IST.
 */
export function nowIST() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: IST }));
}
