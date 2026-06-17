export const INTERACTIVE_SELECTOR = [
    "button:not([disabled])",
    "a[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex=\"-1\"])",
    ".button-like",
].join(", ");

/** gap 디버그: mousedown 액션 대상만 (부모 섹션 포커스 제외) */
export const GAP_ACTION_SELECTOR = [
    "button:not([disabled])",
    ".button-like",
    "a[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
].join(", ");

/** bbox 디버그: gap과 동일 대상 + disabled·focus-exclude 버튼 포함 */
export const BBOX_ACTION_SELECTOR = [
    "button",
    ".button-like",
    "a[href]",
    "input",
    "select",
    "textarea",
].join(", ");

/** useFocusNavigation 섹션 부모 — tabindex만 있고 mousedown 액션 없음 */
export const isSectionFocusParent = (el) =>
    Boolean(
        el?.matches?.(
            ".main, .modal-panel, .order-row, [data-tts-text]:not(.button):not(.button-like)"
        )
    );

const isVisible = (el) => {
    for (let node = el; node; node = node.parentElement) {
        const style = window.getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden") return false;
    }
    return true;
};

export { isVisible };

export const isTrackableInteractive = (el) => {
    if (!el.closest(".process, .modal")) return false;
    if (!isVisible(el)) return false;
    if (el.dataset?.focusExclude === "true") return false;
    if (el.closest("[aria-hidden=\"true\"]")) return false;
    if (el.closest("[inert]")) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
};

export const isGapTrackableInteractive = (el) => {
    if (!el?.matches?.(GAP_ACTION_SELECTOR)) return false;
    if (isSectionFocusParent(el)) return false;
    return isTrackableInteractive(el);
};

export const isBboxTrackableInteractive = (el) => {
    if (!el?.matches?.(BBOX_ACTION_SELECTOR)) return false;
    if (isSectionFocusParent(el)) return false;
    if (!el.closest(".process, .modal")) return false;
    if (!isVisible(el)) return false;
    if (el.closest("[aria-hidden=\"true\"]")) return false;
    if (el.closest("[inert]")) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
};

const BUTTON_TARGET_SELECTOR = "button, .button, .button-like, [role=\"button\"]";

export const isButtonActionTarget = (el) => Boolean(el?.matches?.(BUTTON_TARGET_SELECTOR));

/** bbox 디버그용 — Button.js·CSS 기준 현재 감지 가능한 상태 */
export const getButtonInteractionStates = (el, { activeElement = document.activeElement } = {}) => {
    if (!isButtonActionTarget(el)) return [];

    const states = [];
    if (el.getAttribute("aria-disabled") === "true") states.push("disabled");
    if (el === activeElement) states.push("focused");
    if (el.matches(":hover")) states.push("hover");
    if (el.classList.contains("state-pressing")) states.push("pressing");
    if (el.classList.contains("toggle") && el.classList.contains("state-pressed")) {
        states.push("selected");
    } else if (el.getAttribute("aria-pressed") === "true") {
        states.push("selected");
    } else if (el.classList.contains("state-pressed") && !el.classList.contains("toggle")) {
        states.push("pressed");
    }
    return states;
};

const getButtonSupportedRawStates = (el) => {
    if (!isButtonActionTarget(el)) return [];

    let supported;
    if (el.matches(".button")) {
        supported = new Set(["disabled", "pressing"]);
        supported.add(el.classList.contains("toggle") ? "selected" : "pressed");
    } else if (el.matches("button")) {
        supported = new Set(["disabled", "pressing", "pressed"]);
    } else {
        return [];
    }

    return ["selected", "pressing", "pressed", "disabled"].filter((state) => supported.has(state));
};

/** bbox 디버그용 — 요소 타입별 지원 상태 (press = pressing|pressed 통합, 순서: s → p → d) */
export const getButtonSupportedStates = (el) => {
    const raw = new Set(getButtonSupportedRawStates(el));
    const display = [];
    if (raw.has("selected")) display.push("selected");
    if (raw.has("pressing") || raw.has("pressed")) display.push("press");
    if (raw.has("disabled")) display.push("disabled");
    return display;
};

const BUTTON_STATE_ABBREV = {
    selected: "s",
    press: "p",
    disabled: "d",
};

const toActiveDisplayStates = (rawActive, supportedDisplay) => {
    const supported = new Set(supportedDisplay);
    const active = new Set();
    if (supported.has("selected") && rawActive.includes("selected")) active.add("selected");
    if (supported.has("press") && (rawActive.includes("pressing") || rawActive.includes("pressed"))) {
        active.add("press");
    }
    if (supported.has("disabled") && rawActive.includes("disabled")) active.add("disabled");
    return active;
};

const getButtonStateLabelItems = (el, { activeElement = document.activeElement } = {}) => {
    const supported = getButtonSupportedStates(el);
    if (supported.length === 0) return { display: [], activeSet: new Set() };

    const activeSet = toActiveDisplayStates(
        getButtonInteractionStates(el, { activeElement }),
        supported
    );

    if (activeSet.has("disabled")) {
        return { display: ["disabled"], activeSet };
    }

    return {
        display: supported.filter((state) => state !== "disabled"),
        activeSet,
    };
};

/** bbox 디버그용 — 지원 상태 1글자 약어 라벨 (disabled 활성 시 d만, 비활성 시 d 미표시) */
export const formatButtonSupportedStateLabel = (el, options = {}) => {
    const { display } = getButtonStateLabelItems(el, options);
    if (display.length === 0) return "";
    return display.map((state) => BUTTON_STATE_ABBREV[state] ?? state).join(", ");
};

/** bbox 디버그용 — 지원 상태 라벨 DOM (현재 활성 bold, disabled 규칙 동일) */
export const mountButtonSupportedStateLabel = (parent, el, options = {}) => {
    const { display, activeSet } = getButtonStateLabelItems(el, options);
    if (display.length === 0) return false;

    for (const [index, state] of display.entries()) {
        if (index > 0) parent.appendChild(document.createTextNode(", "));
        const span = document.createElement("span");
        span.textContent = BUTTON_STATE_ABBREV[state] ?? state;
        if (activeSet.has(state)) span.style.fontWeight = "bold";
        parent.appendChild(span);
    }
    return true;
};

/** 포커스 탐색 순서 (useFocusElementFinder·useFocusNavigation과 동일) */
export const FOCUSABLE_SELECTOR = [
    "button:not([disabled])",
    "a[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex=\"-1\"])",
].join(", ");

const isProcessShell = (el) =>
    Boolean(el?.classList?.contains("process") && el.querySelector?.(".main"));

const dedupeFocusOrder = (list) => {
    const seen = new Set();
    const out = [];
    for (const el of list) {
        if (el && !seen.has(el)) {
            seen.add(el);
            out.push(el);
        }
    }
    return out;
};

/** @returns {Element[]} */
export const getFocusableElements = () => {
    const elements = Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR))
        .filter((el) => isVisible(el))
        .filter((el) => el.dataset?.focusExclude !== "true")
        .filter((el) => !isProcessShell(el));

    const modalElements = document.querySelectorAll(".modal");
    const processMain = document.querySelector(".process .main");
    const modalMains = Array.from(modalElements)
        .map((el) => el.querySelector(".modal-panel"))
        .filter(Boolean);
    const modalMain = modalMains.length ? modalMains[modalMains.length - 1] : null;
    const prepend = [];

    if (modalMain && isVisible(modalMain)) prepend.push(modalMain);
    if (processMain && isVisible(processMain)) prepend.push(processMain);
    if (prepend.length) {
        elements.unshift(...prepend);
    }

    return dedupeFocusOrder(elements);
};

/** 좌우 방향키 탐색과 동일 — 모달 열림 시 모달 내만, 아니면 모달 밖만 */
export const getScopedFocusableElements = () => {
    const allFocusable = getFocusableElements();
    const modalElements = document.querySelectorAll(".modal");
    const topmostModal = modalElements.length ? modalElements[modalElements.length - 1] : null;
    if (topmostModal) {
        return allFocusable.filter((el) => topmostModal.contains(el));
    }
    return allFocusable.filter((el) => !el.closest(".modal"));
};

/** focusin 시 재생되는 TTS 문구 (useTTSInteraction과 동일 규칙) */
export const getFocusTtsText = (el) => {
    if (!el) return "";

    const btn = el.closest?.(".button, .button-like");
    if (btn) {
        return btn.dataset?.ttsText?.trim() || "";
    }

    if (el.matches?.("[data-tts-text]")) {
        return el.dataset?.ttsText?.trim() || "";
    }

    if (el.matches?.(".main, .modal-panel")) {
        return el.dataset?.ttsText?.trim() || "";
    }

    return "";
};

export const getInteractiveLabel = (el) => {
    const fromAria = el.getAttribute("aria-label");
    if (fromAria) return fromAria.replace(/\s+/g, " ").slice(0, 24);
    const fromTts = el.dataset?.ttsText;
    if (fromTts) return fromTts.replace(/\s+/g, " ").slice(0, 24);
    const text = el.textContent?.trim().replace(/\s+/g, " ");
    if (text) return text.slice(0, 24);
    return el.tagName.toLowerCase();
};

/** @returns {{ el: Element, r: DOMRect }[]} */
export const collectInteractiveItems = ({ leavesOnly = true } = {}) => {
    const all = [];
    for (const el of document.querySelectorAll(INTERACTIVE_SELECTOR)) {
        if (!isTrackableInteractive(el)) continue;
        all.push({ el, r: el.getBoundingClientRect() });
    }
    if (!leavesOnly) return all;
    return all.filter((item) => !all.some((other) => other.el !== item.el && item.el.contains(other.el)));
};

/** @returns {{ el: Element, r: DOMRect }[]} */
export const collectBBoxInteractiveItems = ({ leavesOnly = true } = {}) => {
    const all = [];
    for (const el of document.querySelectorAll(BBOX_ACTION_SELECTOR)) {
        if (!isBboxTrackableInteractive(el)) continue;
        all.push({ el, r: el.getBoundingClientRect() });
    }
    if (!leavesOnly) return all;
    return all.filter((item) => !all.some((other) => other.el !== item.el && item.el.contains(other.el)));
};

/** @returns {{ el: Element, r: DOMRect }[]} */
export const collectGapInteractiveItems = ({ leavesOnly = true } = {}) => {
    const all = [];
    for (const el of document.querySelectorAll(GAP_ACTION_SELECTOR)) {
        if (!isGapTrackableInteractive(el)) continue;
        all.push({ el, r: el.getBoundingClientRect() });
    }
    if (!leavesOnly) return all;
    return all.filter((item) => !all.some((other) => other.el !== item.el && item.el.contains(other.el)));
};

export const centerX = (r) => r.left + r.width / 2;
export const centerY = (r) => r.top + r.height / 2;

export const verticalOverlap = (a, b) => Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
export const horizontalOverlap = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left);
