// ===== ⚙️ SETTINGS COMPONENT =====

const SettingsComponent = {
    darkThemeToggle: document.getElementById('darkThemeToggle'),
    autoplayToggle: document.getElementById('autoplayToggle'),
    defaultVolumeSlider: document.getElementById('defaultVolumeSlider'),

    init() {
        this.loadSettings();
        this.setupEventListeners();
    },

    setupEventListeners() {
        this.darkThemeToggle.addEventListener('change', (e) => this.toggleTheme(e.target.checked));
        this.autoplayToggle.addEventListener('change', (e) => this.toggleAutoplay(e.target.checked));
        this.defaultVolumeSlider.addEventListener('change', (e) => this.setDefaultVolume(e.target.value));
    },

    loadSettings() {
        // Dark theme is always on
        this.darkThemeToggle.checked = true;

        // Load autoplay setting
        this.autoplayToggle.checked = AppState.autoplay;

        // Load default volume
        this.defaultVolumeSlider.value = AppState.defaultVolume;
    },

    toggleTheme(isDark) {
        // Always dark theme
        AppState.profile.theme = 'dark';
        AppMethods.saveState();
    },

    toggleAutoplay(enabled) {
        AppState.autoplay = enabled;
        AppMethods.saveState();
    },

    setDefaultVolume(volume) {
        AppState.defaultVolume = parseInt(volume);
        AppMethods.saveState();
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    SettingsComponent.init();
    window.SettingsComponent = SettingsComponent;
});
