/* =====================================================
   FeroFUFU – js/modules/podcasts.js
   Yılbaşı Podcastleri Modülü
   localStorage key: "ferofufu_podcasts"
   ===================================================== */

"use strict";

const PODCASTS_KEY = "ferofufu_podcasts";

/* -------------------------------------------------------
   DEFAULT / DEMO TRACKS
   ------------------------------------------------------- */
const DEFAULT_PODCASTS = [
  {
    id: "pod-1",
    title: "Açılış – Yılbaşı Özel",
    description: "Platformumuzun yılbaşı özel podcast serisine hoş geldiniz!",
    url: "",
    addedAt: "2025-12-01"
  },
  {
    id: "pod-2",
    title: "Bölüm 1 – Noel Masalları",
    description: "Ekibimizin yılbaşı hatıraları ve eğlenceli hikayeleri.",
    url: "",
    addedAt: "2025-12-10"
  },
  {
    id: "pod-3",
    title: "Bölüm 2 – DnD Özel Yılbaşı Sohbeti",
    description: "Litvus'un Soytarıları ekibi yılbaşında bir araya geliyor.",
    url: "",
    addedAt: "2025-12-20"
  }
];

/* -------------------------------------------------------
   STORAGE HELPERS (FeroDB Cloud + Local Cache)
   ------------------------------------------------------- */
function getPodcasts() {
  if (window.FeroDB && typeof window.FeroDB.getItems === "function") {
    return window.FeroDB.getItems("podcast", DEFAULT_PODCASTS);
  }
  try {
    const raw = localStorage.getItem(PODCASTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("[Podcasts] localStorage okuma hatası:", e);
  }
  return DEFAULT_PODCASTS;
}

function savePodcasts(tracks) {
  if (window.FeroDB && typeof window.FeroDB.saveCollection === "function") {
    window.FeroDB.saveCollection("podcast", tracks);
    return;
  }
  try {
    localStorage.setItem(PODCASTS_KEY, JSON.stringify(tracks));
  } catch (e) {
    console.warn("[Podcasts] localStorage yazma hatası:", e);
  }
}

function addPodcastTrack(track) {
  const tracks = getPodcasts();
  const existing = tracks.filter(t => !t.id.startsWith("pod-"));
  existing.push(track);
  const demos = tracks.filter(t => t.id.startsWith("pod-"));
  const merged = [...demos, ...existing];
  
  if (window.FeroDB && typeof window.FeroDB.saveItem === "function") {
    window.FeroDB.saveItem("podcast", track);
  } else {
    savePodcasts(merged);
  }
  return merged;
}

// Canlı bulut güncellemelerini dinle
window.addEventListener("ferofufu_cloud_update", function(e) {
  if (e.detail && e.detail.collection === "podcast") {
    podcastState.tracks = e.detail.items;
    const section = document.getElementById("podcasts-section");
    if (section && !section.classList.contains("hidden")) {
      _renderPodcastTrackList();
    }
  }
});

/* -------------------------------------------------------
   PLAYER STATE
   ------------------------------------------------------- */
const podcastState = {
  tracks: [],
  currentIndex: 0,
  audio: null,
  isPlaying: false,
  volume: 0.75
};

/* -------------------------------------------------------
   SECTION RENDER
   ------------------------------------------------------- */
function loadPodcastsSection() {
  const section = document.getElementById("podcasts-section");
  if (!section) return;

  podcastState.tracks = getPodcasts();

  section.innerHTML = `
    <button class="audio-back-btn" id="podcasts-back-btn">← Geri</button>

    <div class="audio-section-header">
      <span class="audio-section-emoji">🎄</span>
      <h1 class="audio-section-title">Yılbaşı <span>Podcastleri</span></h1>
      <p class="audio-section-subtitle">Ekibimizin yılbaşı özel ses yayınları</p>
    </div>

    <div class="audio-layout">
      <!-- PLAYER -->
      <div class="audio-player-card" id="podcast-player-card">
        <div class="player-artwork-wrapper">
          <div class="player-artwork-placeholder" id="podcast-artwork">🎄</div>
        </div>

        <div class="player-track-info">
          <p class="player-track-title" id="podcast-track-title">Parça seçin...</p>
          <p class="player-track-meta" id="podcast-track-meta">Yılbaşı Podcastleri</p>
        </div>

        <div class="player-progress-wrapper">
          <span class="player-time" id="podcast-time-cur">0:00</span>
          <input
            type="range"
            class="player-range"
            id="podcast-progress"
            min="0" max="100" value="0"
            aria-label="Oynatma pozisyonu"
          />
          <span class="player-time time-end" id="podcast-time-end">0:00</span>
        </div>

        <div class="player-controls">
          <button class="player-btn" id="podcast-prev-btn" aria-label="Önceki parça" title="Önceki">⏮</button>
          <button class="player-btn player-play-btn" id="podcast-play-btn" aria-label="Oynat / Duraklat">▶</button>
          <button class="player-btn" id="podcast-next-btn" aria-label="Sonraki parça" title="Sonraki">⏭</button>
        </div>

        <div class="player-volume-row">
          <span class="player-volume-icon" id="podcast-vol-icon" title="Sesi kapat/aç">🔊</span>
          <input
            type="range"
            class="player-volume-range"
            id="podcast-volume"
            min="0" max="1" step="0.01" value="0.75"
            aria-label="Ses seviyesi"
          />
        </div>
      </div>

      <!-- TRACK LIST -->
      <div class="audio-tracklist-card">
        <div class="tracklist-header">
          <div style="display:flex; align-items:center; gap: 12px;">
            <span class="tracklist-title">📋 Yayın Listesi</span>
            ${typeof checkAdminStatus === 'function' && checkAdminStatus() ? `<button class="inline-add-btn" onclick="inlineAddNew('podcast')">➕ Yeni İçerik Ekle</button>` : ""}
          </div>
          <span class="tracklist-count" id="podcast-track-count">0 Bölüm</span>
        </div>
        <div class="track-list" id="podcast-track-list" role="listbox" aria-label="Podcast listesi"></div>
      </div>
    </div>
  `;

  // Audio element
  if (podcastState.audio) {
    podcastState.audio.pause();
    podcastState.audio = null;
  }
  podcastState.audio = new Audio();
  podcastState.audio.volume = podcastState.volume;
  podcastState.isPlaying = false;

  _bindPodcastPlayerEvents();
  _renderPodcastTrackList();
  _selectPodcastTrack(0);

  // Back button
  document.getElementById("podcasts-back-btn")?.addEventListener("click", () => {
    if (podcastState.audio) {
      podcastState.audio.pause();
      podcastState.isPlaying = false;
    }
    if (typeof goHome === "function") goHome();
  });
}

/* -------------------------------------------------------
   TRACK LIST RENDER
   ------------------------------------------------------- */
function _renderPodcastTrackList() {
  const list  = document.getElementById("podcast-track-list");
  const count = document.getElementById("podcast-track-count");
  if (!list) return;

  const tracks = podcastState.tracks;
  if (count) count.textContent = `${tracks.length} Bölüm`;

  const isAdmin = typeof checkAdminStatus === 'function' && checkAdminStatus();

  if (tracks.length === 0) {
    list.innerHTML = `
      <div class="tracklist-empty">
        <span>🎄</span>
        Henüz podcast eklenmemiş.<br/>
        Yükleme panelinden ekleyebilirsin!
      </div>`;
    return;
  }

  list.innerHTML = tracks.map((t, i) => `
    <div
      class="track-item ${i === podcastState.currentIndex ? "active" : ""}"
      data-index="${i}"
      role="option"
      aria-selected="${i === podcastState.currentIndex}"
      tabindex="0"
      title="${_escHtml(t.title)}"
    >
      <div class="track-num">${i + 1}</div>
      <div class="track-info">
        <p class="track-name">${_escHtml(t.title)}</p>
        ${t.description ? `<p class="track-desc">${_escHtml(t.description)}</p>` : ""}
      </div>
      <div style="display:flex; align-items:center; gap: 8px; margin-left: auto;">
        ${t.url ? "" : '<span class="track-duration" title="URL eksik">—</span>'}
        ${isAdmin ? `
        <div class="inline-admin-actions-list">
          <button class="inline-edit-btn" onclick="inlineEdit('${t.id}', 'podcast', event)" title="Düzenle">✏️</button>
          <button class="inline-delete-btn" onclick="inlineDelete('${t.id}', 'podcast', event)" title="Sil">🗑️</button>
        </div>
        ` : ""}
      </div>
    </div>
  `).join("");

  list.querySelectorAll(".track-item").forEach(item => {
    item.addEventListener("click",   () => _selectPodcastTrack(+item.dataset.index));
    item.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") _selectPodcastTrack(+item.dataset.index);
    });
  });
}

/* -------------------------------------------------------
   PLAYER LOGIC
   ------------------------------------------------------- */
function _selectPodcastTrack(index) {
  const tracks = podcastState.tracks;
  if (!tracks || tracks.length === 0 || isNaN(index) || index < 0 || index >= tracks.length) return;

  const wasPlaying = podcastState.isPlaying;
  podcastState.currentIndex = index;
  const track = tracks[index];

  // Update audio src
  const audio = podcastState.audio;
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.src = track.url || "";
  }

  podcastState.isPlaying = false;
  _updatePodcastPlayerUI(track);
  _renderPodcastTrackList();

  if (wasPlaying && track.url) {
    _podcastPlay();
  }
}

function _podcastPlay() {
  const audio = podcastState.audio;
  const card  = document.getElementById("podcast-player-card");
  const btn   = document.getElementById("podcast-play-btn");
  const track = podcastState.tracks[podcastState.currentIndex];

  if (!track) return;

  if (!track.url) {
    _showPodcastToast("⚠️ Bu bölümün ses dosyası henüz eklenmemiş.");
    return;
  }

  audio.play().then(() => {
    podcastState.isPlaying = true;
    if (btn)  btn.textContent = "⏸";
    if (card) card.classList.add("is-playing");
    _markActiveTrackPlaying(true);
  }).catch(err => {
    console.warn("[Podcasts] Oynatma hatası:", err);
    _showPodcastToast("❌ Ses dosyası yüklenemedi.");
  });
}

function _podcastPause() {
  const audio = podcastState.audio;
  const card  = document.getElementById("podcast-player-card");
  const btn   = document.getElementById("podcast-play-btn");

  if (audio) audio.pause();
  podcastState.isPlaying = false;
  if (btn)  btn.textContent = "▶";
  if (card) card.classList.remove("is-playing");
  _markActiveTrackPlaying(false);
}

function _markActiveTrackPlaying(playing) {
  document.querySelectorAll("#podcast-track-list .track-item").forEach((el, i) => {
    if (i === podcastState.currentIndex) {
      el.classList.toggle("is-playing", playing);
    }
  });
}

function _updatePodcastPlayerUI(track) {
  const titleEl = document.getElementById("podcast-track-title");
  const metaEl  = document.getElementById("podcast-track-meta");
  const artEl   = document.getElementById("podcast-artwork");
  const btn     = document.getElementById("podcast-play-btn");
  const card    = document.getElementById("podcast-player-card");

  if (titleEl) titleEl.textContent = track.title;
  if (metaEl)  metaEl.textContent  = track.description || "Yılbaşı Podcastleri";
  if (artEl) {
    artEl.textContent = "🎄";
  }
  if (btn)  btn.textContent = "▶";
  if (card) card.classList.remove("is-playing");

  // Reset progress
  _setPodcastProgress(0, 0);
}

function _setPodcastProgress(current, duration) {
  const curEl  = document.getElementById("podcast-time-cur");
  const endEl  = document.getElementById("podcast-time-end");
  const slider = document.getElementById("podcast-progress");

  if (curEl)  curEl.textContent = _formatTime(current);
  if (endEl)  endEl.textContent = _formatTime(duration);
  if (slider) {
    slider.max   = duration || 100;
    slider.value = current;
    const pct = duration > 0 ? (current / duration) * 100 : 0;
    slider.style.backgroundSize = `${pct}% 100%`;
  }
}

/* -------------------------------------------------------
   EVENT BINDING
   ------------------------------------------------------- */
function _bindPodcastPlayerEvents() {
  const audio   = podcastState.audio;
  const playBtn = document.getElementById("podcast-play-btn");
  const prevBtn = document.getElementById("podcast-prev-btn");
  const nextBtn = document.getElementById("podcast-next-btn");
  const progressSlider = document.getElementById("podcast-progress");
  const volumeSlider   = document.getElementById("podcast-volume");
  const volIcon        = document.getElementById("podcast-vol-icon");

  // Play / Pause
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      podcastState.isPlaying ? _podcastPause() : _podcastPlay();
    });
  }

  // Prev / Next
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (podcastState.tracks.length === 0) return;
      const idx = (podcastState.currentIndex - 1 + podcastState.tracks.length) % podcastState.tracks.length;
      _selectPodcastTrack(idx);
      if (podcastState.isPlaying) setTimeout(_podcastPlay, 100);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (podcastState.tracks.length === 0) return;
      const idx = (podcastState.currentIndex + 1) % podcastState.tracks.length;
      _selectPodcastTrack(idx);
      if (podcastState.isPlaying) setTimeout(_podcastPlay, 100);
    });
  }

  // Audio time update
  if (audio) {
    audio.addEventListener("timeupdate", () => {
      _setPodcastProgress(audio.currentTime, audio.duration || 0);
    });

    audio.addEventListener("ended", () => {
      // Auto-advance to next track
      const next = (podcastState.currentIndex + 1) % podcastState.tracks.length;
      if (next !== 0 || podcastState.tracks.length === 1) {
        _selectPodcastTrack(next);
        setTimeout(_podcastPlay, 100);
      } else {
        _podcastPause();
        _selectPodcastTrack(0);
      }
    });

    audio.addEventListener("loadedmetadata", () => {
      _setPodcastProgress(0, audio.duration || 0);
    });
  }

  // Progress slider seek
  if (progressSlider) {
    progressSlider.addEventListener("input", () => {
      if (audio && audio.duration) {
        audio.currentTime = +progressSlider.value;
      }
    });
  }

  // Volume
  if (volumeSlider) {
    volumeSlider.addEventListener("input", () => {
      const vol = +volumeSlider.value;
      podcastState.volume = vol;
      if (audio) audio.volume = vol;
      volumeSlider.style.backgroundSize = `${vol * 100}% 100%`;
      if (volIcon) volIcon.textContent = vol === 0 ? "🔇" : vol < 0.4 ? "🔉" : "🔊";
    });
    // Init
    volumeSlider.style.backgroundSize = `${podcastState.volume * 100}% 100%`;
  }

  // Mute toggle
  if (volIcon) {
    volIcon.addEventListener("click", () => {
      if (audio) {
        audio.muted = !audio.muted;
        volIcon.textContent = audio.muted ? "🔇" : "🔊";
      }
    });
  }
}

/* -------------------------------------------------------
   PUBLIC API – Upload modülünden çağrılır
   ------------------------------------------------------- */
function addPodcastFromUpload(track) {
  const updated = addPodcastTrack(track);
  podcastState.tracks = updated;

  // Eğer podcasts section aktifse yeniden render et
  const section = document.getElementById("podcasts-section");
  if (section && !section.classList.contains("hidden")) {
    _renderPodcastTrackList();
  }

  console.log("%c[Podcasts] Yeni parça eklendi:", "color:#22c55e;font-weight:bold;", track);
}

/* -------------------------------------------------------
   HELPERS
   ------------------------------------------------------- */
function _formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function _escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function _showPodcastToast(msg) {
  if (typeof showComingSoonToast === "function") {
    // Mevcut toast altyapısı varsa kullan ama farklı mesajla
  }
  const existing = document.getElementById("audio-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.id = "audio-toast";
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: "fixed", bottom: "32px", left: "50%",
    transform: "translateX(-50%) translateY(20px)",
    background: "rgba(13,16,23,0.95)", backdropFilter: "blur(12px)",
    color: "#f1f5f9", padding: "12px 24px", borderRadius: "50px",
    border: "1px solid rgba(34,197,94,0.4)", fontSize: "0.85rem",
    fontWeight: "500", zIndex: "9999", transition: "all 0.3s ease", opacity: "0"
  });
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
