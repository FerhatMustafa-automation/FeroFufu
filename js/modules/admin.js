/* =====================================================
   FeroFUFU – js/modules/admin.js
   Canlı / Yerinde Yönetim Modu (Inline Admin)
   ===================================================== */

"use strict";

// 1. Session Storage Management (Delegated to cryptographic FeroAuth)
function checkAdminStatus() {
  return typeof window.FeroAuth !== "undefined" ? window.FeroAuth.isAdmin() : sessionStorage.getItem("isAdmin") === "true";
}

function setAdminStatus(status) {
  if (typeof window.FeroAuth !== "undefined") {
    if (status) {
      window.FeroAuth.loginAdmin();
    } else {
      window.FeroAuth.logoutAdmin();
    }
  } else {
    if (status) {
      sessionStorage.setItem("isAdmin", "true");
    } else {
      sessionStorage.removeItem("isAdmin");
    }
  }
}

function updateAdminUI() {
  const adminBtn = document.getElementById("admin-login-btn");
  if (!adminBtn) return;

  if (checkAdminStatus()) {
    adminBtn.innerHTML = `<span class="admin-btn-icon">🟢</span><span class="admin-btn-text">Yönetici Modu Açık (Çıkış Yap)</span>`;
    adminBtn.classList.add("admin-active");
  } else {
    adminBtn.innerHTML = `<span class="admin-btn-icon">⚙️</span><span class="admin-btn-text">Yönetici</span>`;
    adminBtn.classList.remove("admin-active");
  }
}

// 2. Modals (Password)
function openAdminPasswordModal() {
  if (checkAdminStatus()) {
    // Already admin, so logout
    setAdminStatus(false);
    window.location.reload();
    return;
  }

  const modal = document.getElementById("admin-password-modal");
  if (!modal) return;
  modal.classList.add("modal-visible");
  document.body.classList.add("modal-open");
  
  setTimeout(() => {
    const input = document.getElementById("admin-password-input");
    if (input) { input.value = ""; input.focus(); }
  }, 150);
  clearAdminPasswordError();
}

function closeAdminPasswordModal() {
  const modal = document.getElementById("admin-password-modal");
  if (!modal) return;
  modal.classList.remove("modal-visible");
  document.body.classList.remove("modal-open");
  clearAdminPasswordError();
}

async function verifyAdminPassword() {
  const input = document.getElementById("admin-password-input");
  const errorEl = document.getElementById("admin-password-error");
  if (!input) return;

  const value = input.value;

  if (typeof window.FeroAuth !== "undefined") {
    const result = await window.FeroAuth.verifyAdmin(value);
    if (result.success) {
      clearAdminPasswordError();
      input.classList.add("input-success");
      setTimeout(() => {
        input.classList.remove("input-success");
        closeAdminPasswordModal();
        window.location.reload(); // Reload to apply admin buttons
      }, 400);
    } else {
      if (errorEl) {
        errorEl.textContent = result.error || "❌ Yanlış şifre! Lütfen tekrar deneyin.";
        errorEl.classList.add("error-visible");
      }
      input.classList.add("input-shake");
      input.addEventListener("animationend", () => {
        input.classList.remove("input-shake");
      }, { once: true });
      input.value = "";
      input.focus();
    }
  }
}

function clearAdminPasswordError() {
  const errorEl = document.getElementById("admin-password-error");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.classList.remove("error-visible");
  }
  const input = document.getElementById("admin-password-input");
  if (input) input.classList.remove("input-shake", "input-success");
}

// 3. Inline Delete & Edit common logic
function _getItemsByCategory(category) {
  if (window.FeroDB && typeof window.FeroDB.getItems === "function") {
    return window.FeroDB.getItems(category, []);
  }
  switch (category) {
    case "dnd": return typeof getDndCharacters === 'function' ? getDndCharacters() : [];
    case "podcast": return typeof getPodcasts === 'function' ? getPodcasts() : [];
    case "audio": return typeof getAudioVaultTracks === 'function' ? getAudioVaultTracks() : []; 
    case "season1": return typeof getSeason1Episodes === 'function' ? getSeason1Episodes() : [];
    case "season2": return typeof getSeason2Episodes === 'function' ? getSeason2Episodes() : [];
    case "tournament": {
      try {
        const raw = localStorage.getItem("ferofufu_custom_tournaments");
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }
    case "tierlist": {
      try {
        const raw = localStorage.getItem("ferofufu_community_tierlists");
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }
  }
  return [];
}

function _saveItemsByCategory(category, items) {
  if (window.FeroDB && typeof window.FeroDB.saveCollection === "function") {
    window.FeroDB.saveCollection(category, items);
    return;
  }
  switch (category) {
    case "dnd": if(typeof saveDndCharacters === 'function') saveDndCharacters(items); break;
    case "podcast": if(typeof savePodcasts === 'function') savePodcasts(items); break;
    case "audio": if(typeof saveAudioVaultTracks === 'function') saveAudioVaultTracks(items); break;
    case "season1": if(typeof saveSeason1Episodes === 'function') saveSeason1Episodes(items); break;
    case "season2": if(typeof saveSeason2Episodes === 'function') saveSeason2Episodes(items); break;
    case "tournament": {
      if (window.feroMedia && window.feroMedia.safeSave) {
        window.feroMedia.safeSave("ferofufu_custom_tournaments", JSON.stringify(items));
      } else {
        localStorage.setItem("ferofufu_custom_tournaments", JSON.stringify(items));
      }
      break;
    }
    case "tierlist": {
      if (window.feroMedia && window.feroMedia.safeSave) {
        window.feroMedia.safeSave("ferofufu_community_tierlists", JSON.stringify(items));
      } else {
        localStorage.setItem("ferofufu_community_tierlists", JSON.stringify(items));
      }
      break;
    }
  }
}

window.inlineDelete = async function(id, category, event) {
  if (event) event.stopPropagation(); // prevent triggering parent clicks
  if (!confirm("Bu içeriği silmek istediğinize emin misiniz?")) return;

  if (window.FeroDB && typeof window.FeroDB.deleteItem === "function") {
    await window.FeroDB.deleteItem(category, id);
  } else {
    const items = _getItemsByCategory(category);
    const updated = items.filter(item => String(item.id) !== String(id));
    _saveItemsByCategory(category, updated);
  }
  
  // Refresh UI
  if(category === "dnd" && typeof startTournament === 'function' && typeof categories !== 'undefined' && categories?.dnd?.active) {
     // Optional reload
  } else if (category === "podcast" && typeof loadPodcastsSection === 'function') {
      loadPodcastsSection();
  } else if (category === "audio" && typeof loadAudioVaultSection === 'function') {
      loadAudioVaultSection();
  } else if (category === "season1" && typeof loadSeason1Section === 'function') {
      loadSeason1Section();
  } else if (category === "season2" && typeof loadSeason2Section === 'function') {
      loadSeason2Section();
  } else if (category === "tournament" || category === "tierlist") {
      if (window.FeroCommunity && typeof window.FeroCommunity.render === 'function') {
        window.FeroCommunity.render();
      }
  }
}

window.inlineEdit = function(id, category, event) {
  if (event) event.stopPropagation();
  // Opens upload form with prefilled data
  const items = _getItemsByCategory(category);
  const item = items.find(i => String(i.id) === String(id));
  if (!item) return;

  if (typeof openUploadForm === 'function') {
    // Override verify password since admin is already logged in
    openUploadForm(); 
    
    // Slight delay to allow form to reset first
    setTimeout(() => {
      document.getElementById("upload-edit-id").value = id;
      document.getElementById("upload-category").value = category;
      document.getElementById("upload-title").value = item.title || item.name || "";
      document.getElementById("upload-desc").value = item.description || "";
      
      const categorySelect = document.getElementById("upload-category");
      if (categorySelect) {
        categorySelect.dispatchEvent(new Event('change'));
      }

      if (category === "dnd") {
        // Not specifically targeted in requirements but kept for safety
      } else if (category === "podcast" || category === "audio") {
        document.getElementById("upload-audio-url").value = item.url || "";
      } else if (category === "season1" || category === "season2") {
        document.getElementById("upload-video-url").value = item.embedUrl || "";
      }

      const imgDataUrl = item.thumbnail || item.image || "";
      const preview = document.getElementById("upload-preview");
      const previewImg = document.getElementById("upload-preview-img");
      if (imgDataUrl && preview && previewImg) {
        previewImg.src = imgDataUrl;
        preview.classList.add("preview-visible");
      } else if (preview) {
        preview.classList.remove("preview-visible");
      }

      const titleEl = document.getElementById("upload-modal-title");
      if (titleEl) titleEl.textContent = "İçerik Düzenle";
      const subtitleEl = document.getElementById("upload-modal-subtitle");
      if (subtitleEl) subtitleEl.textContent = "Mevcut içeriği güncelleyin";
    }, 250);
  }
}

window.inlineAddNew = function(category) {
  if (typeof openUploadForm === 'function') {
    openUploadForm();
    setTimeout(() => {
       document.getElementById("upload-category").value = category;
       const categorySelect = document.getElementById("upload-category");
       if (categorySelect) {
         categorySelect.dispatchEvent(new Event('change'));
       }
       const titleEl = document.getElementById("upload-modal-title");
       if (titleEl) titleEl.textContent = "İçerik Ekle";
       const subtitleEl = document.getElementById("upload-modal-subtitle");
       if (subtitleEl) subtitleEl.textContent = "Yeni bir içerik veya bölüm ekleyin";
    }, 250);
  }
}


function initAdminModule() {
  updateAdminUI();

  const adminBtn = document.getElementById("admin-login-btn");
  if (adminBtn) adminBtn.addEventListener("click", openAdminPasswordModal);
  
  document.getElementById("admin-password-close")?.addEventListener("click", closeAdminPasswordModal);
  document.getElementById("admin-password-submit")?.addEventListener("click", verifyAdminPassword);
  document.getElementById("admin-password-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") verifyAdminPassword();
  });
  
  document.getElementById("admin-pw-toggle")?.addEventListener("click", function () {
    const inp = document.getElementById("admin-password-input");
    if (!inp) return;
    inp.type = inp.type === "password" ? "text" : "password";
    this.textContent = inp.type === "password" ? "👁" : "🙈";
  });
}

document.addEventListener("DOMContentLoaded", initAdminModule);
