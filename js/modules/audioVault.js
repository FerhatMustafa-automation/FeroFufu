/* =====================================================
   FeroFUFU – js/modules/audioVault.js
   Epik Ses Kayıtları Modülü
   localStorage key: "ferofufu_audiovault"
   ===================================================== */

"use strict";

const AUDIO_VAULT_KEY = "ferofufu_audiovault";

/* -------------------------------------------------------
   DEFAULT / DEMO TRACKS
   ------------------------------------------------------- */
const DEFAULT_AUDIO_VAULT = [
  {
    id: "av-1",
    title: "Epik Açılış Müziği",
    description: "Litvus'un Soytarıları turnuvasının açılış teması.",
    url: "",
    addedAt: "2025-01-01"
  },
  {
    id: "av-2",
    title: "Savaş Anı – DnD Özel",
    description: "En unutulmaz savaş anlarından derleme ses kaydı.",
    url: "",
    addedAt: "2025-03-15"
  },
  {
    id: "av-3",
    title: "Zafer Çığlıkları",
    description: "Ekibin en epik zafer anlarından ses kesitleri.",
    url: "",
    addedAt: "2025-06-20"
  }
];

/* -------------------------------------------------------
   STORAGE HELPERS
   ------------------------------------------------------- */
function getAudioVaultTracks() {
  try {
    const raw = localStorage.getItem(AUDIO_VAULT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("[AudioVault] localStorage okuma hatası:", e);
  }
  return DEFAULT_AUDIO_VAULT;
}

function saveAudioVaultTracks(tracks) {
  try {
    localStorage.setItem(AUDIO_VAULT_KEY, JSON.stringify(tracks));
  } catch (e) {
    console.warn("[AudioVault] localStorage yazma hatası:", e);
  }
}

function _addAudioVaultTrackToStorage(track) {
  const tracks = getAudioVaultTracks();
  const demos   = tracks.filter(t => t.id.startsWith("av-"));
  const custom  = tracks.filter(t => !t.id.startsWith("av-"));
  custom.push(track);
  const merged = [...demos, ...custom];
  saveAudioVaultTracks(merged);
  return merged;
}

/* -------------------------------------------------------
   PLAYER STATE
   ------------------------------------------------------- */
const audioVaultState = {
  tracks: [],
  currentIndex: 0,
  audio: null,
  isPlaying: false,
  volume: 0.75
};

/* -------------------------------------------------------
   SECTION RENDER
   ------------------------------------------------------- */
function loadAudioVaultSection() {
  const section = document.getElementById("audio-vault-section");
  if (!section) return;

  audioVaultState.tracks = getAudioVaultTracks();

  section.innerHTML = `
    <button class="audio-back-btn" id="audiovault-back-btn">← Geri</button>

    <div class="audio-section-header">
      <span class="audio-section-emoji">🎙️</span>
      <h1 class="audio-section-title">Epik <span>Ses Kayıtları</span></h1>
      <p class="audio-section-subtitle">En unutulmaz anların ses arşivi</p>
    </div>

    <div class="audio-layout">
      <!-- PLAYER -->
      <div class="audio-player-card" id="audiovault-player-card">
        <div class="player-artwork-wrapper">
          <div class="player-artwork-placeholder" id="audiovault-artwork">🎙️</div>
        </div>

        <div class="player-track-info">
          <p class="player-track-title" id="audiovault-track-title">Kayıt seçin...</p>
          <p class="player-track-meta" id="audiovault-track-meta">Epik Ses Kayıtları</p>
        </div>

        <div class="player-progress-wrapper">
          <span class="player-time" id="audiovault-time-cur">0:00</span>
          <input
            type="range"
            class="player-range"
            id="audiovault-progress"
            min="0" max="100" value="0"
            aria-label="Oynatma pozisyonu"
          />
          <span class="player-time time-end" id="audiovault-time-end">0:00</span>
        </div>

        <div class="player-controls">
          <button class="player-btn" id="audiovault-prev-btn" aria-label="Önceki kayıt" title="Önceki">⏮</button>
          <button class="player-btn player-play-btn" id="audiovault-play-btn" aria-label="Oynat / Duraklat">▶</button>
          <button class="player-btn" id="audiovault-next-btn" aria-label="Sonraki kayıt" title="Sonraki">⏭</button>
        </div>

        <div class="player-volume-row">
          <span class="player-volume-icon" id="audiovault-vol-icon" title="Sesi kapat/aç">🔊</span>
          <input
            type="range"
            class="player-volume-range"
            id="audiovault-volume"
            min="0" max="1" step="0.01" value="0.75"
            aria-label="Ses seviyesi"
          />
        </div>
      </div>

      <!-- TRACK LIST -->
      <div class="audio-tracklist-card">
        <div class="tracklist-header">
          <div style="display:flex; align-items:center; gap: 12px;">
            <span class="tracklist-title">🎙️ Ses Arşivi</span>
            ${typeof checkAdminStatus === 'function' && checkAdminStatus() ? `<button class="inline-add-btn" onclick="inlineAddNew('audio')">➕ Yeni Kayıt Ekle</button>` : ""}
          </div>
          <span class="tracklist-count" id="audiovault-track-count">0 Kayıt</span>
        </div>
        <div class="track-list" id="audiovault-track-list" role="listbox" aria-label="Ses kayıt listesi"></div>
      </div>
    </div>
  `;

  // Audio element
  if (audioVaultState.audio) {
    audioVaultState.audio.pause();
    audioVaultState.audio = null;
  }
  audioVaultState.audio = new Audio();
  audioVaultState.audio.volume = audioVaultState.volume;
  audioVaultState.isPlaying = false;

  _bindAudioVaultEvents();
  _renderAudioVaultTrackList();
  _selectAudioVaultTrack(0);

  // Back button
  document.getElementById("audiovault-back-btn")?.addEventListener("click", () => {
    if (audioVaultState.audio) {
      audioVaultState.audio.pause();
      audioVaultState.isPlaying = false;
    }
    if (typeof goHome === "function") goHome();
  });
}

/* -------------------------------------------------------
   TRACK LIST RENDER
   ------------------------------------------------------- */
function _renderAudioVaultTrackList() {
  const list  = document.getElementById("audiovault-track-list");
  const count = document.getElementById("audiovault-track-count");
  if (!list) return;

  const tracks = audioVaultState.tracks;
  if (count) count.textContent = `${tracks.length} Kayıt`;

  const isAdmin = typeof checkAdminStatus === 'function' && checkAdminStatus();

  if (tracks.length === 0) {
    list.innerHTML = `
      <div class="tracklist-empty">
        <span>🎙️</span>
        Henüz ses kaydı eklenmemiş.<br/>
        Yükleme panelinden ekleyebilirsin!
      </div>`;
    return;
  }

  list.innerHTML = tracks.map((t, i) => `
    <div
      class="track-item ${i === audioVaultState.currentIndex ? "active" : ""}"
      data-index="${i}"
      role="option"
      aria-selected="${i === audioVaultState.currentIndex}"
      tabindex="0"
      title="${_avEscHtml(t.title)}"
    >
      <div class="track-num">${i + 1}</div>
      <div class="track-info">
        <p class="track-name">${_avEscHtml(t.title)}</p>
        ${t.description ? `<p class="track-desc">${_avEscHtml(t.description)}</p>` : ""}
      </div>
      <div style="display:flex; align-items:center; gap: 8px; margin-left: auto;">
        ${t.url ? "" : '<span class="track-duration" title="Dosya eksik">—</span>'}
        ${isAdmin ? `
        <div class="inline-admin-actions-list">
          <button class="inline-edit-btn" onclick="inlineEdit('${t.id}', 'audio', event)" title="Düzenle">✏️</button>
          <button class="inline-delete-btn" onclick="inlineDelete('${t.id}', 'audio', event)" title="Sil">🗑️</button>
        </div>
        ` : ""}
      </div>
    </div>
  `).join("");

  list.querySelectorAll(".track-item").forEach(item => {
    item.addEventListener("click",   () => _selectAudioVaultTrack(+item.dataset.index));
    item.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") _selectAudioVaultTrack(+item.dataset.index);
    });
  });
}

/* -------------------------------------------------------
   PLAYER LOGIC
   ------------------------------------------------------- */
function _selectAudioVaultTrack(index) {
  const tracks = audioVaultState.tracks;
  if (!tracks || tracks.length === 0 || isNaN(index) || index < 0 || index >= tracks.length) return;

  const wasPlaying = audioVaultState.isPlaying;
  audioVaultState.currentIndex = index;
  const track = tracks[index];

  const audio = audioVaultState.audio;
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.src = track.url || "";
  }

  audioVaultState.isPlaying = false;
  _updateAudioVaultPlayerUI(track);
  _renderAudioVaultTrackList();

  if (wasPlaying && track.url) {
    _audioVaultPlay();
  }
}

function _audioVaultPlay() {
  const audio = audioVaultState.audio;
  const card  = document.getElementById("audiovault-player-card");
  const btn   = document.getElementById("audiovault-play-btn");
  const track = audioVaultState.tracks[audioVaultState.currentIndex];

  if (!track) return;

  if (!track.url) {
    _showAudioVaultToast("⚠️ Bu kaydın ses dosyası henüz eklenmemiş.");
    return;
  }

  audio.play().then(() => {
    audioVaultState.isPlaying = true;
    if (btn)  btn.textContent = "⏸";
    if (card) card.classList.add("is-playing");
    _markAVActiveTrackPlaying(true);
  }).catch(err => {
    console.warn("[AudioVault] Oynatma hatası:", err);
    _showAudioVaultToast("❌ Ses dosyası yüklenemedi.");
  });
}

function _audioVaultPause() {
  const audio = audioVaultState.audio;
  const card  = document.getElementById("audiovault-player-card");
  const btn   = document.getElementById("audiovault-play-btn");

  if (audio) audio.pause();
  audioVaultState.isPlaying = false;
  if (btn)  btn.textContent = "▶";
  if (card) card.classList.remove("is-playing");
  _markAVActiveTrackPlaying(false);
}

function _markAVActiveTrackPlaying(playing) {
  document.querySelectorAll("#audiovault-track-list .track-item").forEach((el, i) => {
    if (i === audioVaultState.currentIndex) {
      el.classList.toggle("is-playing", playing);
    }
  });
}

function _updateAudioVaultPlayerUI(track) {
  const titleEl = document.getElementById("audiovault-track-title");
  const metaEl  = document.getElementById("audiovault-track-meta");
  const artEl   = document.getElementById("audiovault-artwork");
  const btn     = document.getElementById("audiovault-play-btn");
  const card    = document.getElementById("audiovault-player-card");

  if (titleEl) titleEl.textContent = track.title;
  if (metaEl)  metaEl.textContent  = track.description || "Epik Ses Kayıtları";
  if (artEl)   artEl.textContent   = "🎙️";
  if (btn)     btn.textContent     = "▶";
  if (card)    card.classList.remove("is-playing");

  _setAVProgress(0, 0);
}

function _setAVProgress(current, duration) {
  const curEl  = document.getElementById("audiovault-time-cur");
  const endEl  = document.getElementById("audiovault-time-end");
  const slider = document.getElementById("audiovault-progress");

  if (curEl)  curEl.textContent = _avFormatTime(current);
  if (endEl)  endEl.textContent = _avFormatTime(duration);
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
function _bindAudioVaultEvents() {
  const audio   = audioVaultState.audio;
  const playBtn = document.getElementById("audiovault-play-btn");
  const prevBtn = document.getElementById("audiovault-prev-btn");
  const nextBtn = document.getElementById("audiovault-next-btn");
  const progressSlider = document.getElementById("audiovault-progress");
  const volumeSlider   = document.getElementById("audiovault-volume");
  const volIcon        = document.getElementById("audiovault-vol-icon");

  // Play / Pause
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      audioVaultState.isPlaying ? _audioVaultPause() : _audioVaultPlay();
    });
  }

  // Prev / Next
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (audioVaultState.tracks.length === 0) return;
      const idx = (audioVaultState.currentIndex - 1 + audioVaultState.tracks.length) % audioVaultState.tracks.length;
      _selectAudioVaultTrack(idx);
      if (audioVaultState.isPlaying) setTimeout(_audioVaultPlay, 100);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (audioVaultState.tracks.length === 0) return;
      const idx = (audioVaultState.currentIndex + 1) % audioVaultState.tracks.length;
      _selectAudioVaultTrack(idx);
      if (audioVaultState.isPlaying) setTimeout(_audioVaultPlay, 100);
    });
  }

  // Audio events
  if (audio) {
    audio.addEventListener("timeupdate", () => {
      _setAVProgress(audio.currentTime, audio.duration || 0);
    });

    audio.addEventListener("ended", () => {
      const next = (audioVaultState.currentIndex + 1) % audioVaultState.tracks.length;
      if (next !== 0 || audioVaultState.tracks.length === 1) {
        _selectAudioVaultTrack(next);
        setTimeout(_audioVaultPlay, 100);
      } else {
        _audioVaultPause();
        _selectAudioVaultTrack(0);
      }
    });

    audio.addEventListener("loadedmetadata", () => {
      _setAVProgress(0, audio.duration || 0);
    });
  }

  // Progress seek
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
      audioVaultState.volume = vol;
      if (audio) audio.volume = vol;
      volumeSlider.style.backgroundSize = `${vol * 100}% 100%`;
      if (volIcon) volIcon.textContent = vol === 0 ? "🔇" : vol < 0.4 ? "🔉" : "🔊";
    });
    volumeSlider.style.backgroundSize = `${audioVaultState.volume * 100}% 100%`;
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
function addAudioVaultFromUpload(track) {
  const updated = _addAudioVaultTrackToStorage(track);
  audioVaultState.tracks = updated;

  // Eğer audiovault section aktifse yeniden render et
  const section = document.getElementById("audio-vault-section");
  if (section && !section.classList.contains("hidden")) {
    _renderAudioVaultTrackList();
  }

  console.log("%c[AudioVault] Yeni kayıt eklendi:", "color:#f97316;font-weight:bold;", track);
}

/* -------------------------------------------------------
   HELPERS
   ------------------------------------------------------- */
function _avFormatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function _avEscHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function _showAudioVaultToast(msg) {
  const existing = document.getElementById("av-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.id = "av-toast";
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: "fixed", bottom: "32px", left: "50%",
    transform: "translateX(-50%) translateY(20px)",
    background: "rgba(13,16,23,0.95)", backdropFilter: "blur(12px)",
    color: "#f1f5f9", padding: "12px 24px", borderRadius: "50px",
    border: "1px solid rgba(249,115,22,0.4)", fontSize: "0.85rem",
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
