const STORAGE_KEY = "ep_user_activities";
const MAX_ACTIVITIES = 10;

export function logActivity(type, title, meta = "") {
  try {
    let existing = getActivities();
    existing = existing.filter((a) => a.type !== type);
    const newActivity = {
      id: Date.now(),
      type,
      title,
      meta,
      time: new Date().toISOString(),
    };
    const updated = [newActivity, ...existing].slice(0, MAX_ACTIVITIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
  }
}

// Only logs "Signed in" if last login activity was more than 1 hour ago
export function logLoginIfNewSession() {
  try {
    const existing = getActivities();
    const lastLogin = existing.find((a) => a.type === "login");
    const oneHour = 60 * 60 * 1000;
    if (!lastLogin || Date.now() - new Date(lastLogin.time).getTime() > oneHour) {
      logActivity("login", "Signed in", "Account");
    }
  } catch (e) {
    // silently fail
  }
}

export function getActivities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const seen = new Set();
    const deduped = [];
    for (const item of list) {
      if (!seen.has(item.type)) {
        seen.add(item.type);
        deduped.push(item);
      }
    }
    return deduped;
  } catch {
    return [];
  }
}

export function clearActivities() {
  localStorage.removeItem(STORAGE_KEY);
}
