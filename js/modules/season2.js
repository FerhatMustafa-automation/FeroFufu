/* =====================================================
   FeroFUFU – js/modules/season2.js
   Litvus'un Soytarıları – Sezon 2
   Video Galerisi Modülü
   localStorage key: "ferofufu_season2"
   ===================================================== */

"use strict";

const S2_KEY = "ferofufu_season2";

/* -------------------------------------------------------
   DEFAULT / DEMO BÖLÜMLER
   ------------------------------------------------------- */
const DEFAULT_S2_EPISODES = [
  {
    id: "s2e1",
    title: "Yeni Tehdit",
    description: "Sezon 2 başlıyor! Eski ekip yeni bir tehditle yüz yüze. Bu sefer bahisler çok daha yüksek...",
    embedUrl: "",
    thumbnail: "",
    addedAt: "2024-06-01",
    episodeNum: 1
  },
  {
    id: "s2e2",
    title: "Kayıp Şövalye",
    description: "Ekibin bir üyesi gizemli bir şekilde kayboluyor. Onu bulmak için her şeyi göze almalılar.",
    embedUrl: "",
    thumbnail: "",
    addedAt: "2024-06-15",
    episodeNum: 2
  },
  {
    id: "s2e3",
    title: "Son Savaş",
    description: "Her şey bu ana geliyor. Litvus'un Soytarıları son kez bir araya geliyor. Acaba kim hayatta kalacak?",
    embedUrl: "",
    thumbnail: "",
    addedAt: "2024-07-01",
    episodeNum: 3
  }
];

/* -------------------------------------------------------
   STORAGE HELPERS (FeroDB Cloud + Local Cache)
   ------------------------------------------------------- */
function getSeason2Episodes() {
  if (window.FeroDB && typeof window.FeroDB.getItems === "function") {
    return window.FeroDB.getItems("season2", DEFAULT_S2_EPISODES);
  }
  try {
    const raw = localStorage.getItem(S2_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("[Season2] localStorage okuma hatası:", e);
  }
  return DEFAULT_S2_EPISODES;
}

function saveSeason2Episodes(eps) {
  if (window.FeroDB && typeof window.FeroDB.saveCollection === "function") {
    window.FeroDB.saveCollection("season2", eps);
    return;
  }
  try {
    localStorage.setItem(S2_KEY, JSON.stringify(eps));
  } catch (e) {
    console.warn("[Season2] localStorage yazma hatası:", e);
  }
}

function _addS2EpisodeToStorage(ep) {
  const eps    = getSeason2Episodes();
  const demos  = eps.filter(e => e.id.startsWith("s2e"));
  const custom = eps.filter(e => !e.id.startsWith("s2e"));
  const nextNum = eps.length + 1;
  ep.episodeNum = ep.episodeNum || nextNum;
  custom.push(ep);
  const merged = [...demos, ...custom];
  
  if (window.FeroDB && typeof window.FeroDB.saveItem === "function") {
    window.FeroDB.saveItem("season2", ep);
  } else {
    saveSeason2Episodes(merged);
  }
  return merged;
}

// Canlı bulut güncellemelerini dinle
window.addEventListener("ferofufu_cloud_update", function(e) {
  if (e.detail && e.detail.collection === "season2") {
    s2State.episodes = e.detail.items;
    const section = document.getElementById("season2-section");
    if (section && !section.classList.contains("hidden")) {
      _renderS2Grid();
      const count = document.getElementById("s2-ep-count");
      if (count) count.textContent = `${s2State.episodes.length} Bölüm`;
    }
  }
});

/* -------------------------------------------------------
   MODULE STATE
   ------------------------------------------------------- */
const s2State = {
  episodes: [],
  activeIndex: -1
};

/* -------------------------------------------------------
   SECTION RENDER
   ------------------------------------------------------- */
function loadSeason2Section() {
  const section = document.getElementById("season2-section");
  if (!section) return;

  s2State.episodes   = getSeason2Episodes();
  s2State.activeIndex = -1;

  section.innerHTML = `
    <button class="vs-back-btn" id="s2-back-btn">← Geri</button>

    <div class="video-section-inner">

      <!-- HEADER -->
      <div class="vs-header">
        <span class="vs-header-badge">🎭 DnD Serüveni · Sezon 2</span>
        <h1 class="vs-header-title">
          Soytarıların <span class="vs-accent-text">Dönüşü</span>
        </h1>
        <p class="vs-header-subtitle">Efsane devam ediyor. Yeni düşmanlar, yeni sırlar, yeni kayıplar.</p>
      </div>

      <!-- ANA PLAYER -->
      <div class="vs-main-player" id="s2-main-player">
        <div class="vs-player-empty" id="s2-player-empty">
          <span class="vs-player-empty-icon">🎭</span>
          <p class="vs-player-empty-text">Aşağıdan bir bölüm seç ve izlemeye başla!</p>
        </div>
        <div class="vs-iframe-wrapper" id="s2-iframe-wrapper" style="display:none;"></div>
        <div class="vs-player-info" id="s2-player-info" style="display:none;">
          <div>
            <p class="vs-player-ep-label" id="s2-player-ep-label">Bölüm 1</p>
            <p class="vs-player-ep-title" id="s2-player-ep-title">—</p>
            <p class="vs-player-ep-desc"  id="s2-player-ep-desc">—</p>
          </div>
          <p class="vs-player-ep-date" id="s2-player-ep-date"></p>
        </div>
      </div>

      <!-- EPİZOD LİSTESİ -->
      <div>
        <div class="vs-grid-header">
          <div style="display:flex; align-items:center; gap: 12px;">
            <span class="vs-grid-title">📋 Tüm Bölümler</span>
            ${typeof checkAdminStatus === 'function' && checkAdminStatus() ? `<button class="inline-add-btn" onclick="inlineAddNew('season2')">➕ Yeni Bölüm Ekle</button>` : ""}
          </div>
          <span class="vs-episode-count" id="s2-ep-count">0 Bölüm</span>
        </div>
        <div class="vs-grid" id="s2-grid" role="list" aria-label="Sezon 2 bölümleri"></div>
      </div>

    </div>
  `;

  _renderS2Grid();

  // Back button
  document.getElementById("s2-back-btn")?.addEventListener("click", () => {
    _s2StopPlayer();
    if (typeof goHome === "function") goHome();
  });
}

/* -------------------------------------------------------
   GRID RENDER
   ------------------------------------------------------- */
function _renderS2Grid() {
  const grid  = document.getElementById("s2-grid");
  const count = document.getElementById("s2-ep-count");
  if (!grid) return;

  const eps = s2State.episodes;
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
      class="vs-card ${i === s2State.activeIndex ? "active" : ""}"
      data-index="${i}"
      role="listitem"
      tabindex="0"
      aria-label="Bölüm ${ep.episodeNum || i+1}: ${_s2Esc(ep.title)}"
    >
      <div class="vs-card-thumb">
        ${ep.thumbnail
          ? `<img src="${_s2Esc(ep.thumbnail)}" alt="${_s2Esc(ep.title)}" loading="lazy" />`
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
        <p class="vs-card-title">${_s2Esc(ep.title)}</p>
        ${ep.description ? `<p class="vs-card-desc">${_s2Esc(ep.description)}</p>` : ""}
        <p class="vs-card-date">${_s2Esc(ep.addedAt || "")}</p>
      </div>
      ${isAdmin ? `
      <div class="inline-admin-actions">
        <button class="inline-edit-btn" onclick="inlineEdit('${ep.id}', 'season2', event)" title="Düzenle">✏️</button>
        <button class="inline-delete-btn" onclick="inlineDelete('${ep.id}', 'season2', event)" title="Sil">🗑️</button>
      </div>
      ` : ""}
    </div>
  `).join("");

  grid.querySelectorAll(".vs-card").forEach(card => {
    card.addEventListener("click",   () => _selectS2Episode(+card.dataset.index));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        _selectS2Episode(+card.dataset.index);
      }
    });
  });
}

/* -------------------------------------------------------
   PLAYER LOGIC
   ------------------------------------------------------- */
function _selectS2Episode(index) {
  const eps = s2State.episodes;
  if (index < 0 || index >= eps.length) return;

  s2State.activeIndex = index;
  const ep = eps[index];

  _renderS2Grid();

  const player       = document.getElementById("s2-main-player");
  const emptyEl      = document.getElementById("s2-player-empty");
  const iframeWrap   = document.getElementById("s2-iframe-wrapper");
  const infoEl       = document.getElementById("s2-player-info");
  const labelEl      = document.getElementById("s2-player-ep-label");
  const titleEl      = document.getElementById("s2-player-ep-title");
  const descEl       = document.getElementById("s2-player-ep-desc");
  const dateEl       = document.getElementById("s2-player-ep-date");

  if (!ep.embedUrl) {
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

  if (emptyEl)    emptyEl.style.display = "none";
  if (iframeWrap) {
    iframeWrap.style.display = "";
    const safeSrc = (ep.embedUrl && (ep.embedUrl.startsWith('https://') || ep.embedUrl.startsWith('http://') || ep.embedUrl.startsWith('//'))) ? _s2Esc(ep.embedUrl) + (ep.embedUrl.includes('?') ? '&' : '?') + 'rel=0&modestbranding=1&autoplay=1' : '';
    iframeWrap.innerHTML = `
      <iframe
        src="${safeSrc}"
        title="${_s2Esc(ep.title)}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        loading="lazy"
      ></iframe>`;
  }
  if (infoEl)  infoEl.style.display  = "";
  if (player)  player.classList.add("has-video");

  if (labelEl) labelEl.textContent = `Bölüm ${ep.episodeNum || index+1}`;
  if (titleEl) titleEl.textContent = ep.title;
  if (descEl)  descEl.textContent  = ep.description || "";
  if (dateEl)  dateEl.textContent  = ep.addedAt ? `📅 ${ep.addedAt}` : "";

  const playerEl = document.getElementById("s2-main-player");
  if (playerEl) playerEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function _s2StopPlayer() {
  const iframeWrap = document.getElementById("s2-iframe-wrapper");
  if (iframeWrap) iframeWrap.innerHTML = "";
}

/* -------------------------------------------------------
   PUBLIC API – Upload modülünden çağrılır
   ------------------------------------------------------- */
function addSeason2FromUpload(ep) {
  const updated = _addS2EpisodeToStorage(ep);
  s2State.episodes = updated;

  const section = document.getElementById("season2-section");
  if (section && !section.classList.contains("hidden")) {
    _renderS2Grid();
    const count = document.getElementById("s2-ep-count");
    if (count) count.textContent = `${updated.length} Bölüm`;
  }

  console.log("%c[Season2] Yeni bölüm eklendi:", "color:#ef4444;font-weight:bold;", ep);
}

/* -------------------------------------------------------
   HELPERS
   ------------------------------------------------------- */
function _s2Esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
