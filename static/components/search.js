// ===== 🔍 SEARCH COMPONENT =====

const SearchComponent = {
    searchInput: document.getElementById('searchInput'),
    searchResults: document.getElementById('searchResults'),
    searchEmpty: document.getElementById('searchEmpty'),
    loadingSpinner: document.getElementById('loadingSpinner'),

    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        this.searchInput.addEventListener('input', AppMethods.debounce((e) => {
            this.performSearch(e.target.value);
        }, 500));
    },

    async performSearch(query) {
        if (!query.trim()) {
            this.showEmpty();
            return;
        }

        this.showLoading();

        try {
            const response = await fetch(`/search?q=${encodeURIComponent(query)}`);

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const songs = await response.json();
            AppState.playlist = songs;

            if (songs.length === 0) {
                this.showEmpty();
            } else {
                this.renderResults(songs);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Failed to search songs');
        } finally {
            this.hideLoading();
        }
    },

    renderResults(songs) {
        this.searchResults.innerHTML = songs
            .map(song => this.createSongCard(song))
            .join('');

        // Add click handlers
        document.querySelectorAll('.song-card').forEach(card => {
            card.addEventListener('click', () => {
                const songId = card.dataset.songId;
                const song = songs.find(s => s.id === songId);
                if (song && window.PlayerComponent) {
                    window.PlayerComponent.playSong(song);
                }
            });
        });

        this.searchEmpty.classList.remove('active');
        this.searchResults.style.display = 'grid';
    },

    createSongCard(song) {
        const isLiked = AppMethods.isSongLiked(song.id);
        const isPlaying = AppState.currentSong && AppState.currentSong.id === song.id;

        return `
            <div class="song-card ${isPlaying ? 'playing' : ''} ${isLiked ? 'liked' : ''}" data-song-id="${song.id}">
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

    showEmpty() {
        this.searchEmpty.classList.add('active');
        this.searchResults.innerHTML = '';
        this.searchResults.style.display = 'none';
    },

    showError(message) {
        this.searchEmpty.innerHTML = `
            <div class="empty-icon">⚠️</div>
            <h2>Oops!</h2>
            <p>${AppMethods.escapeHtml(message)}</p>
        `;
        this.searchEmpty.classList.add('active');
    },

    showLoading() {
        this.loadingSpinner.classList.remove('hidden');
    },

    hideLoading() {
        this.loadingSpinner.classList.add('hidden');
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    SearchComponent.init();
    window.SearchComponent = SearchComponent;
});
