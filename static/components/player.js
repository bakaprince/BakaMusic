// ===== 🎧 PLAYER COMPONENT =====

const PlayerComponent = {
    // DOM elements
    playerBar: document.getElementById('playerBar'),
    playerEmbed: document.getElementById('playerEmbed'),
    playerTitle: document.getElementById('playerTitle'),
    playerArtist: document.getElementById('playerArtist'),
    playerThumb: document.getElementById('playerThumb'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    nextBtn: document.getElementById('nextBtn'),
    prevBtn: document.getElementById('prevBtn'),
    progressBar: document.getElementById('progressBar'),
    progressFill: document.getElementById('progressFill'),
    currentTimeDisplay: document.getElementById('currentTime'),
    totalTimeDisplay: document.getElementById('totalTime'),
    volumeSlider: document.getElementById('volumeSlider'),
    muteBtn: document.getElementById('muteBtn'),
    likeBtn: document.getElementById('likeBtn'),

    // State
    trackingInterval: null,

    init() {
        this.setupEventListeners();
        this.updateVolumeDisplay();
    },

    setupEventListeners() {
        // Play/Pause
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());

        // Next/Previous
        this.nextBtn.addEventListener('click', () => this.nextTrack());
        this.prevBtn.addEventListener('click', () => this.previousTrack());

        // Progress bar
        this.progressBar.addEventListener('click', (e) => this.seek(e));

        // Volume
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.muteBtn.addEventListener('click', () => this.toggleMute());

        // Like button
        this.likeBtn.addEventListener('click', () => this.toggleLike());
    },

    // ===== PLAYBACK CONTROL =====
    playSong(song) {
        AppState.currentSong = song;
        AppState.currentIndex = AppState.playlist.findIndex(s => s.id === song.id);

        // Update UI
        this.playerTitle.textContent = AppState.escapeHtml ? AppMethods.escapeHtml(song.title) : song.title;
        this.playerArtist.textContent = AppMethods.escapeHtml(song.artist || 'Unknown');
        this.playerThumb.src = song.thumbnail || '/static/placeholder.svg';

        // Embed YouTube player
        this.playerEmbed.innerHTML = `
            <iframe
                id="youtubePlayer"
                width="0"
                height="0"
                src="https://www.youtube.com/embed/${song.id}?autoplay=1&controls=0&enablejsapi=1"
                allow="autoplay; encrypted-media"
                style="border: none;"
            ></iframe>
        `;

        AppState.isPlaying = true;
        this.updatePlayPauseButton();

        // Add to recently played
        AppMethods.addToRecentlyPlayed(song);

        // Add to library
        AppMethods.addToLibrary(song);

        // Start progress tracking
        this.startProgressTracking();

        // Update like button state
        this.updateLikeButton();

        // Highlight playing song
        this.highlightCurrentSong();
    },

    togglePlayPause() {
        if (!AppState.currentSong) {
            if (AppState.playlist.length > 0) {
                this.playSong(AppState.playlist[0]);
            }
            return;
        }

        AppState.isPlaying = !AppState.isPlaying;
        this.updatePlayPauseButton();

        // Note: YouTube iframe embed doesn't support play/pause via JS
        // This is a limitation of the embedded player
    },

    updatePlayPauseButton() {
        if (AppState.isPlaying) {
            this.playIcon.style.display = 'none';
            this.pauseIcon.style.display = 'block';
        } else {
            this.playIcon.style.display = 'block';
            this.pauseIcon.style.display = 'none';
        }
    },

    nextTrack() {
        if (AppState.playlist.length === 0) return;

        let nextIndex = AppState.currentIndex + 1;
        if (nextIndex >= AppState.playlist.length) {
            nextIndex = 0;
        }

        this.playSong(AppState.playlist[nextIndex]);
    },

    previousTrack() {
        if (AppState.playlist.length === 0) return;

        let prevIndex = AppState.currentIndex - 1;
        if (prevIndex < 0) {
            prevIndex = AppState.playlist.length - 1;
        }

        this.playSong(AppState.playlist[prevIndex]);
    },

    // ===== PROGRESS & TIME =====
    startProgressTracking() {
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
        }

        this.trackingInterval = setInterval(() => {
            if (!AppState.isPlaying) {
                return;
            }

            AppState.currentTime += 0.1;

            // Default 3-minute duration if not set
            if (!AppState.duration || AppState.duration === 0) {
                AppState.duration = 180;
                this.totalTimeDisplay.textContent = AppMethods.formatTime(180);
            }

            this.updateProgressDisplay();

            // Check if song ended
            if (AppState.currentTime >= AppState.duration - 1) {
                this.handleSongEnd();
                clearInterval(this.trackingInterval);
            }
        }, 100);
    },

    updateProgressDisplay() {
        if (!AppState.duration || AppState.duration === 0) return;

        const percent = (AppState.currentTime / AppState.duration) * 100;
        this.progressFill.style.width = percent + '%';
        this.currentTimeDisplay.textContent = AppMethods.formatTime(AppState.currentTime);
    },

    seek(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * AppState.duration;
        AppState.currentTime = newTime;
        this.updateProgressDisplay();
    },

    handleSongEnd() {
        if (AppState.autoplay || document.getElementById('autoplayToggle').checked) {
            this.nextTrack();
        } else {
            AppState.isPlaying = false;
            this.updatePlayPauseButton();
        }
    },

    // ===== VOLUME CONTROL =====
    setVolume(value) {
        AppState.volume = parseInt(value);
        this.updateVolumeDisplay();
    },

    updateVolumeDisplay() {
        this.volumeSlider.value = AppState.volume;

        // Update mute button state
        if (AppState.volume === 0) {
            this.muteBtn.style.color = 'var(--accent-cyan)';
        } else {
            this.muteBtn.style.color = 'inherit';
        }
    },

    toggleMute() {
        if (AppState.volume > 0) {
            this.setVolume(0);
        } else {
            this.setVolume(70);
        }
    },

    // ===== LIKE BUTTON =====
    toggleLike() {
        if (!AppState.currentSong) return;
        const isLiked = AppMethods.toggleLikeSong(AppState.currentSong);
        this.updateLikeButton();
    },

    updateLikeButton() {
        if (!AppState.currentSong) return;

        const isLiked = AppMethods.isSongLiked(AppState.currentSong.id);
        if (isLiked) {
            this.likeBtn.classList.add('liked');
            this.likeBtn.style.color = 'var(--accent-pink)';
        } else {
            this.likeBtn.classList.remove('liked');
            this.likeBtn.style.color = 'inherit';
        }
    },

    // ===== HIGHLIGHT CURRENT SONG =====
    highlightCurrentSong() {
        document.querySelectorAll('.song-card').forEach(card => {
            if (card.dataset.songId === AppState.currentSong.id) {
                card.classList.add('playing');
            } else {
                card.classList.remove('playing');
            }
        });
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    PlayerComponent.init();
    window.PlayerComponent = PlayerComponent;
});
