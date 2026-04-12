// ===== 📋 PLAYLIST COMPONENT =====

const PlaylistComponent = {
    playlistsList: document.getElementById('playlistsList'),
    playlistsEmpty: document.getElementById('playlistsEmpty'),
    createPlaylistBtn: document.getElementById('createPlaylistBtn'),
    likedGrid: document.getElementById('likedGrid'),
    likedEmpty: document.getElementById('likedEmpty'),
    likedCount: document.getElementById('likedCount'),
    libraryGrid: document.getElementById('libraryGrid'),
    libraryEmpty: document.getElementById('libraryEmpty'),

    init() {
        this.setupEventListeners();
        this.loadPlaylists();
        this.loadLikedSongs();
        this.loadLibrary();
    },

    setupEventListeners() {
        this.createPlaylistBtn.addEventListener('click', () => this.showCreatePlaylistDialog());
    },

    // ===== PLAYLISTS =====
    loadPlaylists() {
        if (AppState.playlists.length === 0) {
            this.playlistsEmpty.classList.add('active');
            this.playlistsList.innerHTML = '';
        } else {
            this.playlistsEmpty.classList.remove('active');
            this.renderPlaylists();
        }
    },

    renderPlaylists() {
        this.playlistsList.innerHTML = AppState.playlists
            .map(playlist => this.createPlaylistCard(playlist))
            .join('');

        // Add click handlers
        document.querySelectorAll('.playlist-card').forEach(card => {
            card.addEventListener('click', () => {
                const playlistId = card.dataset.playlistId;
                this.viewPlaylist(playlistId);
            });
        });
    },

    createPlaylistCard(playlist) {
        return `
            <div class="playlist-card" data-playlist-id="${playlist.id}">
                <div class="playlist-icon">📋</div>
                <div class="playlist-name">${AppMethods.escapeHtml(playlist.name)}</div>
                <div class="playlist-count">${playlist.songs.length} songs</div>
            </div>
        `;
    },

    showCreatePlaylistDialog() {
        const name = prompt('Enter playlist name:');
        if (name && name.trim()) {
            AppMethods.createPlaylist(name.trim());
            this.loadPlaylists();
        }
    },

    viewPlaylist(playlistId) {
        const playlist = AppState.playlists.find(p => p.id === playlistId);
        if (playlist) {
            AppState.playlist = playlist.songs;
            AppMethods.navigateToPage('home'); // Or create a playlist view page
        }
    },

    // ===== LIKED SONGS =====
    loadLikedSongs() {
        this.updateLikedCount();

        if (AppState.likedSongs.length === 0) {
            this.likedEmpty.classList.add('active');
            this.likedGrid.innerHTML = '';
        } else {
            this.likedEmpty.classList.remove('active');
            this.renderLikedSongs();
        }
    },

    renderLikedSongs() {
        this.likedGrid.innerHTML = AppState.likedSongs
            .map(song => this.createSongCard(song, true))
            .join('');

        this.addSongCardListeners(AppState.likedSongs);
    },

    updateLikedCount() {
        this.likedCount.textContent = `${AppState.likedSongs.length} songs`;
    },

    // ===== LIBRARY =====
    loadLibrary() {
        if (AppState.library.length === 0) {
            this.libraryEmpty.textContent = 'No songs in your library yet';
            this.libraryGrid.innerHTML = '';
        } else {
            this.libraryEmpty.style.display = 'none';
            this.renderLibrary();
        }
    },

    renderLibrary() {
        this.libraryGrid.innerHTML = AppState.library
            .map(song => this.createSongCard(song))
            .join('');

        this.addSongCardListeners(AppState.library);
    },

    // ===== SONG CARD CREATION =====
    createSongCard(song, isInLiked = false) {
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

    addSongCardListeners(songs) {
        document.querySelectorAll('.song-card[data-song-id]').forEach(card => {
            const songId = card.dataset.songId;
            card.addEventListener('click', () => {
                const song = songs.find(s => s.id === songId);
                if (song && window.PlayerComponent) {
                    window.PlayerComponent.playSong(song);
                }
            });
        });
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    PlaylistComponent.init();
    window.PlaylistComponent = PlaylistComponent;

    // Reload when page is active
    const observer = new MutationObserver(() => {
        if (document.getElementById('likedPage').classList.contains('active')) {
            PlaylistComponent.loadLikedSongs();
        }
        if (document.getElementById('libraryPage').classList.contains('active')) {
            PlaylistComponent.loadLibrary();
        }
        if (document.getElementById('playlistsPage').classList.contains('active')) {
            PlaylistComponent.loadPlaylists();
        }
    });

    observer.observe(document.querySelector('.content-area'), {
        childList: true,
        attributes: true,
        subtree: true
    });
});
