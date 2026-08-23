/* =====================================================
   FeroFUFU – js/modules/fufuMaker.js
   Özel Turnuva Oluşturucu (FeroFUFU Maker) Motoru
   ===================================================== */

"use strict";

const FufuMaker = (function () {
  const STORAGE_KEY = "ferofufu_custom_tournaments";

  let currentDraft = {
    id: "",
    title: "",
    description: "",
    question: "Hangisi daha iyi?",
    icon: "🏆",
    coverImage: "",
    items: []
  };

  let activeTab = "create"; // "create" | "library"

  /* ---------- LocalStorage Helpers ---------- */
  function getCustomTournaments() {
    if (window.FeroDB && typeof window.FeroDB.getItems === "function") {
      return window.FeroDB.getItems("tournament", []);
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("[FufuMaker] Kütüphane okuma hatası:", e);
      return [];
    }
  }

  function saveCustomTournaments(list) {
    if (window.FeroDB && typeof window.FeroDB.saveCollection === "function") {
      window.FeroDB.saveCollection("tournament", list);
      return { success: true };
    }
    if (window.feroMedia && window.feroMedia.safeSave) {
      return window.feroMedia.safeSave(STORAGE_KEY, JSON.stringify(list));
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  /* ---------- Initialization ---------- */
  function init() {
    const container = document.getElementById("fufu-maker-section");
    if (!container) return;
    render();
  }

  /* ---------- Render Functions ---------- */
  function render() {
    const container = document.getElementById("fufu-maker-section");
    if (!container) return;

    const tournaments = getCustomTournaments();

    container.innerHTML = `
      <div class="maker-section">
        <div class="maker-header">
          <div class="maker-badge">✨ Stüdyo &amp; Turnuva Motoru</div>
          <h1 class="maker-title">FeroFUFU Maker</h1>
          <p class="maker-subtitle">Kendi 1v1 eleme turnuvanı tasarla, arkadaşlarınla paylaş veya hemen oyna!</p>
        </div>

        <div class="maker-tabs">
          <button class="maker-tab-btn ${activeTab === 'create' ? 'active' : ''}" id="maker-tab-create">
            <span>✨</span> Yeni Turnuva Oluştur
          </button>
          <button class="maker-tab-btn ${activeTab === 'library' ? 'active' : ''}" id="maker-tab-lib">
            <span>📚</span> Kayıtlı Turnuvalarım (${tournaments.length})
          </button>
        </div>

        <div id="maker-tab-content">
          ${activeTab === 'create' ? renderCreateTab() : renderLibraryTab(tournaments)}
        </div>
      </div>
    `;

    attachEvents();
  }

  function renderCreateTab() {
    return `
      <div class="maker-box">
        <form id="maker-form" onsubmit="event.preventDefault();">
          <div class="maker-form-grid">
            <div class="maker-field">
              <label for="maker-input-title">Turnuva Başlığı *</label>
              <input type="text" id="maker-input-title" class="maker-input" placeholder="Örn: En Güçlü Büyücüler" value="${escapeHtml(currentDraft.title)}" required />
            </div>

            <div class="maker-field">
              <label for="maker-input-question">Oylama Sorusu (VS Sorusu)</label>
              <input type="text" id="maker-input-question" class="maker-input" placeholder="Örn: Hangisi 1v1'de kazanır?" value="${escapeHtml(currentDraft.question)}" />
            </div>

            <div class="maker-field" style="grid-column: 1 / -1;">
              <label for="maker-input-desc">Turnuva Açıklaması</label>
              <textarea id="maker-input-desc" class="maker-textarea" rows="2" placeholder="Turnuva hakkında kısa bilgi...">${escapeHtml(currentDraft.description)}</textarea>
            </div>
          </div>

          <div class="maker-items-header">
            <div class="maker-items-title">
              <span>🎭 Karakter &amp; Öğe Havuzu</span>
              <span class="maker-item-count-badge" id="maker-count-badge">${currentDraft.items.length} Öğe</span>
            </div>

            <div class="maker-item-actions">
              <button type="button" class="maker-btn-sm" id="maker-btn-import-dnd">
                <span>📥</span> DnD Karakterlerini Aktar
              </button>
              <button type="button" class="maker-btn-sm" id="maker-btn-clear-items">
                <span>🧹</span> Temizle
              </button>
            </div>
          </div>

          <!-- Batch Upload Dropzone -->
          <div class="maker-dropzone" id="maker-dropzone">
            <div class="maker-dropzone-icon">🖼️</div>
            <div class="maker-dropzone-text">Görselleri Sürükle veya Dosya Seç</div>
            <div class="maker-dropzone-hint">Toplu seçim yapabilirsiniz. Otomatik sıkıştırılır. (Önerilen: 8, 16 veya 32 öğe)</div>
            <input type="file" id="maker-file-input" multiple accept="image/*" style="display: none;" />
          </div>

          <!-- Items Grid -->
          <div class="maker-items-grid" id="maker-items-grid">
            ${renderItemCards()}
          </div>

          <!-- Actions Footer -->
          <div class="maker-footer-actions">
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button type="button" class="maker-secondary-btn" id="maker-btn-save-lib" style="background: rgba(6, 182, 212, 0.18); border-color: rgba(6, 182, 212, 0.4); color: #06b6d4;">
                <span>💾</span> Topluluğa Kaydet
              </button>
              <button type="button" class="maker-secondary-btn" id="maker-btn-export-json">
                <span>📤</span> JSON İndir
              </button>
              <label class="maker-secondary-btn" style="cursor:pointer; margin:0;">
                <span>📥</span> JSON İçe Aktar
                <input type="file" id="maker-import-json-input" accept=".json" style="display:none;" />
              </label>
            </div>

            <button type="button" class="maker-main-btn" id="maker-btn-play-now">
              <span>🎮</span> Turnuvayı Başlat! (${currentDraft.items.length} Öğe)
            </button>
          </div>
        </form>
      </div>
    `;
  }

  function renderItemCards() {
    if (currentDraft.items.length === 0) {
      return `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted, #C0B297); padding: 30px;">
          Henüz karakter veya öğe eklenmedi. Yukarıdan resim yükleyebilir veya hazır DnD listesini aktarabilirsiniz.
        </div>
      `;
    }

    return currentDraft.items.map((item, idx) => `
      <div class="maker-item-card" data-index="${idx}">
        <button type="button" class="maker-item-remove-btn" onclick="FufuMaker.removeItem(${idx})" title="Sil">✕</button>
        <div class="maker-item-img-wrap">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="maker-item-img" />
        </div>
        <div class="maker-item-fields">
          <input type="text" class="maker-item-name-input" value="${escapeHtml(item.name)}" placeholder="İsim..." oninput="FufuMaker.updateItemName(${idx}, this.value)" />
          <input type="text" class="maker-item-desc-input" value="${escapeHtml(item.description || '')}" placeholder="Açıklama / Sınıf..." oninput="FufuMaker.updateItemDesc(${idx}, this.value)" />
        </div>
      </div>
    `).join("");
  }

  function renderLibraryTab(tournaments) {
    if (tournaments.length === 0) {
      return `
        <div class="maker-box">
          <div class="maker-empty-state">
            <div class="maker-empty-icon">📭</div>
            <h3>Henüz Kayıtlı Turnuva Yok</h3>
            <p>Oluşturduğun turnuvalar burada listelenir. Hemen yukarıdan ilk turnuvanı tasarla!</p>
            <button class="maker-main-btn" style="margin-top:16px;" onclick="FufuMaker.switchTab('create')">
              ✨ Turnuva Oluştur
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="maker-library-grid">
        ${tournaments.map(t => {
          const cover = t.coverImage || (t.items && t.items[0] && t.items[0].image) || "";
          return `
            <div class="maker-lib-card">
              ${cover ? `<img src="${escapeHtml(cover)}" class="maker-lib-cover" alt="${escapeHtml(t.title)}" />` : `<div class="maker-lib-cover" style="display:flex;align-items:center;justify-content:center;font-size:2.5rem;">🏆</div>`}
              <div class="maker-lib-content">
                <h3 class="maker-lib-title">${escapeHtml(t.title)}</h3>
                <p class="maker-lib-desc">${escapeHtml(t.description || 'Açıklama yok.')}</p>
                <div class="maker-lib-meta">
                  <span>${t.items ? t.items.length : 0} Karakter</span>
                  <span>${t.createdAt || ''}</span>
                </div>
                <div class="maker-lib-btns">
                  <button class="maker-lib-play-btn" onclick="FufuMaker.playSavedTournament('${t.id}')">🎮 Oyna</button>
                  <button class="maker-lib-export-btn" onclick="FufuMaker.exportSingleJSON('${t.id}')" title="Dışa Aktar">📤</button>
                  <button class="maker-lib-del-btn" onclick="FufuMaker.deleteTournament('${t.id}')" title="Sil">🗑️</button>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  /* ---------- Event Attachments ---------- */
  function attachEvents() {
    // Tabs
    document.getElementById("maker-tab-create")?.addEventListener("click", () => switchTab("create"));
    document.getElementById("maker-tab-lib")?.addEventListener("click", () => switchTab("library"));

    if (activeTab !== "create") return;

    // Inputs binding
    const titleInput = document.getElementById("maker-input-title");
    const qInput = document.getElementById("maker-input-question");
    const descInput = document.getElementById("maker-input-desc");

    titleInput?.addEventListener("input", (e) => { currentDraft.title = e.target.value; });
    qInput?.addEventListener("input", (e) => { currentDraft.question = e.target.value; });
    descInput?.addEventListener("input", (e) => { currentDraft.description = e.target.value; });

    // Dropzone & File picker
    const dropzone = document.getElementById("maker-dropzone");
    const fileInput = document.getElementById("maker-file-input");

    dropzone?.addEventListener("click", () => fileInput?.click());
    fileInput?.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleBatchFiles(Array.from(e.target.files));
      }
    });

    dropzone?.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });
    dropzone?.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });
    dropzone?.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleBatchFiles(Array.from(e.dataTransfer.files));
      }
    });

    // Preset import
    document.getElementById("maker-btn-import-dnd")?.addEventListener("click", importDnDPreset);
    document.getElementById("maker-btn-clear-items")?.addEventListener("click", () => {
      if (confirm("Tüm karakterleri silmek istediğinize emin misiniz?")) {
        currentDraft.items = [];
        updateItemsGrid();
      }
    });

    // Actions
    document.getElementById("maker-btn-save-lib")?.addEventListener("click", saveDraftToLibrary);
    document.getElementById("maker-btn-export-json")?.addEventListener("click", exportCurrentDraftJSON);
    document.getElementById("maker-btn-play-now")?.addEventListener("click", startTournamentFromDraft);

    // JSON Import input
    document.getElementById("maker-import-json-input")?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (file) importTournamentFile(file);
    });
  }

  /* ---------- Logic / Operations ---------- */
  function switchTab(tab) {
    activeTab = tab;
    render();
  }

  async function handleBatchFiles(files) {
    const imageFiles = files.filter(f => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    for (let file of imageFiles) {
      try {
        let dataUrl = "";
        if (window.feroMedia && window.feroMedia.compressImage) {
          dataUrl = await window.feroMedia.compressImage(file, { maxWidth: 600, maxHeight: 600, quality: 0.75 });
        } else {
          dataUrl = await readFileAsBase64(file);
        }

        const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        currentDraft.items.push({
          id: "item-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
          name: rawName.charAt(0).toUpperCase() + rawName.slice(1),
          description: "",
          image: dataUrl
        });
      } catch (err) {
        console.error("[FufuMaker] Dosya sıkıştırma hatası:", err);
      }
    }

    updateItemsGrid();
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function importDnDPreset() {
    let sourceChars = [];
    if (typeof getDndCharacters === "function") {
      sourceChars = getDndCharacters();
    } else if (typeof dndCharacters !== "undefined") {
      sourceChars = dndCharacters;
    }

    if (sourceChars.length === 0) {
      alert("DnD karakterleri bulunamadı.");
      return;
    }

    sourceChars.forEach(c => {
      currentDraft.items.push({
        id: "dnd-" + c.id + "-" + Date.now(),
        name: c.name,
        description: c.description || c.class || "",
        image: c.image
      });
    });

    if (!currentDraft.title) {
      currentDraft.title = "Litvus'un Soytarıları Özel Turnuva";
    }

    render();
  }

  function updateItemsGrid() {
    const grid = document.getElementById("maker-items-grid");
    const badge = document.getElementById("maker-count-badge");
    const playBtn = document.getElementById("maker-btn-play-now");

    if (grid) grid.innerHTML = renderItemCards();
    if (badge) badge.textContent = `${currentDraft.items.length} Öğe`;
    if (playBtn) playBtn.innerHTML = `<span>🎮</span> Turnuvayı Başlat! (${currentDraft.items.length} Öğe)`;
  }

  function removeItem(index) {
    currentDraft.items.splice(index, 1);
    updateItemsGrid();
  }

  function updateItemName(index, val) {
    if (currentDraft.items[index]) currentDraft.items[index].name = val;
  }

  function updateItemDesc(index, val) {
    if (currentDraft.items[index]) currentDraft.items[index].description = val;
  }

  function saveDraftToLibrary() {
    if (!currentDraft.title.trim()) {
      alert("Lütfen turnuva başlığı girin.");
      return;
    }
    if (currentDraft.items.length < 2) {
      alert("Turnuva için en az 2 karakter/öğe eklemelisiniz.");
      return;
    }

    const list = getCustomTournaments();
    const tournament = {
      id: currentDraft.id || "custom-" + Date.now(),
      title: currentDraft.title.trim(),
      description: currentDraft.description.trim(),
      question: currentDraft.question.trim() || "Hangisi daha iyi?",
      icon: currentDraft.icon || "🏆",
      coverImage: currentDraft.items[0]?.image || "",
      items: currentDraft.items,
      createdAt: new Date().toLocaleDateString("tr-TR")
    };

    const existingIdx = list.findIndex(t => t.id === tournament.id);
    if (existingIdx >= 0) {
      list[existingIdx] = tournament;
    } else {
      list.unshift(tournament);
    }

    const res = saveCustomTournaments(list);
    if (res.success) {
      if (confirm(`✅ "${tournament.title}" turnuvası Topluluk Galerisine başarıyla kaydedildi!\n\nTopluluk Galerisine gitmek ister misiniz?`)) {
        if (typeof loadCategory === "function") loadCategory("community");
      } else {
        switchTab("library");
      }
    } else {
      alert(`❌ Kaydedilirken hata oluştu: ${res.error}`);
    }
  }

  function deleteTournament(id) {
    if (!confirm("Bu turnuvayı silmek istediğinize emin misiniz?")) return;
    let list = getCustomTournaments();
    list = list.filter(t => t.id !== id);
    saveCustomTournaments(list);
    render();
  }

  function exportCurrentDraftJSON() {
    if (currentDraft.items.length === 0) {
      alert("Dışa aktarmak için en az 1 öğe olmalıdır.");
      return;
    }
    downloadJSON(currentDraft, (currentDraft.title || "ferofufu-turnuva") + ".json");
  }

  function exportSingleJSON(id) {
    const list = getCustomTournaments();
    const item = list.find(t => t.id === id);
    if (item) downloadJSON(item, (item.title || "ferofufu-turnuva") + ".json");
  }

  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importTournamentFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
          throw new Error("Geçersiz turnuva formatı (öğe bulunamadı).");
        }
        currentDraft = {
          id: "custom-" + Date.now(),
          title: parsed.title || "İçe Aktarılan Turnuva",
          description: parsed.description || "",
          question: parsed.question || "Hangisi daha iyi?",
          icon: parsed.icon || "🏆",
          coverImage: parsed.coverImage || parsed.items[0]?.image || "",
          items: parsed.items
        };
        switchTab("create");
        alert(`✅ "${currentDraft.title}" başarıyla yüklendi!`);
      } catch (err) {
        alert("❌ JSON dosyası okunamadı: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  /* ---------- Launch Tournament into 1v1 Engine ---------- */
  function startTournamentFromDraft() {
    if (currentDraft.items.length < 2) {
      alert("Turnuvayı başlatmak için en az 2 karakter/öğe eklemelisiniz.");
      return;
    }
    launchTournamentEngine(currentDraft);
  }

  function playSavedTournament(id) {
    const list = getCustomTournaments();
    const t = list.find(item => item.id === id);
    if (!t) return;
    launchTournamentEngine(t);
  }

  function launchTournamentEngine(tournamentData) {
    if (typeof window.startCustomTournament === "function") {
      window.startCustomTournament(tournamentData);
    } else {
      console.error("[FufuMaker] startCustomTournament fonksiyonu bulunamadı.");
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  return {
    init,
    render,
    switchTab,
    removeItem,
    updateItemName,
    updateItemDesc,
    deleteTournament,
    exportSingleJSON,
    playSavedTournament,
    getTournaments: getCustomTournaments
  };
})();

window.FufuMaker = FufuMaker;
