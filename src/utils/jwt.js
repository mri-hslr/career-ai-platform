export function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const payload = decodeJWT(token);
  if (!payload) return null;
  return {
    userId: payload.user_id,
    email:  payload.sub,
    role:   payload.role || 'student',
  };
}

function emailToFirstName(email) {
  return (
    email.split('@')[0].split('.')[0].replace(/\d+/g, '').replace(/^./, c => c.toUpperCase()) ||
    'there'
  );
}

export function getUserDisplayName() {
  const user = getCurrentUser();
  if (!user) return 'there';

  // Priority 1: real full_name stored from the server response — used by ALL roles.
  // This key is written by the dashboard after a successful profile fetch,
  // so it always matches what the backend sends as `sender` in WS broadcasts.
  const storedFullName = localStorage.getItem(`harmony_full_name_${user.userId}`);
  if (storedFullName) return storedFullName;

  // Priority 2 (students only): profile name stored at onboarding.
  if (user.role === 'student') {
    const storedId   = localStorage.getItem('harmony_profile_owner');
    const storedName = localStorage.getItem('harmony_profile_name');
    if (storedName && storedId === user.userId) return storedName;
  }

  // Priority 3: legacy mentor name key (kept for backwards compat).
  if (user.role === 'mentor') {
    const legacyName = localStorage.getItem('harmony_mentor_name');
    if (legacyName) return legacyName;
  }

  // Fallback: derive a first name from the email.
  return emailToFirstName(user.email);
}

/**
 * Call this after any successful profile fetch from the server.
 * Stores the canonical full_name so getUserDisplayName() matches
 * what the backend sends as `sender` in WebSocket broadcasts.
 *
 * Usage:
 *   import { setUserFullName } from '../utils/jwt';
 *   setUserFullName(profile.full_name);  // after getMentorProfile() / getStudentProfile()
 */
export function setUserFullName(fullName) {
  const user = getCurrentUser();
  if (!user || !fullName) return;
  localStorage.setItem(`harmony_full_name_${user.userId}`, fullName);
}

/**
 * Wipes all auth tokens AND every harmony_* key from localStorage.
 * Call this on logout and at the start of every new login.
 */
export function clearUserSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');

  const harmonyKeys = Object.keys(localStorage).filter(k => k.startsWith('harmony_'));
  harmonyKeys.forEach(k => localStorage.removeItem(k));
}