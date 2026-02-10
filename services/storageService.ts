
const APP_PREFIX = 'OIKOS_LMS_V1.1_';

export const storageService = {
  // Save to LocalStorage
  save: (key: string, data: any) => {
    try {
      localStorage.setItem(`${APP_PREFIX}${key}`, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save to local storage:', e);
      return false;
    }
  },

  // Load from LocalStorage
  load: <T>(key: string, defaultValue: T): T => {
    try {
      const data = localStorage.getItem(`${APP_PREFIX}${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn('Load failed, using default value:', e);
      return defaultValue;
    }
  },

  // Export for backup
  exportAll: () => {
    const allData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(APP_PREFIX)) {
        const cleanKey = key.replace(APP_PREFIX, '');
        allData[cleanKey] = JSON.parse(localStorage.getItem(key) || 'null');
      }
    }
    return allData;
  },

  // Clear all data
  clear: () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(APP_PREFIX)) keysToRemove.push(key);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }
};
