// ===== 👤 PROFILE COMPONENT =====

const ProfileComponent = {
    profileName: document.getElementById('profileName'),
    recentlyPlayedGrid: document.getElementById('recentlyPlayedGrid'),

    init() {
        this.loadRecentlyPlayed();
    },

    loadRecentlyPlayed() {
        if (!this.recentlyPlayedGrid) return;

        if (AppState.recentlyPlayed.length === 0) {
            this.recentlyPlayedGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-icon">🎵</div>
                    <h3>No recently played songs</h3>
                    <p>Songs you play will appear here</p>
                </div>
            `;
        } else {
            this.renderRecentlyPlayed();
        }
    },

    renderRecentlyPlayed() {
        this.recentlyPlayedGrid.innerHTML = AppState.recentlyPlayed
            .slice(0, 20) // Show last 20
            .map(song => this.createSongCard(song))
            .join('');

        this.addSongCardListeners();
    },

    createSongCard(song) {
        const isPlaying = AppState.currentSong && AppState.currentSong.id === song.id;

        return `
            <div class="song-card ${isPlaying ? 'playing' : ''}" data-song-id="${song.id}">
                <div class="song-card-image">
                    <img src="${song.thumbnail}" alt="${AppMethods.escapeHtml(song.title)}"
                         onerror="this.src='/static/placeholder.svg'">
                    <div class="play-overlay">
                        <button onclick="event.stopPropagation()">▶</button>
                    </div>
                </div>
                <div class="song-card-info">
                    <div class="song-title">${AppMethods.escapeHtml(song.title)}</div>
                    <div class="song-artist">${AppMethods.escapeHtml(song.artist || 'Unknown')}</div>
                    <div class="song-duration">${song.duration || 'N/A'}</div>
                </div>
            </div>
        `;
    },

    addSongCardListeners() {
        document.querySelectorAll('[data-song-id]').forEach(card => {
            const songId = card.dataset.songId;
            card.addEventListener('click', () => {
                const song = AppState.recentlyPlayed.find(s => s.id === songId);
                if (song && window.PlayerComponent) {
                    window.PlayerComponent.playSong(song);
                }
            });
        });
    },

    setName(name) {
        AppMethods.setProfileName(name);
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    ProfileComponent.init();
    window.ProfileComponent = ProfileComponent;
});
