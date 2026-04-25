const SETTINGS_KEY = 'documind_app_settings';

export const DEFAULT_APP_SETTINGS = {
  llmSensitivity: 0.2,
  retrievalK: 6,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function sanitize(raw = {}) {
  const llmSensitivity = clamp(Number(raw.llmSensitivity ?? DEFAULT_APP_SETTINGS.llmSensitivity), 0, 1);
  const retrievalK = Math.round(clamp(Number(raw.retrievalK ?? DEFAULT_APP_SETTINGS.retrievalK), 2, 20));

  return {
    llmSensitivity,
    retrievalK,
  };
}

export function loadAppSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return sanitize(parsed);
  } catch {
    return { ...DEFAULT_APP_SETTINGS };
  }
}

export function saveAppSettings(nextSettings) {
  const clean = sanitize(nextSettings);
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(clean));
  return clean;
}

export function resetAppSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_APP_SETTINGS));
  return { ...DEFAULT_APP_SETTINGS };
}

export function getSensitivityProfile(value) {
  if (value <= 0.15) {
    return {
      label: 'Strict',
      description: 'Most deterministic answers with minimal creativity.',
    };
  }

  if (value <= 0.45) {
    return {
      label: 'Balanced',
      description: 'Reliable but flexible responses for everyday usage.',
    };
  }

  if (value <= 0.75) {
    return {
      label: 'Exploratory',
      description: 'Broader phrasing and more varied wording.',
    };
  }

  return {
    label: 'Creative',
    description: 'Highest variation and stylistic freedom.',
  };
}
