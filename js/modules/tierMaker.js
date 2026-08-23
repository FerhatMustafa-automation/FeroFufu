/* =====================================================
   FeroFUFU – js/modules/tierMaker.js
   TierMaker (FeroTier) Katman Listesi Motoru & Canvas Exporter
   ===================================================== */

"use strict";

const FeroTier = (function () {
  const STORAGE_KEY = "ferofufu_tier_state";

  const DEFAULT_TIERS = [
    { id: "tier-s", label: "S", color: "#ff7f7f", items: [] },
    { id: "tier-a", label: "A", color: "#ffbf7f", items: [] },
    { id: "tier-b", label: "B", color: "#ffff7f", items: [] },
    { id: "tier-c", label: "C", color: "#7fff7f", items: [] },
    { id: "tier-d", label: "D", color: "#7fbfff", items: [] }
  ];

  let state = {
    tiers: JSON.parse(JSON.stringify(DEFAULT_TIERS)),
    unrankedPool: [],
    selectedForTap: null, // item id
    draggedItem: null,
    draggedSourceTierId: null // null for unranked
  };

  /* ---------- Initialization ---------- */
  function init() {
    const container = document.getElementById("tier-maker-section");
    if (!container) return;

    loadFromStorage();
    if (state.unrankedPool.length === 0 && areAllTiersEmpty()) {
      loadDnDTemplate(false);
    }
    render();
  }

  function areAllTiersEmpty() {
    return state.tiers.every(t => t.items.length === 0);
  }

  /* ---------- Local Storage ---------- */
  function saveToStorage() {
    try {
      const data = JSON.stringify({ tiers: state.tiers, unrankedPool: state.unrankedPool });
      if (window.feroMedia && window.feroMedia.safeSave) {
        window.feroMedia.safeSave(STORAGE_KEY, data);
      } else {
        localStorage.setItem(STORAGE_KEY, data);
      }
    } catch (e) {
      console.warn("[FeroTier] Kaydetme hatası:", e);
    }
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.tiers && Array.isArray(parsed.tiers)) state.tiers = parsed.tiers;
        if (parsed.unrankedPool && Array.isArray(parsed.unrankedPool)) state.unrankedPool = parsed.unrankedPool;
      }
    } catch (e) {
      console.warn("[FeroTier] LocalStorage okuma hatası:", e);
    }
  }

  /* ---------- Render Functions ---------- */
  function render() {
    const container = document.getElementById("tier-maker-section");
    if (!container) return;

    container.innerHTML = `
      <div class="tier-section">
        <div class="tier-header">
          <div class="tier-badge">📊 Sıralama Tablosu</div>
          <h1 class="tier-title">FeroTier - Katman Listesi</h1>
          <p class="tier-subtitle">Karakterleri katmanlara sürükleyin, mobilde dokunup yerleştirin ve resim olarak indirin!</p>
        </div>

        <!-- Toolbar -->
        <div class="tier-toolbar">
          <div class="tier-toolbar-group">
            <button type="button" class="tier-tool-btn" id="tier-btn-load-dnd">
              <span>🎭</span> DnD Şablonu Yükle
            </button>
            <label class="tier-tool-btn" style="cursor:pointer; margin:0;">
              <span>🖼️</span> Görsel Yükle
              <input type="file" id="tier-upload-input" multiple accept="image/*" style="display:none;" />
            </label>
            <button type="button" class="tier-tool-btn" id="tier-btn-add-row">
              <span>➕</span> Katman Ekle
            </button>
            <button type="button" class="tier-tool-btn" style="background:rgba(6,182,212,0.18);border-color:rgba(6,182,212,0.4);color:#06b6d4;" id="tier-btn-save-community">
              <span>💾</span> Topluluğa Kaydet
            </button>
          </div>

          <div class="tier-toolbar-group">
            <button type="button" class="tier-tool-btn btn-danger" id="tier-btn-reset">
              <span>🔄</span> Sıfırla
            </button>
            <button type="button" class="tier-tool-btn btn-export" id="tier-btn-export">
              <span>📸</span> PNG Olarak İndir
            </button>
          </div>
        </div>

        <!-- Tier Board -->
        <div class="tier-board" id="tier-board">
          ${state.tiers.map((tier, idx) => renderTierRow(tier, idx)).join("")}
        </div>

        <!-- Unranked Bank -->
        <div class="tier-bank-container">
          <div class="tier-bank-header">
            <div class="tier-bank-title">
              <span>📦 Sıralanmamış Karakterler / Öğe Havuzu</span>
              <span class="tier-bank-count" id="tier-bank-count">${state.unrankedPool.length} Öğe</span>
            </div>
            <button type="button" class="tier-btn-sm" style="background:rgba(255,255,255,0.08);color:#C0B297;border:1px solid rgba(255,255,255,0.15);padding:4px 10px;border-radius:6px;font-size:0.75rem;cursor:pointer;" id="tier-btn-clear-all-to-bank">
              Tümünü Havuza Çek
            </button>
          </div>
          <div class="tier-bank-pool" id="tier-bank-pool" ondragover="event.preventDefault();" ondrop="FeroTier.handleDropToBank(event)">
            ${state.unrankedPool.length === 0 ? `<div class="tier-bank-empty-text">Tüm karakterler sıralandı! ✨</div>` : state.unrankedPool.map(item => renderTierItem(item, null)).join("")}
          </div>
        </div>

        <!-- Mobil Hızlı Yerleştirme Barı -->
        <div class="tier-quick-bar ${state.selectedForTap ? 'visible' : ''}" id="tier-quick-bar">
          <div class="tier-quick-header">
            <span id="tier-quick-item-name">${state.selectedForTap ? '"' + escapeHtml(findItemById(state.selectedForTap)?.name || '') + '" için katman seç:' : 'Karakteri seçilen kata yerleştir:'}</span>
            <button type="button" onclick="FeroTier.cancelTapSelect()" style="background:none;border:none;color:#fff;font-size:0.9rem;cursor:pointer;">✕</button>
          </div>
          <div class="tier-quick-options">
            ${state.tiers.map(t => `
              <button type="button" class="tier-quick-btn" style="background:${t.color};" onclick="FeroTier.placeSelectedToTier('${t.id}')">${escapeHtml(t.label)}</button>
            `).join("")}
            <button type="button" class="tier-quick-btn" style="background:#334155;color:#fff;" onclick="FeroTier.placeSelectedToTier(null)">Havuz</button>
          </div>
        </div>
      </div>
    `;

    attachEvents();
  }

  function renderTierRow(tier, idx) {
    return `
      <div class="tier-row" id="tier-row-${tier.id}" data-tier-id="${tier.id}">
        <div class="tier-label-box" style="background-color: ${tier.color};" onclick="FeroTier.promptEditTier('${tier.id}')" title="İsim ve Rengi Değiştirmek İçin Tıkla">
          <span class="tier-label-text">${escapeHtml(tier.label)}</span>
        </div>

        <div class="tier-items-dropzone" id="tier-dropzone-${tier.id}" data-tier-id="${tier.id}" ondragover="FeroTier.handleDragOver(event)" ondragleave="FeroTier.handleDragLeave(event)" ondrop="FeroTier.handleDropToTier(event, '${tier.id}')">
          ${tier.items.map(item => renderTierItem(item, tier.id)).join("")}
        </div>

        <div class="tier-row-controls">
          <button type="button" class="tier-ctrl-btn" onclick="FeroTier.moveTierUp(${idx})" title="Yukarı Taşı">▲</button>
          <button type="button" class="tier-ctrl-btn" onclick="FeroTier.moveTierDown(${idx})" title="Aşağı Taşı">▼</button>
          <button type="button" class="tier-ctrl-btn" onclick="FeroTier.clearTier('${tier.id}')" title="Katmanı Temizle">🧹</button>
          <button type="button" class="tier-ctrl-btn" onclick="FeroTier.deleteTier('${tier.id}')" title="Katmanı Sil">✕</button>
        </div>
      </div>
    `;
  }

  function renderTierItem(item, tierId) {
    const isSelected = state.selectedForTap === item.id;
    return `
      <div class="tier-item ${isSelected ? 'selected-for-tap' : ''}" 
           id="item-${item.id}" 
           data-item-id="${item.id}" 
           data-tier-id="${tierId || ''}"
           draggable="true" 
           ondragstart="FeroTier.handleDragStart(event, '${item.id}', ${tierId ? `'${tierId}'` : 'null'})"
           onclick="FeroTier.handleItemTap('${item.id}', ${tierId ? `'${tierId}'` : 'null'})">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" />
        <div class="tier-item-name-tag">${escapeHtml(item.name)}</div>
      </div>
    `;
  }

  /* ---------- Event Attachments ---------- */
  function attachEvents() {
    document.getElementById("tier-btn-load-dnd")?.addEventListener("click", () => loadDnDTemplate(true));
    document.getElementById("tier-btn-add-row")?.addEventListener("click", addNewTier);
    document.getElementById("tier-btn-reset")?.addEventListener("click", resetBoard);
    document.getElementById("tier-btn-export")?.addEventListener("click", exportTierListAsPNG);
    document.getElementById("tier-btn-clear-all-to-bank")?.addEventListener("click", clearAllToBank);
    document.getElementById("tier-btn-save-community")?.addEventListener("click", saveToCommunity);

    const uploadInp = document.getElementById("tier-upload-input");
    uploadInp?.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleUploadImages(Array.from(e.target.files));
      }
    });

    setupTouchDragListeners();
  }

  function saveToCommunity() {
    const totalRanked = state.tiers.reduce((acc, t) => acc + t.items.length, 0);
    if (totalRanked === 0) {
      alert("Topluluğa kaydetmeden önce katmanlara en az bir karakter yerleştirmelisiniz.");
      return;
    }

    const title = prompt("Katman Listesi Başlığı:", "Litvus Karakter Katman Sıralaması");
    if (!title || !title.trim()) return;

    const desc = prompt("Kısa Açıklama (İsteğe bağlı):", "Topluluk için özel sıralamam.");

    if (window.FeroCommunity && typeof window.FeroCommunity.saveNewTierList === "function") {
      const ok = window.FeroCommunity.saveNewTierList(title, desc, state.tiers);
      if (ok && confirm("Katman listeniz kaydedildi! Topluluk galerisine gitmek ister misiniz?")) {
        if (typeof loadCategory === "function") loadCategory("community");
      }
    }
  }

  function loadCustomTierList(tierListData) {
    if (!tierListData || !tierListData.tiers) return;
    state.tiers = JSON.parse(JSON.stringify(tierListData.tiers));
    state.unrankedPool = [];
    saveToStorage();
    render();
  }

  /* ---------- Drag & Drop Handlers ---------- */
  function handleDragStart(e, itemId, sourceTierId) {
    state.draggedItem = findItemById(itemId);
    state.draggedSourceTierId = sourceTierId;
    if (e.dataTransfer) {
      e.dataTransfer.setData("text/plain", itemId);
      e.dataTransfer.effectAllowed = "move";
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    const row = e.currentTarget.closest(".tier-row");
    if (row) row.classList.add("drag-over");
  }

  function handleDragLeave(e) {
    const row = e.currentTarget.closest(".tier-row");
    if (row) row.classList.remove("drag-over");
  }

  function handleDropToTier(e, targetTierId) {
    e.preventDefault();
    const row = e.currentTarget.closest(".tier-row");
    if (row) row.classList.remove("drag-over");

    const itemId = e.dataTransfer ? e.dataTransfer.getData("text/plain") : (state.draggedItem ? state.draggedItem.id : null);
    if (!itemId) return;

    moveItemTo(itemId, targetTierId);
  }

  function handleDropToBank(e) {
    e.preventDefault();
    const itemId = e.dataTransfer ? e.dataTransfer.getData("text/plain") : (state.draggedItem ? state.draggedItem.id : null);
    if (!itemId) return;
    moveItemTo(itemId, null);
  }

  /* ---------- Mobile Touch Drag Implementation ---------- */
  let touchActiveItem = null;
  let touchClone = null;

  function setupTouchDragListeners() {
    const board = document.getElementById("tier-board");
    const bank = document.getElementById("tier-bank-pool");
    if (!board && !bank) return;

    const items = document.querySelectorAll(".tier-item");
    items.forEach(el => {
      el.addEventListener("touchstart", onTouchStart, { passive: false });
      el.addEventListener("touchmove", onTouchMove, { passive: false });
      el.addEventListener("touchend", onTouchEnd, { passive: false });
    });
  }

  let touchMoved = false;
  let touchStartX = 0;
  let touchStartY = 0;

  function onTouchStart(e) {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchMoved = false;
    touchActiveItem = e.currentTarget;
  }

  function onTouchMove(e) {
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartX);
    const dy = Math.abs(touch.clientY - touchStartY);

    if (dx > 10 || dy > 10) {
      touchMoved = true;
      e.preventDefault();

      if (!touchClone && touchActiveItem) {
        touchClone = touchActiveItem.cloneNode(true);
        touchClone.style.position = "fixed";
        touchClone.style.zIndex = "9999";
        touchClone.style.pointerEvents = "none";
        touchClone.style.opacity = "0.85";
        touchClone.style.width = "65px";
        touchClone.style.height = "65px";
        document.body.appendChild(touchClone);
      }

      if (touchClone) {
        touchClone.style.left = (touch.clientX - 32) + "px";
        touchClone.style.top = (touch.clientY - 32) + "px";
      }
    }
  }

  function onTouchEnd(e) {
    if (touchClone) {
      touchClone.remove();
      touchClone = null;
    }

    if (touchMoved && touchActiveItem) {
      const touch = e.changedTouches[0];
      const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
      const tierDropzone = targetEl?.closest(".tier-items-dropzone");
      const bankPool = targetEl?.closest(".tier-bank-pool");

      const itemId = touchActiveItem.dataset.itemId;
      if (tierDropzone) {
        const targetTierId = tierDropzone.dataset.tierId;
        moveItemTo(itemId, targetTierId);
      } else if (bankPool) {
        moveItemTo(itemId, null);
      }
    }

    touchActiveItem = null;
    setTimeout(() => { touchMoved = false; }, 300);
  }

  /* ---------- Mobile Tap-to-Place Logic ---------- */
  function handleItemTap(itemId, currentTierId) {
    // If touch moved, don't treat as tap
    if (touchMoved) return;

    if (state.selectedForTap === itemId) {
      cancelTapSelect();
      return;
    }

    state.selectedForTap = itemId;
    render();
  }

  function placeSelectedToTier(targetTierId) {
    if (!state.selectedForTap) return;
    moveItemTo(state.selectedForTap, targetTierId);
    cancelTapSelect();
  }

  function cancelTapSelect() {
    state.selectedForTap = null;
    document.getElementById("tier-quick-bar")?.classList.remove("visible");
    render();
  }

  /* ---------- Core State Mutation ---------- */
  function findItemById(itemId) {
    for (let t of state.tiers) {
      const found = t.items.find(i => i.id === itemId);
      if (found) return found;
    }
    return state.unrankedPool.find(i => i.id === itemId) || null;
  }

  function moveItemTo(itemId, targetTierId) {
    const item = findItemById(itemId);
    if (!item) return;

    // Remove from everywhere
    state.tiers.forEach(t => {
      t.items = t.items.filter(i => i.id !== itemId);
    });
    state.unrankedPool = state.unrankedPool.filter(i => i.id !== itemId);

    // Add to target
    if (targetTierId) {
      const tier = state.tiers.find(t => t.id === targetTierId);
      if (tier) tier.items.push(item);
    } else {
      state.unrankedPool.push(item);
    }

    saveToStorage();
    render();
  }

  function clearTier(tierId) {
    const tier = state.tiers.find(t => t.id === tierId);
    if (!tier || tier.items.length === 0) return;
    state.unrankedPool.push(...tier.items);
    tier.items = [];
    saveToStorage();
    render();
  }

  function clearAllToBank() {
    state.tiers.forEach(t => {
      state.unrankedPool.push(...t.items);
      t.items = [];
    });
    saveToStorage();
    render();
  }

  function deleteTier(tierId) {
    const tier = state.tiers.find(t => t.id === tierId);
    if (!tier) return;
    state.unrankedPool.push(...tier.items);
    state.tiers = state.tiers.filter(t => t.id !== tierId);
    saveToStorage();
    render();
  }

  function moveTierUp(index) {
    if (index <= 0) return;
    const temp = state.tiers[index];
    state.tiers[index] = state.tiers[index - 1];
    state.tiers[index - 1] = temp;
    saveToStorage();
    render();
  }

  function moveTierDown(index) {
    if (index >= state.tiers.length - 1) return;
    const temp = state.tiers[index];
    state.tiers[index] = state.tiers[index + 1];
    state.tiers[index + 1] = temp;
    saveToStorage();
    render();
  }

  function addNewTier() {
    const newTier = {
      id: "tier-" + Date.now(),
      label: "NEW",
      color: "#c084fc",
      items: []
    };
    state.tiers.push(newTier);
    saveToStorage();
    render();
  }

  function promptEditTier(tierId) {
    const tier = state.tiers.find(t => t.id === tierId);
    if (!tier) return;

    const newLabel = prompt("Katman Başlığını Girin:", tier.label);
    if (newLabel === null) return;
    tier.label = newLabel.trim() || tier.label;

    const colors = ["#ff7f7f", "#ffbf7f", "#ffff7f", "#7fff7f", "#7fbfff", "#ff7fff", "#c084fc", "#94a3b8"];
    const colorChoice = prompt("Renk Kodu (Hex veya örn: #ff7f7f):", tier.color);
    if (colorChoice) tier.color = colorChoice.trim();

    saveToStorage();
    render();
  }

  /* ---------- Presets & Uploads ---------- */
  function loadDnDTemplate(confirmOverride) {
    if (confirmOverride && !confirm("DnD Karakter Şablonu yüklensin mi? (Mevcut sıralama sıfırlanacak)")) return;

    let chars = [];
    if (typeof getDndCharacters === "function") {
      chars = getDndCharacters();
    } else if (typeof dndCharacters !== "undefined") {
      chars = dndCharacters;
    }

    state.tiers = JSON.parse(JSON.stringify(DEFAULT_TIERS));
    state.unrankedPool = chars.map(c => ({
      id: "dnd-tier-" + c.id,
      name: c.name,
      image: c.image
    }));

    saveToStorage();
    render();
  }

  async function handleUploadImages(files) {
    const imageFiles = files.filter(f => f.type.startsWith("image/"));
    for (let file of imageFiles) {
      try {
        let dataUrl = "";
        if (window.feroMedia && window.feroMedia.compressImage) {
          dataUrl = await window.feroMedia.compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.8 });
        } else {
          dataUrl = await readFileAsBase64(file);
        }

        const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        state.unrankedPool.push({
          id: "custom-tier-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
          name: rawName.charAt(0).toUpperCase() + rawName.slice(1),
          image: dataUrl
        });
      } catch (err) {
        console.error("[FeroTier] Resim yükleme hatası:", err);
      }
    }
    saveToStorage();
    render();
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function resetBoard() {
    if (!confirm("Tüm tabloyu sıfırlamak istediğinize emin misiniz?")) return;
    state.tiers = JSON.parse(JSON.stringify(DEFAULT_TIERS));
    state.unrankedPool = [];
    loadDnDTemplate(false);
  }

  /* ---------- Canvas PNG Exporter ---------- */
  async function exportTierListAsPNG() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const width = 1000;
    const labelWidth = 120;
    const itemSize = 90;
    const padding = 8;
    const headerHeight = 60;
    const watermarkHeight = 40;

    // Calculate total height based on number of items in each tier
    const rowHeights = state.tiers.map(tier => {
      const itemsPerRow = Math.max(1, Math.floor((width - labelWidth - padding * 2) / (itemSize + padding)));
      const rows = Math.max(1, Math.ceil(tier.items.length / itemsPerRow));
      return Math.max(itemSize + padding * 2, rows * (itemSize + padding) + padding);
    });

    const totalHeight = headerHeight + rowHeights.reduce((a, b) => a + b, 0) + watermarkHeight;

    canvas.width = width;
    canvas.height = totalHeight;

    // Background
    ctx.fillStyle = "#0c0806";
    ctx.fillRect(0, 0, width, totalHeight);

    // Title Header
    ctx.fillStyle = "#160e0a";
    ctx.fillRect(0, 0, width, headerHeight);
    ctx.fillStyle = "#FF9F1C";
    ctx.font = "bold 24px 'Cinzel', serif, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("FeroFUFU - Litvus'un Soytarıları Katman Listesi", width / 2, headerHeight / 2);

    let currentY = headerHeight;

    for (let i = 0; i < state.tiers.length; i++) {
      const tier = state.tiers[i];
      const rowHeight = rowHeights[i];

      // Row background
      ctx.fillStyle = i % 2 === 0 ? "#140e0b" : "#1a120e";
      ctx.fillRect(labelWidth, currentY, width - labelWidth, rowHeight);

      // Label background
      ctx.fillStyle = tier.color || "#ff7f7f";
      ctx.fillRect(0, currentY, labelWidth, rowHeight);

      // Label text
      ctx.fillStyle = "#111111";
      ctx.font = "bold 28px 'Cinzel', serif, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tier.label, labelWidth / 2, currentY + rowHeight / 2);

      // Row divider
      ctx.strokeStyle = "rgba(255, 159, 28, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, currentY + rowHeight);
      ctx.lineTo(width, currentY + rowHeight);
      ctx.stroke();

      // Draw Items
      const itemsPerRow = Math.floor((width - labelWidth - padding * 2) / (itemSize + padding));
      for (let j = 0; j < tier.items.length; j++) {
        const item = tier.items[j];
        const col = j % itemsPerRow;
        const row = Math.floor(j / itemsPerRow);

        const x = labelWidth + padding + col * (itemSize + padding);
        const y = currentY + padding + row * (itemSize + padding);

        try {
          const img = await loadImageAsync(item.image);
          ctx.drawImage(img, x, y, itemSize, itemSize);

          // Name overlay on image
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
          ctx.fillRect(x, y + itemSize - 18, itemSize, 18);
          ctx.fillStyle = "#ffffff";
          ctx.font = "10px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(item.name.substring(0, 14), x + itemSize / 2, y + itemSize - 9);
        } catch (e) {
          ctx.fillStyle = "#333";
          ctx.fillRect(x, y, itemSize, itemSize);
        }
      }

      currentY += rowHeight;
    }

    // Watermark Footer
    ctx.fillStyle = "#0c0806";
    ctx.fillRect(0, currentY, width, watermarkHeight);
    ctx.fillStyle = "#C0B297";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Made with 💜 on FeroFUFU · ferofufu.app", width / 2, currentY + watermarkHeight / 2);

    // Download Trigger
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "ferofufu-tier-listesi.png";
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function loadImageAsync(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Resim yüklenemedi: " + src));
      img.src = src;
    });
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
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDropToTier,
    handleDropToBank,
    handleItemTap,
    placeSelectedToTier,
    cancelTapSelect,
    moveTierUp,
    moveTierDown,
    clearTier,
    deleteTier,
    promptEditTier,
    exportTierListAsPNG,
    loadCustomTierList
  };
})();

window.FeroTier = FeroTier;
