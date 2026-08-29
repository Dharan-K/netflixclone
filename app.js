import { featuredMovie, categories, profiles } from './movies.js';

// ==========================================================================
// APPLICATION STATE
// ==========================================================================
let activeProfile = null;
let myList = []; // Array of movie IDs in My List
let likedList = []; // Array of movie IDs that are liked
let searchTimeout = null;

// Gather all unique movies in database for search/details lookup
const allMovies = [featuredMovie];
categories.forEach(category => {
  category.movies.forEach(movie => {
    if (!allMovies.some(m => m.id === movie.id)) {
      allMovies.push(movie);
    }
  });
});

// ==========================================================================
// DOM ELEMENTS
// ==========================================================================
const profileScreen = document.getElementById('profile-screen');
const browseScreen = document.getElementById('browse-screen');
const profilesList = document.getElementById('profiles-list');
const dropdownProfilesList = document.getElementById('dropdown-profiles-list');

const mainHeader = document.getElementById('main-header');
const currentUserAvatar = document.getElementById('current-user-avatar');
const logoutBtn = document.getElementById('logout-btn');

const searchContainer = document.getElementById('search-container');
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.querySelector('.id-clear-search');

const searchResultsSection = document.getElementById('search-results-section');
const searchResultsGrid = document.getElementById('search-results-grid');
const browseContent = document.getElementById('browse-content');
const rowsContainer = document.getElementById('rows-container');

// Hero Billboard
const heroTitle = document.getElementById('hero-title');
const heroBackdrop = document.getElementById('hero-backdrop');
const heroMatch = document.getElementById('hero-match');
const heroYear = document.getElementById('hero-year');
const heroRating = document.getElementById('hero-rating');
const heroDuration = document.getElementById('hero-duration');
const heroDesc = document.getElementById('hero-desc');
const heroPlayBtn = document.getElementById('hero-play-btn');
const heroInfoBtn = document.getElementById('hero-info-btn');

// Details Modal
const detailsModal = document.getElementById('details-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalTitle = document.getElementById('modal-title');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalPlayBtn = document.getElementById('modal-play-btn');
const modalMyListBtn = document.getElementById('modal-mylist-btn');
const modalLikeBtn = document.getElementById('modal-like-btn');
const modalMatch = document.getElementById('modal-match');
const modalYear = document.getElementById('modal-year');
const modalRating = document.getElementById('modal-rating');
const modalDuration = document.getElementById('modal-duration');
const modalDesc = document.getElementById('modal-desc');
const modalCast = document.getElementById('modal-cast');
const modalGenres = document.getElementById('modal-genres');
const modalTags = document.getElementById('modal-tags');
const modalRecommendationsGrid = document.getElementById('modal-recommendations-grid');

// Custom Video Player
const videoPlayer = document.getElementById('video-player');
const playerVideo = document.getElementById('player-video');
const playerBackBtn = document.getElementById('player-back-btn');
const playerMovieTitle = document.getElementById('player-movie-title');
const playerPlayBtn = document.getElementById('player-play-btn');
const playerRewindBtn = document.getElementById('player-rewind-btn');
const playerForwardBtn = document.getElementById('player-forward-btn');
const playerVolumeBtn = document.getElementById('player-volume-btn');
const playerVolumeSlider = document.getElementById('player-volume-slider');
const playerTimeCurrent = document.getElementById('player-time-current');
const playerTimeDuration = document.getElementById('player-time-duration');
const playerFullscreenBtn = document.getElementById('player-fullscreen-btn');
const playerProgressContainer = document.getElementById('player-progress-container');
const playerProgressFilled = document.getElementById('player-progress-filled');
const playerCenterPlay = document.getElementById('player-center-play');
const controlsContainer = document.querySelector('.player-controls-container');

// Nav links for views
const navLinks = document.querySelectorAll('.nav-link');
const myListNav = document.getElementById('my-list-nav');

// ==========================================================================
// PROFILE MANAGEMENT
// ==========================================================================
function initProfiles() {
  profilesList.innerHTML = '';
  profiles.forEach(profile => {
    const card = document.createElement('div');
    card.className = 'profile-card';
    card.innerHTML = `
      <div class="avatar-wrapper">
        <img src="${profile.avatarUrl}" alt="${profile.name}" class="profile-avatar">
      </div>
      <span class="profile-name">${profile.name}</span>
    `;
    card.addEventListener('click', () => selectProfile(profile));
    profilesList.appendChild(card);
  });
}

function selectProfile(profile) {
  activeProfile = profile;
  
  // Update header profile details
  currentUserAvatar.src = profile.avatarUrl;
  
  // Load data for this profile from localStorage
  myList = JSON.parse(localStorage.getItem(`netflix_mylist_${profile.id}`)) || [];
  likedList = JSON.parse(localStorage.getItem(`netflix_liked_${profile.id}`)) || [];

  // Update navbar profile switcher options
  updateProfileDropdown();

  // Load content
  loadFeaturedContent();
  renderMovieRows();

  // Swap Screen Views
  profileScreen.classList.add('hidden');
  browseScreen.classList.remove('hidden');
  document.body.style.overflowY = 'auto'; // allow scrolling browse
}

function updateProfileDropdown() {
  dropdownProfilesList.innerHTML = '';
  profiles.forEach(profile => {
    if (profile.id !== activeProfile.id) {
      const item = document.createElement('li');
      item.innerHTML = `
        <a href="#" class="dropdown-item">
          <img src="${profile.avatarUrl}" alt="${profile.name}">
          <span>${profile.name}</span>
        </a>
      `;
      item.addEventListener('click', (e) => {
        e.preventDefault();
        selectProfile(profile);
      });
      dropdownProfilesList.appendChild(item);
    }
  });
}

function signOut() {
  activeProfile = null;
  browseScreen.classList.add('hidden');
  profileScreen.classList.remove('hidden');
  resetSearch();
  // Reset navigation states
  setActiveNavLink(document.querySelector('.nav-links .nav-link:first-child'));
  browseContent.classList.remove('hidden');
  searchResultsSection.classList.add('hidden');
}

// ==========================================================================
// HOME BROWSE & BILLBOARD RENDER
// ==========================================================================
function loadFeaturedContent() {
  heroTitle.textContent = featuredMovie.title;
  heroBackdrop.src = featuredMovie.backdropUrl;
  heroMatch.textContent = featuredMovie.match;
  heroYear.textContent = featuredMovie.year;
  heroRating.textContent = featuredMovie.rating;
  heroDuration.textContent = featuredMovie.duration;
  heroDesc.textContent = featuredMovie.description;

  // Billboard Action Triggers
  heroPlayBtn.onclick = () => openVideoPlayer(featuredMovie);
  heroInfoBtn.onclick = () => openMovieDetails(featuredMovie);
}

function renderMovieRows() {
  rowsContainer.innerHTML = '';
  
  categories.forEach(category => {
    const row = document.createElement('section');
    row.className = 'movie-row';
    row.innerHTML = `
      <h2 class="row-title">${category.title}</h2>
      <div class="slider-container-wrapper">
        <button class="slider-arrow slider-arrow-left" aria-label="Scroll left">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="slider-container" id="slider-${category.id}"></div>
        <button class="slider-arrow slider-arrow-right" aria-label="Scroll right">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    `;

    const sliderContainer = row.querySelector('.slider-container');
    
    category.movies.forEach(movie => {
      const card = createMovieCard(movie, category.id);
      sliderContainer.appendChild(card);
    });

    // Attach Carousel scroll event listeners
    const leftArrow = row.querySelector('.slider-arrow-left');
    const rightArrow = row.querySelector('.slider-arrow-right');

    leftArrow.onclick = () => {
      sliderContainer.scrollLeft -= sliderContainer.clientWidth * 0.75;
    };
    rightArrow.onclick = () => {
      sliderContainer.scrollLeft += sliderContainer.clientWidth * 0.75;
    };

    rowsContainer.appendChild(row);
  });
}

function createMovieCard(movie, categoryId) {
  const isAdded = myList.includes(movie.id);
  const isLiked = likedList.includes(movie.id);

  const card = document.createElement('div');
  card.className = 'movie-card';
  card.dataset.id = movie.id;
  card.dataset.category = categoryId;

  card.innerHTML = `
    <img src="${movie.posterUrl}" alt="${movie.title}" class="movie-card-poster">
    <div class="card-hover-drawer">
      <div class="card-action-row">
        <div class="action-left">
          <button class="action-circle-btn play-filled card-play-btn" title="Play">
            <i class="fas fa-play"></i>
          </button>
          <button class="action-circle-btn card-mylist-btn" title="${isAdded ? 'Remove from My List' : 'Add to My List'}">
            <i class="fas ${isAdded ? 'fa-check' : 'fa-plus'}"></i>
          </button>
          <button class="action-circle-btn card-like-btn" title="Like">
            <i class="${isLiked ? 'fas' : 'far'} fa-thumbs-up"></i>
          </button>
        </div>
        <button class="action-circle-btn card-info-btn" title="More Info">
          <i class="fas fa-chevron-down"></i>
        </button>
      </div>
      <div class="card-meta-row">
        <span class="match">${movie.match}</span>
        <span class="rating">${movie.rating}</span>
        <span>${movie.duration}</span>
      </div>
      <div class="card-genres">
        ${movie.genres.slice(0, 3).map(g => `<span>${g}</span>`).join('')}
      </div>
    </div>
  `;

  // Setup Event Delegation/Bindings on hover drawer buttons
  const poster = card.querySelector('.movie-card-poster');
  poster.onclick = () => openMovieDetails(movie, categoryId);

  card.querySelector('.card-play-btn').onclick = (e) => {
    e.stopPropagation();
    openVideoPlayer(movie);
  };

  const listBtn = card.querySelector('.card-mylist-btn');
  listBtn.onclick = (e) => {
    e.stopPropagation();
    toggleMyList(movie, listBtn);
  };

  const likeBtn = card.querySelector('.card-like-btn');
  likeBtn.onclick = (e) => {
    e.stopPropagation();
    toggleLike(movie, likeBtn);
  };

  card.querySelector('.card-info-btn').onclick = (e) => {
    e.stopPropagation();
    openMovieDetails(movie, categoryId);
  };

  return card;
}

// ==========================================================================
// MY LIST PERSISTENCE AND VIEW
// ==========================================================================
function toggleMyList(movie, buttonElement) {
  if (myList.includes(movie.id)) {
    myList = myList.filter(id => id !== movie.id);
    if (buttonElement) {
      buttonElement.innerHTML = '<i class="fas fa-plus"></i>';
      buttonElement.title = 'Add to My List';
    }
  } else {
    myList.push(movie.id);
    if (buttonElement) {
      buttonElement.innerHTML = '<i class="fas fa-check"></i>';
      buttonElement.title = 'Remove from My List';
    }
  }
  localStorage.setItem(`netflix_mylist_${activeProfile.id}`, JSON.stringify(myList));

  // Sync state if modal or row details are open
  updateModalButtonsState(movie.id);
  
  // If we are currently browsing the "My List" tab, refresh the grid
  if (myListNav.classList.contains('active')) {
    renderMyListView();
  }
}

function toggleLike(movie, buttonElement) {
  if (likedList.includes(movie.id)) {
    likedList = likedList.filter(id => id !== movie.id);
    if (buttonElement) {
      buttonElement.innerHTML = '<i class="far fa-thumbs-up"></i>';
    }
  } else {
    likedList.push(movie.id);
    if (buttonElement) {
      buttonElement.innerHTML = '<i class="fas fa-thumbs-up"></i>';
    }
  }
  localStorage.setItem(`netflix_liked_${activeProfile.id}`, JSON.stringify(likedList));
  updateModalButtonsState(movie.id);
}

function updateModalButtonsState(movieId) {
  const isAdded = myList.includes(movieId);
  const isLiked = likedList.includes(movieId);

  if (detailsModal.dataset.currentMovieId === movieId) {
    if (isAdded) {
      modalMyListBtn.innerHTML = '<i class="fas fa-check"></i>';
      modalMyListBtn.classList.add('active');
    } else {
      modalMyListBtn.innerHTML = '<i class="fas fa-plus"></i>';
      modalMyListBtn.classList.remove('active');
    }

    if (isLiked) {
      modalLikeBtn.innerHTML = '<i class="fas fa-thumbs-up"></i>';
      modalLikeBtn.classList.add('active');
    } else {
      modalLikeBtn.innerHTML = '<i class="far fa-thumbs-up"></i>';
      modalLikeBtn.classList.remove('active');
    }
  }

  // Refresh visual checkmark icons inside standard movie cards on browse screen
  document.querySelectorAll(`.movie-card[data-id="${movieId}"]`).forEach(card => {
    const listBtn = card.querySelector('.card-mylist-btn');
    if (listBtn) {
      listBtn.innerHTML = `<i class="fas ${isAdded ? 'fa-check' : 'fa-plus'}"></i>`;
      listBtn.title = isAdded ? 'Remove from My List' : 'Add to My List';
    }
    const likeBtn = card.querySelector('.card-like-btn');
    if (likeBtn) {
      likeBtn.innerHTML = `<i class="${isLiked ? 'fas' : 'far'} fa-thumbs-up"></i>`;
    }
  });
}

function renderMyListView() {
  browseContent.classList.add('hidden');
  searchResultsSection.classList.remove('hidden');
  searchResultsSection.querySelector('.row-title').textContent = "My List";
  searchResultsGrid.innerHTML = '';

  const listMovies = allMovies.filter(movie => myList.includes(movie.id));

  if (listMovies.length === 0) {
    searchResultsGrid.innerHTML = `
      <div class="no-results">
        <p>You haven't added any titles to your list yet.</p>
      </div>
    `;
    return;
  }

  listMovies.forEach(movie => {
    const card = createMovieCard(movie, 'mylist');
    searchResultsGrid.appendChild(card);
  });
}

// ==========================================================================
// DETAILED MODAL OVERLAY
// ==========================================================================
function openMovieDetails(movie, categoryId = '') {
  detailsModal.dataset.currentMovieId = movie.id;
  
  modalTitle.textContent = movie.title;
  modalBackdrop.src = movie.backdropUrl;
  modalMatch.textContent = movie.match;
  modalYear.textContent = movie.year;
  modalRating.textContent = movie.rating;
  modalDuration.textContent = movie.duration;
  modalDesc.textContent = movie.description;

  // Set mock static information
  modalCast.textContent = "Christian Blend, Sarah Connor, David Vance, Emma Watson";
  modalGenres.textContent = movie.genres.join(', ');
  modalTags.textContent = movie.genres.includes('Comedy') ? 'Exciting, Comical, Lively' : 'Suspenseful, Mind-Bending, Imaginative';

  // Modal actions
  modalPlayBtn.onclick = () => {
    closeMovieDetails();
    openVideoPlayer(movie);
  };
  modalMyListBtn.onclick = () => toggleMyList(movie);
  modalLikeBtn.onclick = () => toggleLike(movie);

  // Sync state for Buttons
  updateModalButtonsState(movie.id);

  // Load recommendations
  renderRecommendations(movie, categoryId);

  // Display modal
  detailsModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // stop page scrolling
}

function closeMovieDetails() {
  detailsModal.classList.add('hidden');
  if (videoPlayer.classList.contains('hidden')) {
    document.body.style.overflowY = 'auto'; // restore browse scrolling
  }
}

function renderRecommendations(currentMovie, categoryId) {
  modalRecommendationsGrid.innerHTML = '';
  
  // Find movies within same category, exclude current movie
  let recMovies = [];
  if (categoryId && categoryId !== 'mylist') {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      recMovies = category.movies.filter(m => m.id !== currentMovie.id);
    }
  }

  // Fallback: search other categories or random selection if category empty
  if (recMovies.length < 3) {
    const additional = allMovies.filter(m => m.id !== currentMovie.id && !recMovies.some(r => r.id === m.id));
    recMovies = [...recMovies, ...additional].slice(0, 3);
  }

  recMovies.slice(0, 3).forEach(movie => {
    const card = document.createElement('div');
    card.className = 'recommend-card';
    card.innerHTML = `
      <div class="rec-banner-wrapper">
        <img src="${movie.backdropUrl}" alt="${movie.title}" class="rec-banner">
        <span class="rec-badge">${movie.duration}</span>
      </div>
      <div class="rec-details">
        <div class="rec-meta">
          <span class="rec-match">${movie.match}</span>
          <span class="meta-rating">${movie.rating}</span>
          <span>${movie.year}</span>
        </div>
        <h4 class="rec-title">${movie.title}</h4>
        <p class="rec-desc">${movie.description}</p>
      </div>
    `;

    card.onclick = () => {
      // Smoothly scroll modal to top and switch contents
      detailsModal.scrollTo({ top: 0, behavior: 'smooth' });
      openMovieDetails(movie, categoryId);
    };

    modalRecommendationsGrid.appendChild(card);
  });
}

// ==========================================================================
// SIMULATED CUSTOM VIDEO PLAYER
// ==========================================================================
let controlsTimeout;

function openVideoPlayer(movie) {
  playerMovieTitle.textContent = movie.title;
  playerVideo.src = movie.videoUrl;
  
  // Switch screen views
  videoPlayer.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Start play
  playerVideo.play()
    .then(() => {
      updatePlayBtnIcon(true);
    })
    .catch((err) => {
      console.warn("Autoplay block, manual trigger needed:", err);
      updatePlayBtnIcon(false);
    });

  resetPlayerControlsTimer();
}

function closeVideoPlayer() {
  playerVideo.pause();
  playerVideo.src = '';
  videoPlayer.classList.add('hidden');
  
  if (detailsModal.classList.contains('hidden')) {
    document.body.style.overflowY = 'auto'; // restore scroll if modal not active
  }
  clearTimeout(controlsTimeout);
}

function togglePlay() {
  if (playerVideo.paused) {
    playerVideo.play();
    updatePlayBtnIcon(true);
    showCenterPlayIndicator(true);
  } else {
    playerVideo.pause();
    updatePlayBtnIcon(false);
    showCenterPlayIndicator(false);
  }
}

function updatePlayBtnIcon(isPlaying) {
  playerPlayBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

function showCenterPlayIndicator(isPlaying) {
  playerCenterPlay.innerHTML = isPlaying ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
  playerCenterPlay.classList.remove('hidden');
  playerCenterPlay.style.animation = 'none';
  // Trigger reflow
  playerCenterPlay.offsetHeight; 
  playerCenterPlay.style.animation = 'fadeIn 0.5s ease-out alternate 1';
  
  setTimeout(() => {
    playerCenterPlay.classList.add('hidden');
  }, 500);
}

// Time Formatting Helper (converts seconds to HH:MM:SS or MM:SS)
function formatTime(timeInSeconds) {
  if (isNaN(timeInSeconds)) return '0:00';
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

  if (hours > 0) {
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  }
  return `${minutes}:${formattedSeconds}`;
}

// Controls Activity Timer
function resetPlayerControlsTimer() {
  controlsContainer.classList.remove('controls-hidden');
  document.getElementById('video-player').style.cursor = 'default';
  
  clearTimeout(controlsTimeout);
  controlsTimeout = setTimeout(() => {
    if (!playerVideo.paused) {
      controlsContainer.classList.add('controls-hidden');
      document.getElementById('video-player').style.cursor = 'none';
    }
  }, 3000);
}

// Timeline seeking logic
function seekVideo(e) {
  const rect = playerProgressContainer.getBoundingClientRect();
  const positionPercentage = (e.clientX - rect.left) / rect.width;
  const targetTime = positionPercentage * playerVideo.duration;
  
  if (!isNaN(targetTime)) {
    playerVideo.currentTime = targetTime;
  }
}

// Volume Controls
function updateVolume(val) {
  playerVideo.volume = val;
  playerVideo.muted = val === 0;

  if (playerVideo.muted) {
    playerVolumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
  } else if (val < 0.5) {
    playerVolumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
  } else {
    playerVolumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
  }
}

function toggleMute() {
  playerVideo.muted = !playerVideo.muted;
  if (playerVideo.muted) {
    playerVolumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    playerVolumeSlider.value = 0;
  } else {
    playerVolumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    playerVolumeSlider.value = playerVideo.volume;
  }
}

// Fullscreen
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    videoPlayer.requestFullscreen().catch(err => {
      console.warn("Fullscreen request error:", err);
    });
    playerFullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
  } else {
    document.exitFullscreen();
    playerFullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
  }
}

// ==========================================================================
// SEARCH & NAVIGATION HANDLERS
// ==========================================================================
function performSearch(query) {
  if (!query) {
    resetSearch();
    return;
  }

  browseContent.classList.add('hidden');
  searchResultsSection.classList.remove('hidden');
  searchResultsSection.querySelector('.row-title').textContent = `Search results for "${query}"`;
  searchResultsGrid.innerHTML = '';

  const lowercaseQuery = query.toLowerCase();
  
  const results = allMovies.filter(movie => {
    return (
      movie.title.toLowerCase().includes(lowercaseQuery) ||
      movie.description.toLowerCase().includes(lowercaseQuery) ||
      movie.genres.some(genre => genre.toLowerCase().includes(lowercaseQuery))
    );
  });

  if (results.length === 0) {
    searchResultsGrid.innerHTML = `
      <div class="no-results">
        <p>Your search for "${query}" did not have any matches.</p>
        <p>Suggestions:</p>
        <ul>
          <li>Try different keywords</li>
          <li>Looking for a movie or TV show? Try its title</li>
          <li>Try a genre, like Sci-Fi, Comedy, or Fantasy</li>
        </ul>
      </div>
    `;
    return;
  }

  results.forEach(movie => {
    const card = createMovieCard(movie, 'search');
    searchResultsGrid.appendChild(card);
  });
}

function resetSearch() {
  searchInput.value = '';
  clearSearchBtn.classList.add('hidden');
  searchResultsSection.classList.add('hidden');
  browseContent.classList.remove('hidden');
  searchContainer.classList.remove('active');
}

function setActiveNavLink(activeEl) {
  navLinks.forEach(link => link.classList.remove('active'));
  if (activeEl) {
    activeEl.classList.add('active');
  }
}

// ==========================================================================
// EVENT LISTENERS INITIALIZATION
// ==========================================================================

// Profiles setup
document.addEventListener('DOMContentLoaded', () => {
  initProfiles();

  // Scroll Header background change
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }
  });

  // Search Expand Toggle
  searchBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    searchContainer.classList.add('active');
    searchInput.focus();
  });

  searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val.length > 0) {
      clearSearchBtn.classList.remove('hidden');
    } else {
      clearSearchBtn.classList.add('hidden');
    }

    // Debounce search updates
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch(val);
    }, 300);
  });

  clearSearchBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetSearch();
    setActiveNavLink(document.querySelector('.nav-links .nav-link:first-child'));
  });

  // Collapse search if clicked outside
  document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target) && searchInput.value.trim() === '') {
      searchContainer.classList.remove('active');
    }
  });

  // Nav item click controllers
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      resetSearch();
      setActiveNavLink(link);
      
      if (link === myListNav) {
        renderMyListView();
      } else {
        // Standard views - load standard rows
        browseContent.classList.remove('hidden');
        searchResultsSection.classList.add('hidden');
      }
    });
  });

  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signOut();
  });

  // Detail Modal Close
  modalCloseBtn.onclick = closeMovieDetails;
  
  detailsModal.onclick = (e) => {
    if (e.target === detailsModal) {
      closeMovieDetails();
    }
  };

  // VIDEO PLAYER CONTROLS
  playerBackBtn.onclick = closeVideoPlayer;
  playerPlayBtn.onclick = togglePlay;
  playerRewindBtn.onclick = () => { playerVideo.currentTime -= 10; };
  playerForwardBtn.onclick = () => { playerVideo.currentTime += 10; };
  
  playerVolumeSlider.oninput = (e) => {
    updateVolume(parseFloat(e.target.value));
  };
  playerVolumeBtn.onclick = toggleMute;
  playerFullscreenBtn.onclick = toggleFullscreen;

  // Seek bar click interaction
  playerProgressContainer.onclick = seekVideo;

  // Drag seek bar interaction
  let isDragging = false;
  playerProgressContainer.onmousedown = (e) => {
    isDragging = true;
    seekVideo(e);
  };
  window.onmousemove = (e) => {
    if (isDragging) seekVideo(e);
  };
  window.onmouseup = () => {
    isDragging = false;
  };

  // Video playback listeners
  playerVideo.ontimeupdate = () => {
    if (playerVideo.duration) {
      const percentage = (playerVideo.currentTime / playerVideo.duration) * 100;
      playerProgressFilled.style.width = `${percentage}%`;
      playerTimeCurrent.textContent = formatTime(playerVideo.currentTime);
    }
  };

  playerVideo.onloadedmetadata = () => {
    playerTimeDuration.textContent = formatTime(playerVideo.duration);
  };

  // Fade controls on inactivity
  const playerScreen = document.getElementById('video-player');
  playerScreen.onmousemove = resetPlayerControlsTimer;
  playerScreen.onclick = resetPlayerControlsTimer;

  // KEYBOARD ACCESSIBILITY KEYBINDINGS
  document.addEventListener('keydown', (e) => {
    // Escape key closures
    if (e.key === 'Escape') {
      if (!videoPlayer.classList.contains('hidden')) {
        closeVideoPlayer();
      } else if (!detailsModal.classList.contains('hidden')) {
        closeMovieDetails();
      }
    }
    
    // Video controls when active
    if (!videoPlayer.classList.contains('hidden')) {
      if (e.key === ' ' || e.key === 'k') { // Spacebar or K to Play/Pause
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight' || e.key === 'l') { // Seek right
        e.preventDefault();
        playerVideo.currentTime += 10;
      } else if (e.key === 'ArrowLeft' || e.key === 'j') { // Seek left
        e.preventDefault();
        playerVideo.currentTime -= 10;
      } else if (e.key === 'f') { // Fullscreen toggles
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm') { // Mute toggle
        e.preventDefault();
        toggleMute();
      }
    }
  });
});
