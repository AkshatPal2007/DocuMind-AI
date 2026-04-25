const ACTIVITY_KEY = 'documind_activity_log';
const MAX_EVENTS = 120;

export function getActivityLog() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addActivityEvent(event) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...event,
  };

  const next = [entry, ...getActivityLog()].slice(0, MAX_EVENTS);
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(next));
  return entry;
}

export function clearActivityLog() {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify([]));
}
