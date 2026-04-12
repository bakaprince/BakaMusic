// ===== 🎵 BAKA MUSIC - MAIN APPLICATION ENTRY POINT =====

// 🧠 GLOBAL APP STATE
const AppState = {
    // Player State
    currentSong: null,
    playlist: [],
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    currentIndex: -1,

    // UI State
    currentPage: 'home',

    // User Data
    likedSongs: [],
    playlists: [],
    library: [],
    recentlyPlayed: [],
    profile: {
        name: 'User',
        theme: 'dark'
    },

    // Settings
    autoplay: false,
    volume: 70,
    defaultVolume: 70
};

// 💾 STORAGE KEY
const STORAGE_KEY = 'baka_music_state';

// 🎯 DOM REFERENCES
const appContainer = document.querySelector('.app-container');
const sidebar = document.getElementById('sidebar');
const contentArea = document.querySelector('.content-area');
const playerBar = document.getElementById('playerBar');
const pageTitle = document.getElementById('pageTitle');
const navLinks = document.querySelectorAll('.nav-link');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    AppState.profile.name = localStorage.getItem('userName') || 'User';

    // Load saved state
    loadState();

    // Initialize components
    setupNavigation();
    setupPageTransitions();
    setupKeyboardShortcuts();

    // Load profile name
    updateProfileName();

    console.log('🎵 Baka Music loaded successfully!');
    console.log('🌙 Dark theme active');
});

// ===== STATE MANAGEMENT =====
function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(AppState, parsed);
        } catch (e) {
            console.error('Failed to load state:', e);
        }
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState));
}

// ===== NAVIGATION SETUP =====
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateToPage(page);

            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            navigateToPage('settings');
            navLinks.forEach(l => l.classList.remove('active'));
        });
    }
}

function navigateToPage(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });

    // Show selected page
    const pageElement = document.getElementById(page + 'Page');
    if (pageElement) {
        pageElement.classList.add('active');
    }

    // Update title
    const titles = {
        'home': 'Home',
        'search': 'Search',
        'library': 'Your Library',
        'playlists': 'Playlists',
        'liked': 'Liked Songs',
        'settings': 'Settings'
    };

    pageTitle.textContent = titles[page] || page;
    AppState.currentPage = page;

    // Trigger page-specific setup
    if (page === 'search') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }
}

// ===== PAGE TRANSITIONS =====
function setupPageTransitions() {
    // Dynamic page navigation via hash
    window.addEventListener('hashchange', () => {
        const page = window.location.hash.slice(1) || 'home';
        navigateToPage(page);
    });
}

// ===== KEYBOARD SHORTCUTS =====
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Space to play/pause
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            if (window.PlayerComponent) {
                window.PlayerComponent.togglePlayPause();
            }
        }

        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyK') {
            e.preventDefault();
            navigateToPage('search');
        }

        // Arrow keys for navigation (if applicable)
        if (e.code === 'ArrowRight' && e.target === document.body) {
            e.preventDefault();
            if (window.PlayerComponent) {
                window.PlayerComponent.nextTrack();
            }
        }

        if (e.code === 'ArrowLeft' && e.target === document.body) {
            e.preventDefault();
            if (window.PlayerComponent) {
                window.PlayerComponent.previousTrack();
            }
        }
    });
}

// ===== PROFILE MANAGEMENT =====
function updateProfileName() {
    const profileNameEl = document.getElementById('profileName');
    if (profileNameEl) {
        profileNameEl.textContent = AppState.profile.name;
    }
}

function setProfileName(name) {
    AppState.profile.name = name;
    localStorage.setItem('userName', name);
    updateProfileName();
}

// ===== PLAYLIST MANAGEMENT =====
function createPlaylist(name) {
    const playlist = {
        id: Date.now().toString(),
        name: name,
        songs: [],
        createdAt: new Date().toISOString()
    };

    AppState.playlists.push(playlist);
    saveState();
    return playlist;
}

function deletePlaylist(playlistId) {
    AppState.playlists = AppState.playlists.filter(p => p.id !== playlistId);
    saveState();
}

function addSongToPlaylist(playlistId, song) {
    const playlist = AppState.playlists.find(p => p.id === playlistId);
    if (playlist && !playlist.songs.find(s => s.id === song.id)) {
        playlist.songs.push(song);
        saveState();
    }
}

function removeSongFromPlaylist(playlistId, songId) {
    const playlist = AppState.playlists.find(p => p.id === playlistId);
    if (playlist) {
        playlist.songs = playlist.songs.filter(s => s.id !== songId);
        saveState();
    }
}

// ===== LIKED SONGS MANAGEMENT =====
function toggleLikeSong(song) {
    const index = AppState.likedSongs.findIndex(s => s.id === song.id);
    if (index >= 0) {
        AppState.likedSongs.splice(index, 1);
    } else {
        AppState.likedSongs.push(song);
    }
    saveState();

    // Update UI
    document.querySelectorAll('.song-card').forEach(card => {
        if (card.dataset.songId === song.id) {
            card.classList.toggle('liked');
        }
    });

    return index < 0; // Return true if song was liked
}

function isSongLiked(songId) {
    return AppState.likedSongs.some(s => s.id === songId);
}

// ===== LIBRARY MANAGEMENT =====
function addToLibrary(song) {
    if (!AppState.library.find(s => s.id === song.id)) {
        AppState.library.push(song);
        saveState();
    }
}

function addToRecentlyPlayed(song) {
    // Remove if already exists
    AppState.recentlyPlayed = AppState.recentlyPlayed.filter(s => s.id !== song.id);
    // Add to beginning
    AppState.recentlyPlayed.unshift(song);
    // Keep only last 50
    AppState.recentlyPlayed = AppState.recentlyPlayed.slice(0, 50);
    saveState();
}

// ===== UTILITY FUNCTIONS =====
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// ===== EXPORT FOR COMPONENTS =====
window.AppState = AppState;
window.AppMethods = {
    navigateToPage,
    createPlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    toggleLikeSong,
    isSongLiked,
    addToLibrary,
    addToRecentlyPlayed,
    setProfileName,
    formatTime,
    escapeHtml,
    debounce,
    saveState
};
