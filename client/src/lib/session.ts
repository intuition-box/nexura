// Simple client-side session manager for storing and clearing the access token
type SessionChangeCb = (token: string | null) => void;

const KEY = "accessToken";
const listeners = new Set<SessionChangeCb>();

export function getSessionToken(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch (e) {
    return null;
  }
}

export function setSessionToken(token: string) {
  try {
    localStorage.setItem(KEY, token);
    listeners.forEach((cb) => cb(token));
  } catch (e) {
    // ignore
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
    listeners.forEach((cb) => cb(null));
  } catch (e) {
    // ignore
  }
}

export function onSessionChange(cb: SessionChangeCb) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

// Manually trigger session-change notifications. This is useful when the
// server sets an httpOnly cookie (so there's no accessToken saved locally)
// and we still want the app to react (fetch profile) immediately.
export function emitSessionChange() {
  const token = getSessionToken();
  listeners.forEach((cb) => cb(token));
}

export default { getSessionToken, setSessionToken, clearSession, onSessionChange };
