// ===== PLAYER STATE MANAGEMENT =====
const playerState = {
    currentSong: null,
    playlist: [],
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    currentIndex: -1,
    autoplay: false,
    volume: 70,
    isLoading: false,
};

// ===== DOM ELEMENTS =====
const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');
const playerEmbed = document.getElementById('playerEmbed');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playerThumb = document.getElementById('playerThumb');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeDisplay = document.getElementById('currentTime');
const totalTimeDisplay = document.getElementById('totalTime');
const volumeSlider = document.getElementById('volumeSlider');
const muteBtn = document.getElementById('muteBtn');
const autoplayBtn = document.getElementById('autoplayBtn');
const emptyState = document.getElementById('emptyState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');

// ===== UTILITY FUNCTIONS =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

function showError(message) {
    errorMessage.textContent = message || 'Something went wrong. Please try again.';
    errorState.classList.remove('hidden');
    emptyState.classList.add('hidden');
    resultsDiv.innerHTML = '';
}

function clearError() {
    errorState.classList.add('hidden');
}

// ===== SEARCH FUNCTIONALITY =====
const debouncedSearch = debounce(async (query) => {
    if (!query.trim()) {
        resultsDiv.innerHTML = '';
        emptyState.classList.remove('hidden');
        errorState.classList.add('hidden');
        loadingSpinner.classList.add('hidden');
        return;
    }

    try {
        loadingSpinner.classList.remove('hidden');
        clearError();

        const response = await fetch(`/search?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const songs = await response.json();
        playerState.playlist = songs;

        if (songs.length === 0) {
            resultsDiv.innerHTML = '';
            emptyState.innerHTML = `
                <div class="empty-icon">🎵</div>
                <h2>No songs found</h2>
                <p>Try searching with different keywords</p>
            `;
            emptyState.classList.remove('hidden');
        } else {
            renderResults(songs);
            emptyState.classList.add('hidden');
        }
    } catch (error) {
        console.error('Search error:', error);
        showError('Failed to search songs. Please check your connection.');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}, 500);

searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
});

// ===== RESULTS RENDERING =====
function renderResults(songs) {
    resultsDiv.innerHTML = songs
        .map((song, index) => `
            <div class="song-card ${playerState.currentSong?.id === song.id ? 'playing' : ''
            }" onclick="selectSong(${index})">
                <img
                    src="${song.thumbnail}"
                    alt="${escapeHtml(song.title)}"
                    onerror="this.src='/static/placeholder.svg'"
                >
                <div class="song-card-info">
                    <div class="song-title">${escapeHtml(song.title)}</div>
                    <div class="song-artist">${escapeHtml(song.artist)}</div>
                    <div class="song-duration">${song.duration || 'N/A'}</div>
                </div>
            </div>
        `)
        .join('');
}

// ===== SONG SELECTION & PLAYBACK =====
function selectSong(index) {
    if (index < 0 || index >= playerState.playlist.length) return;

    playerState.currentIndex = index;
    const song = playerState.playlist[index];
    playerState.currentSong = song;

    updatePlayerDisplay();
    playSong(song);
    updatePlaylistCards();
}

function playSong(song) {
    playerTitle.textContent = song.title;
    playerArtist.textContent = song.artist || 'Unknown Artist';
    playerThumb.src = song.thumbnail || '/static/placeholder.svg';

    playerEmbed.innerHTML = `
        <iframe
            id="youtubePlayer"
            width="0"
            height="0"
            src="https://www.youtube.com/embed/${song.id}?autoplay=1&controls=0&enablejsapi=1"
            allow="autoplay; encrypted-media"
            style="border: none;"
        ></iframe>
    `;

    playerState.isPlaying = true;
    updatePlayPauseButton();
    startProgressTracking();
}

function updatePlayerDisplay() {
    const song = playerState.currentSong;
    if (!song) return;

    playerTitle.textContent = song.title;
    playerArtist.textContent = song.artist || 'Unknown Artist';
    playerThumb.src = song.thumbnail || '/static/placeholder.svg';
}

function updatePlaylistCards() {
    const allCards = document.querySelectorAll('.song-card');
    allCards.forEach((card, index) => {
        card.classList.toggle('playing', index === playerState.currentIndex);
    });
}

// ===== PLAY/PAUSE CONTROL =====
playPauseBtn.addEventListener('click', togglePlayPause);

function togglePlayPause() {
    if (!playerState.currentSong) {
        if (playerState.playlist.length > 0) {
            selectSong(0);
        }
        return;
    }

    const player = document.getElementById('youtubePlayer');

    if (!player) {
        playSong(playerState.currentSong);
        return;
    }

    playerState.isPlaying = !playerState.isPlaying;

    if (playerState.isPlaying) {
        player.src = player.src.replace('autoplay=0', 'autoplay=1');
    } else {
        player.src = player.src.replace('autoplay=1', 'autoplay=0');
    }

    updatePlayPauseButton();
}

function updatePlayPauseButton() {
    if (playerState.isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

// ===== NEXT & PREVIOUS CONTROLS =====
nextBtn.addEventListener('click', playNextSong);
prevBtn.addEventListener('click', playPreviousSong);

function playNextSong() {
    if (playerState.playlist.length === 0) return;

    let nextIndex = playerState.currentIndex + 1;
    if (nextIndex >= playerState.playlist.length) {
        nextIndex = 0; // Loop back to start
    }

    selectSong(nextIndex);
}

function playPreviousSong() {
    if (playerState.playlist.length === 0) return;

    let prevIndex = playerState.currentIndex - 1;
    if (prevIndex < 0) {
        prevIndex = playerState.playlist.length - 1; // Loop to end
    }

    selectSong(prevIndex);
}

// ===== PROGRESS BAR CONTROL =====
let isSeekingProgress = false;

progressBar.addEventListener('mousedown', () => {
    isSeekingProgress = true;
});

document.addEventListener('mouseup', () => {
    isSeekingProgress = false;
});

progressBar.addEventListener('mousemove', (e) => {
    if (!isSeekingProgress) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    updateProgressDisplay(percent);
});

progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    updateProgressDisplay(percent);
});

function updateProgressDisplay(percent) {
    const player = document.getElementById('youtubePlayer');
    if (!player || !playerState.duration) return;

    const newTime = percent * playerState.duration;
    playerState.currentTime = newTime;
    updateProgressBar();

    // Simulate seeking by reloading the iframe at the new time
    // Note: YouTube iframe doesn't allow direct time seeking for embedded videos
    // This is a limitation of the YouTube API for embedded iframes
}

function updateProgressBar() {
    if (!playerState.duration || playerState.duration === 0) return;

    const percent = playerState.currentTime / playerState.duration;
    progressFill.style.width = `${percent * 100}%`;
    currentTimeDisplay.textContent = formatTime(playerState.currentTime);
}

// ===== TIME TRACKING =====
function startProgressTracking() {
    const trackingInterval = setInterval(() => {
        const player = document.getElementById('youtubePlayer');

        if (!player || !playerState.isPlaying) {
            clearInterval(trackingInterval);
            return;
        }

        // Simulate time progression (YouTube iframe API is limited)
        playerState.currentTime += 0.1;

        // Estimate duration (60 seconds default for demo)
        const estimatedDuration = 180; // 3 minutes default
        if (!playerState.duration || playerState.duration === 0) {
            playerState.duration = estimatedDuration;
            totalTimeDisplay.textContent = formatTime(estimatedDuration);
        }

        updateProgressBar();

        // Check if song ended
        if (playerState.currentTime >= playerState.duration - 1) {
            handleSongEnd();
            clearInterval(trackingInterval);
        }
    }, 100);
}

function handleSongEnd() {
    if (playerState.autoplay) {
        playNextSong();
    } else {
        playerState.isPlaying = false;
        updatePlayPauseButton();
    }
}

// ===== VOLUME CONTROL =====
volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value;
    playerState.volume = volume;

    // Update visual feedback
    const player = document.getElementById('youtubePlayer');
    if (player) {
        player.style.opacity = volume / 100;
    }

    // Update mute button state
    muteBtn.classList.toggle('active', volume < 10);
});

muteBtn.addEventListener('click', toggleMute);

function toggleMute() {
    if (playerState.volume > 0) {
        volumeSlider.value = 0;
        playerState.volume = 0;
    } else {
        volumeSlider.value = 70;
        playerState.volume = 70;
    }

    const player = document.getElementById('youtubePlayer');
    if (player) {
        player.style.opacity = playerState.volume / 100;
    }

    muteBtn.classList.toggle('active', playerState.volume < 10);
}

// ===== AUTO-PLAY CONTROL =====
autoplayBtn.addEventListener('click', toggleAutoplay);

function toggleAutoplay() {
    playerState.autoplay = !playerState.autoplay;
    autoplayBtn.classList.toggle('active', playerState.autoplay);
    autoplayBtn.setAttribute('data-autoplay', playerState.autoplay);
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Space to play/pause
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        togglePlayPause();
    }

    // Arrow Right for next
    if (e.code === 'ArrowRight' && e.target === document.body) {
        e.preventDefault();
        playNextSong();
    }

    // Arrow Left for previous
    if (e.code === 'ArrowLeft' && e.target === document.body) {
        e.preventDefault();
        playPreviousSong();
    }

    // Arrow Up to increase volume
    if (e.code === 'ArrowUp' && e.target === document.body) {
        e.preventDefault();
        volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 5);
        volumeSlider.dispatchEvent(new Event('input'));
    }

    // Arrow Down to decrease volume
    if (e.code === 'ArrowDown' && e.target === document.body) {
        e.preventDefault();
        volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 5);
        volumeSlider.dispatchEvent(new Event('input'));
    }

    // M to mute
    if (e.code === 'KeyM' && e.target === document.body) {
        e.preventDefault();
        toggleMute();
    }

    // A to toggle autoplay
    if (e.code === 'KeyA' && e.target === document.body) {
        e.preventDefault();
        toggleAutoplay();
    }
});

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Set initial volume
    volumeSlider.value = playerState.volume;

    // Focus search input for better UX
    searchInput.focus();

    // Add visual feedback
    console.log('🎵 Baka Music loaded successfully!');
    console.log('Keyboard shortcuts:');
    console.log('  Space - Play/Pause');
    console.log('  → - Next track');
    console.log('  ← - Previous track');
    console.log('  ↑ - Volume up');
    console.log('  ↓ - Volume down');
    console.log('  M - Toggle mute');
    console.log('  A - Toggle autoplay');
});
