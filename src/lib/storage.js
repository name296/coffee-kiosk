export const safeSessionStorage = {
    getItem: (key, defaultValue = null) => {
        try {
            if (typeof window === "undefined" || !window.sessionStorage) return defaultValue;
            const v = window.sessionStorage.getItem(key);
            return v !== null ? v : defaultValue;
        } catch {
            return defaultValue;
        }
    },
    setItem: (key, value) => {
        try {
            if (typeof window === "undefined" || !window.sessionStorage) return false;
            window.sessionStorage.setItem(key, String(value));
            return true;
        } catch {
            return false;
        }
    },
    removeItem: (key) => {
        try {
            if (typeof window === "undefined" || !window.sessionStorage) return false;
            window.sessionStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    }
};

export const safeLocalStorage = {
    getItem: (key, defaultValue = null) => {
        try {
            if (typeof window === 'undefined' || !window.localStorage) return defaultValue;
            const v = window.localStorage.getItem(key);
            return v !== null ? v : defaultValue;
        } catch { return defaultValue; }
    },
    setItem: (key, value) => {
        try {
            if (typeof window === 'undefined' || !window.localStorage) return false;
            window.localStorage.setItem(key, String(value));
            return true;
        } catch { return false; }
    },
    removeItem: (key) => {
        try {
            if (typeof window === 'undefined' || !window.localStorage) return false;
            window.localStorage.removeItem(key);
            return true;
        } catch { return false; }
    }
};
