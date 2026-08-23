/* =====================================================
   FeroFUFU – js/modules/season1.js
   Litvus'un Soytarıları – Sezon 1
   Video Galerisi Modülü
   localStorage key: "ferofufu_season1"
   ===================================================== */

"use strict";

const S1_KEY = "ferofufu_season1";

/* -------------------------------------------------------
   DEFAULT / DEMO BÖLÜMLER
   ------------------------------------------------------- */
const DEFAULT_S1_EPISODES = [
  {
    id: "s1e1",
    title: "Kahramanların Doğuşu",
    description: "Litvus'un Soytarıları ilk kez bir araya geliyor. Kader onları birbirine bağladığında, macera başlamak zorunda!",
    embedUrl: "",
    thumbnail: "",
    addedAt: "2024-01-01",
    episodeNum: 1
  },
  {
    id: "s1e2",
    title: "Karanlık Orman",
    description: "Ekip, esrarengiz bir ormana giriyor. Her ağacın gölgesinde bir sır saklı...",
    embedUrl: "",
    thumbnail: "",
    addedAt: "2024-01-15",
    episodeNum: 2
  },
  {
    id: "s1e3",
    title: "Kont'un Şatosu",
    description: "Kont Mrakula'nın davetini reddetmek mümkün değil. Ama içerisi dışarısından çok daha tehlikeli.",
    embedUrl: "",
    thumbnail: "",
    addedAt: "2024-02-01",
    episodeNum: 3
  }
];

/* -------------------------------------------------------
   STORAGE HELPERS (FeroDB Cloud + Local Cache)
   ------------------------------------------------------- */
function getSeason1Episodes() {
  if (window.FeroDB && typeof window.FeroDB.getItems === "function") {
    return window.FeroDB.getItems("season1", DEFAULT_S1_EPISODES);
  }
  try {
    const raw = localStorage.getItem(S1_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("[Season1] localStorage okuma hatası:", e);
  }
  return DEFAULT_S1_EPISODES;
}

function saveSeason1Episodes(eps) {
  if (window.FeroDB && typeof window.FeroDB.saveCollection === "function") {
    window.FeroDB.saveCollection("season1", eps);
    return;
  }
  try {
    localStorage.setItem(S1_KEY, JSON.stringify(eps));
  } catch (e) {
    console.warn("[Season1] localStorage yazma hatası:", e);
  }
}

function _addS1EpisodeToStorage(ep) {
  const eps    = getSeason1Episodes();
  const demos  = eps.filter(e => e.id.startsWith("s1e"));
  const custom = eps.filter(e => !e.id.startsWith("s1e"));
  const nextNum = eps.length + 1;
  ep.episodeNum = ep.episodeNum || nextNum;
  custom.push(ep);
  const merged = [...demos, ...custom];
  
  if (window.FeroDB && typeof window.FeroDB.saveItem === "function") {
    window.FeroDB.saveItem("season1", ep);
  } else {
    saveSeason1Episodes(merged);
  }
  return merged;
}

// Canlı bulut güncellemelerini dinle
window.addEventListener("ferofufu_cloud_update", function(e) {
  if (e.detail && e.detail.collection === "season1") {
    s1State.episodes = e.detail.items;
    const section = document.getElementById("season1-section");
    if (section && !section.classList.contains("hidden")) {
      _renderS1Grid();
      const count = document.getElementById("s1-ep-count");
      if (count) count.textContent = `${s1State.episodes.length} Bölüm`;
    }
  }
});

/* -------------------------------------------------------
   MODULE STATE
   ------------------------------------------------------- */
const s1State = {
  episodes: [],
  activeIndex: -1
};

/* -------------------------------------------------------
   SECTION RENDER
   ------------------------------------------------------- */
function loadSeason1Section() {
  const section = document.getElementById("season1-section");
  if (!section) return;

  s1State.episodes   = getSeason1Episodes();
  s1State.activeIndex = -1;

  section.innerHTML = `
    <button class="vs-back-btn" id="s1-back-btn">← Geri</button>

    <div class="video-section-inner">

      <!-- HEADER -->
      <div class="vs-header">
        <span class="vs-header-badge">🎭 DnD Serüveni · Sezon 1</span>
        <h1 class="vs-header-title">
          Litvus'un <span class="vs-accent-text">Soytarıları</span>
        </h1>
        <p class="vs-header-subtitle">Efsanenin başladığı yer. Her bölüm yeni bir macera, yeni bir kader.</p>
      </div>

      <!-- ANA PLAYER -->
      <div class="vs-main-player" id="s1-main-player">
        <div class="vs-player-empty" id="s1-player-empty">
          <span class="vs-player-empty-icon">🎭</span>
          <p class="vs-player-empty-text">Aşağıdan bir bölüm seç ve izlemeye başla!</p>
        </div>
        <div class="vs-iframe-wrapper" id="s1-iframe-wrapper" style="display:none;"></div>
        <div class="vs-player-info" id="s1-player-info" style="display:none;">
          <div>
            <p class="vs-player-ep-label" id="s1-player-ep-label">Bölüm 1</p>
            <p class="vs-player-ep-title" id="s1-player-ep-title">—</p>
            <p class="vs-player-ep-desc"  id="s1-player-ep-desc">—</p>
          </div>
          <p class="vs-player-ep-date" id="s1-player-ep-date"></p>
        </div>
      </div>

      <!-- EPİZOD LİSTESİ -->
      <div>
        <div class="vs-grid-header">
          <div style="display:flex; align-items:center; gap: 12px;">
            <span class="vs-grid-title">📋 Tüm Bölümler</span>
            ${typeof checkAdminStatus === 'function' && checkAdminStatus() ? `<button class="inline-add-btn" onclick="inlineAddNew('season1')">➕ Yeni Bölüm Ekle</button>` : ""}
          </div>
          <span class="vs-episode-count" id="s1-ep-count">0 Bölüm</span>
        </div>
        <div class="vs-grid" id="s1-grid" role="list" aria-label="Sezon 1 bölümleri"></div>
      </div>

    </div>
  `;

  _renderS1Grid();

  // Back button
  document.getElementById("s1-back-btn")?.addEventListener("click", () => {
    _s1StopPlayer();
    if (typeof goHome === "function") goHome();
  });
}

/* -------------------------------------------------------
   GRID RENDER
   ------------------------------------------------------- */
function _renderS1Grid() {
  const grid  = document.getElementById("s1-grid");
  const count = document.getElementById("s1-ep-count");
  if (!grid) return;

  const eps = s1State.episodes;
  if (count) count.textContent = `${eps.length} Bölüm`;

  const isAdmin = typeof checkAdminStatus === 'function' && checkAdminStatus();

  if (eps.length === 0) {
    grid.innerHTML = `
      <div class="vs-grid-empty">
        <span>🎭</span>
        <p>Henüz bölüm eklenmemiş.<br/>
        Yükleme panelinden yeni bölüm ekleyebilirsin!</p>
      </div>`;
    return;
  }

  grid.innerHTML = eps.map((ep, i) => `
    <div
      class="vs-card ${i === s1State.activeIndex ? "active" : ""}"
      data-index="${i}"
      role="listitem"
      tabindex="0"
      aria-label="Bölüm ${ep.episodeNum || i+1}: ${_s1Esc(ep.title)}"
    >
      <div class="vs-card-thumb">
        ${ep.thumbnail
          ? `<img src="${_s1Esc(ep.thumbnail)}" alt="${_s1Esc(ep.title)}" loading="lazy" />`
          : `<div class="vs-thumb-placeholder">🎭</div>`}
        <div class="vs-card-play-overlay">
          <div class="vs-play-circle">▶</div>
        </div>
        <span class="vs-ep-badge">Bölüm ${ep.episodeNum || i+1}</span>
        <div class="vs-now-playing">
          <span>▶</span> İzleniyor
        </div>
      </div>
      <div class="vs-card-body">
        <p class="vs-card-ep-num">Bölüm ${ep.episodeNum || i+1}</p>
        <p class="vs-card-title">${_s1Esc(ep.title)}</p>
        ${ep.description ? `<p class="vs-card-desc">${_s1Esc(ep.description)}</p>` : ""}
        <p class="vs-card-date">${_s1Esc(ep.addedAt || "")}</p>
      </div>
      ${isAdmin ? `
      <div class="inline-admin-actions">
        <button class="inline-edit-btn" onclick="inlineEdit('${ep.id}', 'season1', event)" title="Düzenle">✏️</button>
        <button class="inline-delete-btn" onclick="inlineDelete('${ep.id}', 'season1', event)" title="Sil">🗑️</button>
      </div>
      ` : ""}
    </div>
  `).join("");

  grid.querySelectorAll(".vs-card").forEach(card => {
    card.addEventListener("click",   () => _selectS1Episode(+card.dataset.index));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        _selectS1Episode(+card.dataset.index);
      }
    });
  });
}

/* -------------------------------------------------------
   PLAYER LOGIC
   ------------------------------------------------------- */
function _selectS1Episode(index) {
  const eps = s1State.episodes;
  if (index < 0 || index >= eps.length) return;

  s1State.activeIndex = index;
  const ep = eps[index];

  _renderS1Grid(); // re-render to update active card

  const player       = document.getElementById("s1-main-player");
  const emptyEl      = document.getElementById("s1-player-empty");
  const iframeWrap   = document.getElementById("s1-iframe-wrapper");
  const infoEl       = document.getElementById("s1-player-info");
  const labelEl      = document.getElementById("s1-player-ep-label");
  const titleEl      = document.getElementById("s1-player-ep-title");
  const descEl       = document.getElementById("s1-player-ep-desc");
  const dateEl       = document.getElementById("s1-player-ep-date");

  if (!ep.embedUrl) {
    // No video yet – show placeholder
    if (emptyEl) {
      emptyEl.style.display = "";
      emptyEl.innerHTML = `
        <span class="vs-player-empty-icon">🎭</span>
        <p class="vs-player-empty-text">Bu bölümün video linki henüz eklenmemiş.<br/>
        Yükleme panelinden ekleyebilirsin!</p>`;
    }
    if (iframeWrap) iframeWrap.style.display = "none";
    if (infoEl) infoEl.style.display = "none";
    if (player)  player.classList.remove("has-video");
    return;
  }

  // Build iframe
  if (emptyEl)    emptyEl.style.display    = "none";
  if (iframeWrap) {
    iframeWrap.style.display = "";
    const safeSrc = (ep.embedUrl && (ep.embedUrl.startsWith('https://') || ep.embedUrl.startsWith('http://') || ep.embedUrl.startsWith('//'))) ? _s1Esc(ep.embedUrl) + (ep.embedUrl.includes('?') ? '&' : '?') + 'rel=0&modestbranding=1&autoplay=1' : '';
    iframeWrap.innerHTML = `
      <iframe
        src="${safeSrc}"
        title="${_s1Esc(ep.title)}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        loading="lazy"
      ></iframe>`;
  }
  if (infoEl)  infoEl.style.display  = "";
  if (player)  player.classList.add("has-video");

  // Fill info
  if (labelEl) labelEl.textContent = `Bölüm ${ep.episodeNum || index+1}`;
  if (titleEl) titleEl.textContent = ep.title;
  if (descEl)  descEl.textContent  = ep.description || "";
  if (dateEl)  dateEl.textContent  = ep.addedAt ? `📅 ${ep.addedAt}` : "";

  // Scroll to player
  const playerEl = document.getElementById("s1-main-player");
  if (playerEl) playerEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function _s1StopPlayer() {
  const iframeWrap = document.getElementById("s1-iframe-wrapper");
  if (iframeWrap) iframeWrap.innerHTML = "";
}

/* -------------------------------------------------------
   PUBLIC API – Upload modülünden çağrılır
   ------------------------------------------------------- */
function addSeason1FromUpload(ep) {
  const updated = _addS1EpisodeToStorage(ep);
  s1State.episodes = updated;

  // Eğer section aktifse grid'i yenile
  const section = document.getElementById("season1-section");
  if (section && !section.classList.contains("hidden")) {
    _renderS1Grid();
    const count = document.getElementById("s1-ep-count");
    if (count) count.textContent = `${updated.length} Bölüm`;
  }

  console.log("%c[Season1] Yeni bölüm eklendi:", "color:#8b5cf6;font-weight:bold;", ep);
}

/* -------------------------------------------------------
   HELPERS
   ------------------------------------------------------- */
function _s1Esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
