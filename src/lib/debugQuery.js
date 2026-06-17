export const DEFAULT_GAP_DISPLAY_MAX = 32;

const BBOX_STORAGE_KEY = "coffee-kiosk:debug-bbox";
const GAP_STORAGE_KEY = "coffee-kiosk:debug-gap";
const TEXT_STORAGE_KEY = "coffee-kiosk:debug-text";
const FOCUS_TARGET_STORAGE_KEY = "coffee-kiosk:debug-focus";
const IMAGE_STORAGE_KEY = "coffee-kiosk:debug-image";

const getSearchParams = () => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search);
};

/** @returns {{ enabled: true, max: number } | null} */
export const parseGapDebugSpec = (raw) => {
    if (!raw) return null;
    if (raw === "gap") return { enabled: true, max: DEFAULT_GAP_DISPLAY_MAX };
    if (!raw.startsWith("gap=")) return null;
    const max = parseFloat(raw.slice(4));
    if (!Number.isFinite(max) || max <= 0) {
        return { enabled: true, max: DEFAULT_GAP_DISPLAY_MAX };
    }
    return { enabled: true, max };
};

const readStoredGapSpec = () => {
    try {
        const stored = localStorage.getItem(GAP_STORAGE_KEY);
        if (!stored) return null;
        return parseGapDebugSpec(stored) ?? (stored === "1" ? { enabled: true, max: DEFAULT_GAP_DISPLAY_MAX } : null);
    } catch {
        return null;
    }
};

const readLegacyGapSpec = () => {
    const legacy = getSearchParams()?.get("gap-debug");
    if (legacy == null) return null;
    if (legacy === "1") return { enabled: true, max: DEFAULT_GAP_DISPLAY_MAX };
    const max = parseFloat(legacy);
    if (Number.isFinite(max) && max > 0) return { enabled: true, max };
    return { enabled: true, max: DEFAULT_GAP_DISPLAY_MAX };
};

const readQueryDebug = () => getSearchParams()?.get("debug");

/** @returns {"bbox"|"layout"|null} */
export const getLayoutDebugMode = () => {
    const fromQuery = readQueryDebug();
    if (fromQuery === "bbox" || fromQuery === "layout") return fromQuery;
    if (fromQuery) return null;

    try {
        const stored = localStorage.getItem(BBOX_STORAGE_KEY);
        if (stored === "bbox" || stored === "layout") return stored;
    } catch {
        /* storage unavailable */
    }
    return null;
};

export const isGapDebugEnabled = () => {
    const fromQuery = readQueryDebug();
    if (fromQuery) return Boolean(parseGapDebugSpec(fromQuery));
    if (readLegacyGapSpec()) return true;
    return Boolean(readStoredGapSpec());
};

export const isTextDebugEnabled = () => {
    const fromQuery = readQueryDebug();
    if (fromQuery) return fromQuery === "text";
    if (getSearchParams()?.get("text-debug") === "1") return true;
    try {
        return localStorage.getItem(TEXT_STORAGE_KEY) === "text";
    } catch {
        return false;
    }
};

export const isFocusTargetDebugEnabled = () => {
    const fromQuery = readQueryDebug();
    if (fromQuery) return fromQuery === "focus";
    try {
        return localStorage.getItem(FOCUS_TARGET_STORAGE_KEY) === "focus";
    } catch {
        return false;
    }
};

export const isImageDebugEnabled = () => {
    const fromQuery = readQueryDebug();
    if (fromQuery) return fromQuery === "image";
    try {
        return localStorage.getItem(IMAGE_STORAGE_KEY) === "image";
    } catch {
        return false;
    }
};

export const getGapDisplayMax = () => {
    const fromQuery = parseGapDebugSpec(readQueryDebug());
    if (fromQuery) return fromQuery.max;
    const fromLegacy = readLegacyGapSpec();
    if (fromLegacy) return fromLegacy.max;
    const fromStorage = readStoredGapSpec();
    if (fromStorage) return fromStorage.max;
    return DEFAULT_GAP_DISPLAY_MAX;
};

export function isFocusDebugEnabled() {
    return (
        getLayoutDebugMode() !== null
        || isGapDebugEnabled()
        || isTextDebugEnabled()
        || isFocusTargetDebugEnabled()
        || isImageDebugEnabled()
    );
}

export function setFocusDebugEnabled(enabled) {
    try {
        if (enabled) localStorage.setItem(BBOX_STORAGE_KEY, "bbox");
        else localStorage.removeItem(BBOX_STORAGE_KEY);
    } catch {
        /* storage unavailable */
    }
    window.dispatchEvent(new CustomEvent("coffee-kiosk:focus-debug-change", { detail: { enabled, mode: "bbox" } }));
}

export function setGapDebugEnabled(enabled, max = DEFAULT_GAP_DISPLAY_MAX) {
    try {
        if (enabled) {
            localStorage.setItem(
                GAP_STORAGE_KEY,
                max === DEFAULT_GAP_DISPLAY_MAX ? "gap" : `gap=${max}`
            );
        } else {
            localStorage.removeItem(GAP_STORAGE_KEY);
        }
    } catch {
        /* storage unavailable */
    }
    window.dispatchEvent(new CustomEvent("coffee-kiosk:gap-debug-change", { detail: { enabled, max } }));
}

export function setTextDebugEnabled(enabled) {
    try {
        if (enabled) localStorage.setItem(TEXT_STORAGE_KEY, "text");
        else localStorage.removeItem(TEXT_STORAGE_KEY);
    } catch {
        /* storage unavailable */
    }
    window.dispatchEvent(new CustomEvent("coffee-kiosk:text-debug-change", { detail: { enabled } }));
}

export function setFocusTargetDebugEnabled(enabled) {
    try {
        if (enabled) localStorage.setItem(FOCUS_TARGET_STORAGE_KEY, "focus");
        else localStorage.removeItem(FOCUS_TARGET_STORAGE_KEY);
    } catch {
        /* storage unavailable */
    }
    window.dispatchEvent(new CustomEvent("coffee-kiosk:focus-target-debug-change", { detail: { enabled } }));
}

export function setImageDebugEnabled(enabled) {
    try {
        if (enabled) localStorage.setItem(IMAGE_STORAGE_KEY, "image");
        else localStorage.removeItem(IMAGE_STORAGE_KEY);
    } catch {
        /* storage unavailable */
    }
    window.dispatchEvent(new CustomEvent("coffee-kiosk:image-debug-change", { detail: { enabled } }));
}

export const getActiveDebugModes = () => ({
    bbox: getLayoutDebugMode() !== null,
    gap: isGapDebugEnabled(),
    text: isTextDebugEnabled(),
    focus: isFocusTargetDebugEnabled(),
    image: isImageDebugEnabled(),
    gapMax: getGapDisplayMax(),
    debug: readQueryDebug(),
});
