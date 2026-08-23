/* =====================================================
   FeroFUFU – js/modules/community.js
   Topluluk Galerisi (Community Hub) Modülü
   Turnuva & TierMaker Kalıcı Paylaşım, Yönetim ve İnceleme Sistemi
   ===================================================== */

"use strict";

const FeroCommunity = (function () {
  const TOURNAMENTS_KEY = "ferofufu_custom_tournaments";
  const TIERLISTS_KEY = "ferofufu_community_tierlists";

  let activeTab = "tournaments"; // "tournaments" | "tierlists"
  let searchQuery = "";
  let viewingTierListId = null; // Read-only viewing state

  /* ---------- Sample Pre-Loaded Community Tier Lists ---------- */
  const INITIAL_TIERLISTS = [
    {
      id: "community-tier-1",
      title: "Litvus Karakter Güç ve Karizma Sıralaması",
      description: "Litvus evreninin en güçlü ve en karizmatik karakterlerinin genel katman listesi.",
      createdAt: "2025-08-10",
      tiers: [
        {
          id: "tier-s",
          label: "S",
          color: "#ff7f7f",
          items: [
            { id: 4, name: "Paladin Doris", image: "images/Paladin Doris.png" },
            { id: 2, name: "Valor", image: "images/Valor.png" },
            { id: 5, name: "Kont Mrakula", image: "images/Kont Mrakula.png" }
          ]
        },
        {
          id: "tier-a",
          label: "A",
          color: "#ffbf7f",
          items: [
            { id: 6, name: "Kral", image: "images/Kral.png" },
            { id: 1, name: "Bob", image: "images/Bob.png" },
            { id: 3, name: "Doktor Tim", image: "images/Doktor Tim.png" }
          ]
        },
        {
          id: "tier-b",
          label: "B",
          color: "#ffff7f",
          items: [
            { id: 7, name: "Prens Arthur", image: "images/7.Prens Arthur.png" },
            { id: 8, name: "İksir Matilda", image: "images/8 iksir Matilda.png" }
          ]
        },
        {
          id: "tier-c",
          label: "C",
          color: "#7fff7f",
          items: []
        },
        {
          id: "tier-d",
          label: "D",
          color: "#7fbfff",
          items: []
        }
      ]
    }
  ];

  /* ---------- Admin Helper Check ---------- */
  function isAdmin() {
    return typeof checkAdminStatus === "function" && checkAdminStatus();
  }

  /* ---------- Data Getters / Setters (FeroDB Cloud + Local Cache) ---------- */
  function getTournaments() {
    if (window.FeroDB && typeof window.FeroDB.getItems === "function") {
      return window.FeroDB.getItems("tournament", []);
    }
    try {
      const raw = localStorage.getItem(TOURNAMENTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("[Community] Turnuvalar okunamadı:", e);
    }
    return [];
  }

  function getTierLists() {
    if (window.FeroDB && typeof window.FeroDB.getItems === "function") {
      const items = window.FeroDB.getItems("tierlist", []);
      if (items.length > 0) return items;
    }
    try {
      const raw = localStorage.getItem(TIERLISTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("[Community] Tier listeler okunamadı:", e);
    }
    // İlk açılışta hazır şablonu kaydet ve döndür
    saveTierLists(INITIAL_TIERLISTS);
    return INITIAL_TIERLISTS;
  }

  function saveTierLists(list) {
    if (window.FeroDB && typeof window.FeroDB.saveCollection === "function") {
      window.FeroDB.saveCollection("tierlist", list);
      return { success: true };
    }
    if (window.feroMedia && window.feroMedia.safeSave) {
      return window.feroMedia.safeSave(TIERLISTS_KEY, JSON.stringify(list));
    }
    try {
      localStorage.setItem(TIERLISTS_KEY, JSON.stringify(list));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  function saveTournaments(list) {
    if (window.FeroDB && typeof window.FeroDB.saveCollection === "function") {
      window.FeroDB.saveCollection("tournament", list);
      return { success: true };
    }
    if (window.feroMedia && window.feroMedia.safeSave) {
      return window.feroMedia.safeSave(TOURNAMENTS_KEY, JSON.stringify(list));
    }
    try {
      localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(list));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Canlı bulut güncellemelerini dinle
  window.addEventListener("ferofufu_cloud_update", function(e) {
    if (e.detail && (e.detail.collection === "tournament" || e.detail.collection === "tierlist")) {
      const container = document.getElementById("community-section");
      if (container && !container.classList.contains("hidden")) {
        render();
      }
    }
  });

  /* ---------- Initialization & Render ---------- */
  function init() {
    const container = document.getElementById("community-section");
    if (!container) return;
    render();
  }

  function render() {
    const container = document.getElementById("community-section");
    if (!container) return;

    // If in read-only viewer mode, render the viewer directly
    if (viewingTierListId) {
      const tierLists = getTierLists();
      const currentList = tierLists.find(tl => tl.id === viewingTierListId);
      if (currentList) {
        container.innerHTML = renderTierListViewer(currentList);
        return;
      } else {
        viewingTierListId = null;
      }
    }

    const tournaments = getTournaments();
    const tierLists = getTierLists();

    const filteredTournaments = tournaments.filter(t => 
      !searchQuery || 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredTierLists = tierLists.filter(tl => 
      !searchQuery || 
      tl.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (tl.description && tl.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    container.innerHTML = `
      <div class="community-section">
        <div class="community-header">
          <div class="community-badge">
            🌍 Topluluk Galerisi &amp; Hub
            ${isAdmin() ? `<span class="admin-badge-indicator">🛡️ Yönetici Modu</span>` : ""}
          </div>
          <h1 class="community-title">FeroFUFU Topluluk</h1>
          <p class="community-subtitle">Topluluğun oluşturduğu 1v1 turnuvaları oyna ve katman listesi sıralamalarını incele!</p>
        </div>

        <!-- Controls: Tabs & Search -->
        <div class="community-controls">
          <div class="community-tabs">
            <button class="community-tab-btn ${activeTab === 'tournaments' ? 'active' : ''}" id="comm-tab-tournaments">
              <span>🏆</span> Topluluk Turnuvaları (${tournaments.length})
            </button>
            <button class="community-tab-btn ${activeTab === 'tierlists' ? 'active' : ''}" id="comm-tab-tierlists">
              <span>📊</span> Topluluk Katman Listeleri (${tierLists.length})
            </button>
          </div>

          <div class="community-search-box">
            <span class="community-search-icon">🔍</span>
            <input 
              type="text" 
              class="community-search-input" 
              placeholder="Toplulukta ara..." 
              value="${escapeHtml(searchQuery)}" 
              id="comm-search-input"
            />
          </div>
        </div>

        <!-- Content Grid -->
        <div class="community-grid" id="community-grid">
          ${activeTab === 'tournaments' ? renderTournamentsGrid(filteredTournaments) : renderTierListsGrid(filteredTierLists)}
        </div>
      </div>
    `;

    attachEvents();
  }

  /* ---------- Tournaments Grid ---------- */
  function renderTournamentsGrid(list) {
    if (list.length === 0) {
      return `
        <div class="community-empty-box">
          <div class="community-empty-icon">📭</div>
          <h3>${searchQuery ? "Aramaya Uygun Turnuva Bulunamadı" : "Henüz Topluluk Turnuvası Yok"}</h3>
          <p>${searchQuery ? "Farklı bir arama terimi deneyin." : "FeroFUFU Maker ile kendi turnuvanı yarat, burada otomatik olarak listelensin!"}</p>
          <button class="community-btn-play" style="max-width:240px; margin:16px auto 0;" onclick="loadCategory('fufumaker')">
            ✨ Turnuva Oluştur
          </button>
        </div>
      `;
    }

    return list.map(t => {
      const cover = t.coverImage || (t.items && t.items[0] && t.items[0].image) || "";
      const count = t.items ? t.items.length : 0;
      return `
        <div class="community-card">
          <div class="community-card-cover">
            ${cover ? `<img src="${escapeHtml(cover)}" alt="${escapeHtml(t.title)}" loading="lazy" />` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem;">🏆</div>`}
            <span class="community-card-tag">🏆 1v1 Turnuva</span>
          </div>
          <div class="community-card-body">
            <h3 class="community-card-title">${escapeHtml(t.title)}</h3>
            <p class="community-card-desc">${escapeHtml(t.description || t.question || 'Oylama turnuvası.')}</p>
            <div class="community-card-meta">
              <span>🎭 ${count} Karakter</span>
              <span>📅 ${t.createdAt || 'Topluluk'}</span>
            </div>
            <div class="community-card-actions">
              <button class="community-btn-play" onclick="FeroCommunity.playTournament('${t.id}')">
                <span>🎮</span> Oyna
              </button>
              ${isAdmin() ? `
                <button class="community-btn-icon-only" onclick="FeroCommunity.adminEditTournament('${t.id}')" title="Yönetici Düzenle">
                  <span>✏️</span>
                </button>
              ` : ""}
              <button class="community-btn-icon-only" onclick="FeroCommunity.exportTournament('${t.id}')" title="JSON İndir">
                <span>📤</span>
              </button>
              <button class="community-btn-icon-only btn-del" onclick="FeroCommunity.deleteTournament('${t.id}')" title="Sil">
                <span>🗑️</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  /* ---------- Tier Lists Grid ---------- */
  function renderTierListsGrid(list) {
    if (list.length === 0) {
      return `
        <div class="community-empty-box">
          <div class="community-empty-icon">📊</div>
          <h3>${searchQuery ? "Aramaya Uygun Katman Listesi Bulunamadı" : "Henüz Kayıtlı Katman Listesi Yok"}</h3>
          <p>${searchQuery ? "Farklı bir arama terimi deneyin." : "TierMaker ile kendi sıralamanı yap ve 'Topluluğa Kaydet' butonuna bas!"}</p>
          <button class="community-btn-tier" style="max-width:240px; margin:16px auto 0;" onclick="loadCategory('tiermaker')">
            📊 Tier Listesi Oluştur
          </button>
        </div>
      `;
    }

    return list.map(tl => {
      const totalItems = tl.tiers ? tl.tiers.reduce((acc, t) => acc + (t.items ? t.items.length : 0), 0) : 0;
      return `
        <div class="community-card" style="cursor: pointer;" onclick="FeroCommunity.viewTierList('${tl.id}')">
          <div class="community-tier-mini-board">
            ${(tl.tiers || []).slice(0, 4).map(tier => `
              <div class="community-tier-strip">
                <span class="community-tier-strip-label" style="background-color: ${tier.color};">${escapeHtml(tier.label)}</span>
                <div class="community-tier-strip-items">
                  ${(tier.items || []).slice(0, 6).map(item => `
                    <img src="${escapeHtml(item.image)}" class="community-tier-mini-item" alt="${escapeHtml(item.name)}" />
                  `).join("")}
                </div>
              </div>
            `).join("")}
          </div>
          <div class="community-card-body" onclick="event.stopPropagation();">
            <h3 class="community-card-title">${escapeHtml(tl.title)}</h3>
            <p class="community-card-desc">${escapeHtml(tl.description || 'Karakter katman listesi sıralaması.')}</p>
            <div class="community-card-meta">
              <span>📊 ${totalItems} Sıralanmış Öğe</span>
              <span>📅 ${tl.createdAt || 'Topluluk'}</span>
            </div>
            <div class="community-card-actions">
              <button class="community-btn-tier" onclick="FeroCommunity.viewTierList('${tl.id}')">
                <span>👀</span> Sıralamayı İncele
              </button>
              ${isAdmin() ? `
                <button class="community-btn-icon-only" onclick="FeroCommunity.adminEditTierList('${tl.id}')" title="Yönetici Düzenle">
                  <span>✏️</span>
                </button>
              ` : ""}
              <button class="community-btn-icon-only btn-del" onclick="FeroCommunity.deleteTierList('${tl.id}')" title="Sil">
                <span>🗑️</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  /* ---------- READ-ONLY TIER LIST VIEWER ---------- */
  function renderTierListViewer(tl) {
    return `
      <div class="community-section">
        <div class="community-viewer-box">
          <div class="community-viewer-topbar">
            <div class="community-viewer-title-group">
              <span class="community-viewer-locked-badge">🔒 Sadece Görüntüleme Modu (Sıralama Kilitlidir)</span>
              <h2>${escapeHtml(tl.title)}</h2>
              <p>${escapeHtml(tl.description || 'Topluluk katman listesi incelemesi.')} · <span style="color:var(--accent-purple);">${tl.createdAt || ''}</span></p>
            </div>

            <div class="community-viewer-actions">
              <button class="community-viewer-btn community-viewer-btn-back" onclick="FeroCommunity.closeTierListViewer()">
                <span>←</span> Topluluğa Dön
              </button>
              <button class="community-viewer-btn community-viewer-btn-png" onclick="FeroCommunity.exportViewerPNG('${tl.id}')">
                <span>📸</span> PNG İndir
              </button>
              <button class="community-viewer-btn community-viewer-btn-clone" onclick="FeroCommunity.cloneTierListToMaker('${tl.id}')">
                <span>📋</span> Kendi Sıralamanı Yap (Klonla)
              </button>
            </div>
          </div>

          <!-- Read-Only Board (Immutable, No Drag, No Tap) -->
          <div class="community-ro-board" id="community-ro-board">
            ${(tl.tiers || []).map(tier => `
              <div class="community-ro-row">
                <div class="community-ro-label" style="background-color: ${tier.color};">
                  ${escapeHtml(tier.label)}
                </div>
                <div class="community-ro-items">
                  ${tier.items && tier.items.length > 0 ? tier.items.map(item => `
                    <div class="community-ro-item" title="${escapeHtml(item.name)}">
                      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" draggable="false" />
                      <div class="community-ro-item-name">${escapeHtml(item.name)}</div>
                    </div>
                  `).join("") : `<div class="community-ro-empty-tier">Bu katmanda öğe yok</div>`}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }

  /* ---------- Event Bindings ---------- */
  function attachEvents() {
    document.getElementById("comm-tab-tournaments")?.addEventListener("click", () => {
      activeTab = "tournaments";
      viewingTierListId = null;
      render();
    });

    document.getElementById("comm-tab-tierlists")?.addEventListener("click", () => {
      activeTab = "tierlists";
      viewingTierListId = null;
      render();
    });

    const searchInput = document.getElementById("comm-search-input");
    searchInput?.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      const grid = document.getElementById("community-grid");
      if (!grid) return;
      if (activeTab === "tournaments") {
        const filtered = getTournaments().filter(t => 
          !searchQuery || 
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        grid.innerHTML = renderTournamentsGrid(filtered);
      } else {
        const filtered = getTierLists().filter(tl => 
          !searchQuery || 
          tl.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (tl.description && tl.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        grid.innerHTML = renderTierListsGrid(filtered);
      }
    });
  }

  /* ---------- Actions ---------- */
  function viewTierList(id) {
    viewingTierListId = id;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeTierListViewer() {
    viewingTierListId = null;
    render();
  }

  function cloneTierListToMaker(id) {
    const list = getTierLists();
    const tl = list.find(item => item.id === id);
    if (!tl) return;

    if (confirm(`"${tl.title}" şablonunu kopyalayıp kendi sıralamanızı yapmak istiyor musunuz?`)) {
      if (window.FeroTier && typeof window.FeroTier.loadCustomTierList === "function") {
        window.FeroTier.loadCustomTierList(tl);
        if (typeof loadCategory === "function") {
          loadCategory("tiermaker");
        }
      }
    }
  }

  async function exportViewerPNG(id) {
    const list = getTierLists();
    const tl = list.find(item => item.id === id);
    if (!tl) return;

    // Temporary load in exporter
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const width = 1000;
    const labelWidth = 120;
    const itemSize = 90;
    const padding = 8;
    const headerHeight = 60;
    const watermarkHeight = 40;

    const rowHeights = tl.tiers.map(tier => {
      const itemsPerRow = Math.max(1, Math.floor((width - labelWidth - padding * 2) / (itemSize + padding)));
      const rows = Math.max(1, Math.ceil((tier.items || []).length / itemsPerRow));
      return Math.max(itemSize + padding * 2, rows * (itemSize + padding) + padding);
    });

    const totalHeight = headerHeight + rowHeights.reduce((a, b) => a + b, 0) + watermarkHeight;

    canvas.width = width;
    canvas.height = totalHeight;

    ctx.fillStyle = "#0c0806";
    ctx.fillRect(0, 0, width, totalHeight);

    ctx.fillStyle = "#160e0a";
    ctx.fillRect(0, 0, width, headerHeight);
    ctx.fillStyle = "#FF9F1C";
    ctx.font = "bold 24px 'Cinzel', serif, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tl.title, width / 2, headerHeight / 2);

    let currentY = headerHeight;

    for (let i = 0; i < tl.tiers.length; i++) {
      const tier = tl.tiers[i];
      const rowHeight = rowHeights[i];

      ctx.fillStyle = i % 2 === 0 ? "#140e0b" : "#1a120e";
      ctx.fillRect(labelWidth, currentY, width - labelWidth, rowHeight);

      ctx.fillStyle = tier.color || "#ff7f7f";
      ctx.fillRect(0, currentY, labelWidth, rowHeight);

      ctx.fillStyle = "#111111";
      ctx.font = "bold 28px 'Cinzel', serif, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tier.label, labelWidth / 2, currentY + rowHeight / 2);

      ctx.strokeStyle = "rgba(255, 159, 28, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, currentY + rowHeight);
      ctx.lineTo(width, currentY + rowHeight);
      ctx.stroke();

      const itemsPerRow = Math.floor((width - labelWidth - padding * 2) / (itemSize + padding));
      for (let j = 0; j < (tier.items || []).length; j++) {
        const item = tier.items[j];
        const col = j % itemsPerRow;
        const row = Math.floor(j / itemsPerRow);

        const x = labelWidth + padding + col * (itemSize + padding);
        const y = currentY + padding + row * (itemSize + padding);

        try {
          const img = await loadImageAsync(item.image);
          ctx.drawImage(img, x, y, itemSize, itemSize);

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

    ctx.fillStyle = "#0c0806";
    ctx.fillRect(0, currentY, width, watermarkHeight);
    ctx.fillStyle = "#C0B297";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Made with 💜 on FeroFUFU Topluluk · ferofufu.app", width / 2, currentY + watermarkHeight / 2);

    let dataUrl;
    try {
      dataUrl = canvas.toDataURL("image/png");
    } catch (e) {
      alert("Görseller güvenlik (CORS) nedeniyle dışa aktarılamadı.");
      return;
    }
    const link = document.createElement("a");
    link.download = (tl.title || "ferofufu-tier-listesi") + ".png";
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

  function playTournament(id) {
    const list = getTournaments();
    const t = list.find(item => item.id === id);
    if (!t) return;
    if (typeof window.startCustomTournament === "function") {
      window.startCustomTournament(t);
    }
  }

  function exportTournament(id) {
    if (window.FufuMaker && typeof window.FufuMaker.exportSingleJSON === "function") {
      window.FufuMaker.exportSingleJSON(id);
    }
  }

  function deleteTournament(id) {
    if (!confirm("Bu turnuvayı silmek istediğinize emin misiniz?")) return;
    let list = getTournaments();
    list = list.filter(t => t.id !== id);
    saveTournaments(list);
    render();
  }

  function deleteTierList(id) {
    if (!confirm("Bu katman listesini silmek istediğinize emin misiniz?")) return;
    let list = getTierLists();
    list = list.filter(tl => tl.id !== id);
    saveTierLists(list);
    if (viewingTierListId === id) viewingTierListId = null;
    render();
  }

  /* ---------- Admin Editing ---------- */
  function adminEditTournament(id) {
    const list = getTournaments();
    const t = list.find(item => item.id === id);
    if (!t) return;

    const newTitle = prompt("Yönetici: Turnuva Başlığını Güncelleyin:", t.title);
    if (newTitle === null) return;
    t.title = newTitle.trim() || t.title;

    const newQ = prompt("Yönetici: VS Oylama Sorusunu Güncelleyin:", t.question || "Hangisi daha iyi?");
    if (newQ !== null) t.question = newQ.trim() || t.question;

    const newDesc = prompt("Yönetici: Açıklamayı Güncelleyin:", t.description || "");
    if (newDesc !== null) t.description = newDesc.trim();

    saveTournaments(list);
    render();
    alert("✅ Turnuva başarıyla güncellendi!");
  }

  function adminEditTierList(id) {
    const list = getTierLists();
    const tl = list.find(item => item.id === id);
    if (!tl) return;

    const newTitle = prompt("Yönetici: Katman Listesi Başlığını Güncelleyin:", tl.title);
    if (newTitle === null) return;
    tl.title = newTitle.trim() || tl.title;

    const newDesc = prompt("Yönetici: Açıklamayı Güncelleyin:", tl.description || "");
    if (newDesc !== null) tl.description = newDesc.trim();

    saveTierLists(list);
    render();
    alert("✅ Katman listesi başarıyla güncellendi!");
  }

  function saveNewTierList(title, description, tiers) {
    if (!title || !title.trim()) {
      alert("Lütfen bir katman listesi başlığı girin.");
      return false;
    }

    const list = getTierLists();
    const newEntry = {
      id: "tierlist-" + Date.now(),
      title: title.trim(),
      description: description ? description.trim() : "",
      tiers: JSON.parse(JSON.stringify(tiers)),
      createdAt: new Date().toLocaleDateString("tr-TR")
    };

    list.unshift(newEntry);
    const res = saveTierLists(list);
    if (res.success) {
      alert(`✅ "${newEntry.title}" Topluluk Galerisine başarıyla kaydedildi!`);
      return true;
    } else {
      alert(`❌ Kaydedilirken hata oluştu: ${res.error}`);
      return false;
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
    playTournament,
    exportTournament,
    deleteTournament,
    viewTierList,
    closeTierListViewer,
    cloneTierListToMaker,
    exportViewerPNG,
    deleteTierList,
    adminEditTournament,
    adminEditTierList,
    saveNewTierList
  };
})();

window.FeroCommunity = FeroCommunity;
