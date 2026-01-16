export const SizeControlManager = {
    DEFAULT_WIDTH_SCALE: 1.0,
    DEFAULT_HEIGHT_SCALE: 1.0,
    MIN_SCALE: 0.5,
    MAX_SCALE: 2.0,
    currentWidthScale: 1.0,
    currentHeightScale: 1.0,

    init() {
        this.currentWidthScale = this.DEFAULT_WIDTH_SCALE;
        this.currentHeightScale = this.DEFAULT_HEIGHT_SCALE;
        this.applyScaleToButtons();
    },

    setWidthScale(s) {
        this.currentWidthScale = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, s));
        this.applyScaleToButtons();
    },

    setHeightScale(s) {
        this.currentHeightScale = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, s));
        this.applyScaleToButtons();
    },

    applyScaleToButtons() {
        document.documentElement.style.setProperty('--button-width-scale', this.currentWidthScale);
        document.documentElement.style.setProperty('--button-height-scale', this.currentHeightScale);
    },

    reset() {
        this.setWidthScale(this.DEFAULT_WIDTH_SCALE);
        this.setHeightScale(this.DEFAULT_HEIGHT_SCALE);
    },

    getScales() {
        return { width: this.currentWidthScale, height: this.currentHeightScale };
    }
};
