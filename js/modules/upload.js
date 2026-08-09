/* =====================================================
   FeroFUFU – js/modules/upload.js
   Şifre Doğrulama + İçerik Yükleme Formu
   Komut 1 & 2 – Şifre: "matilda"
   ===================================================== */

"use strict";

const UPLOAD_PASSWORD = "matilda";

/* -------------------------------------------------------
   MODAL HELPERS
   ------------------------------------------------------- */

function openPasswordModal() {
  const modal = document.getElementById("password-modal");
  if (!modal) return;
  modal.classList.add("modal-visible");
  document.body.classList.add("modal-open");
  // Focus the input after transition
  setTimeout(() => {
    const input = document.getElementById("password-input");
    if (input) { input.value = ""; input.focus(); }
  }, 150);
  clearPasswordError();
}

function closePasswordModal() {
  const modal = document.getElementById("password-modal");
  if (!modal) return;
  modal.classList.remove("modal-visible");
  document.body.classList.remove("modal-open");
  clearPasswordError();
}

function openUploadForm() {
  closePasswordModal();
  const modal = document.getElementById("upload-modal");
  if (!modal) return;
  // Small delay so the close animation of password modal finishes
  setTimeout(() => {
    modal.classList.add("modal-visible");
    document.body.classList.add("modal-open");
    resetUploadForm();
  }, 200);
}

function closeUploadForm() {
  const modal = document.getElementById("upload-modal");
  if (!modal) return;
  modal.classList.remove("modal-visible");
  document.body.classList.remove("modal-open");
}

/* -------------------------------------------------------
   PASSWORD VERIFICATION
   ------------------------------------------------------- */

function verifyPassword() {
  const input     = document.getElementById("password-input");
  const errorEl   = document.getElementById("password-error");
  if (!input) return;

  const value = input.value.trim().toLowerCase();

  if (value === UPLOAD_PASSWORD) {
    // SUCCESS
    clearPasswordError();
    // Tiny success flash
    input.classList.add("input-success");
    setTimeout(() => {
      input.classList.remove("input-success");
      openUploadForm();
    }, 400);
  } else {
    // FAIL
    if (errorEl) {
      errorEl.textContent = "❌ Yanlış şifre! Tekrar dene.";
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

function clearPasswordError() {
  const errorEl = document.getElementById("password-error");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.classList.remove("error-visible");
  }
  const input = document.getElementById("password-input");
  if (input) input.classList.remove("input-shake", "input-success");
}

/* -------------------------------------------------------
   UPLOAD FORM
   ------------------------------------------------------- */

function resetUploadForm() {
  const form = document.getElementById("upload-form");
  if (form) form.reset();

  const editIdInput = document.getElementById("upload-edit-id");
  if (editIdInput) editIdInput.value = "";

  const titleEl = document.getElementById("upload-modal-title");
  if (titleEl) titleEl.textContent = "İçerik Ekle";
  const subtitleEl = document.getElementById("upload-modal-subtitle");
  if (subtitleEl) subtitleEl.textContent = "Yeni bir içerik veya bölüm ekleyin";

  const preview    = document.getElementById("upload-preview");
  const previewImg = document.getElementById("upload-preview-img");
  if (preview) preview.classList.remove("preview-visible");
  if (previewImg) previewImg.src = "";

  const statusEl = document.getElementById("upload-status");
  if (statusEl) { statusEl.textContent = ""; statusEl.className = "upload-status"; }

  // Ses alanlarını gizle
  hideAudioFields();

  // Video alanlarını gizle
  hideVideoFields();

  const audioFileName = document.getElementById("audio-file-name");
  if (audioFileName) audioFileName.textContent = "";

  const videoPreview = document.getElementById("video-link-preview");
  if (videoPreview) videoPreview.classList.remove("preview-show");
}

function handleFileSelect(event) {
  const file       = event.target.files[0];
  const preview    = document.getElementById("upload-preview");
  const previewImg = document.getElementById("upload-preview-img");
  if (!file || !preview || !previewImg) return;

  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      preview.classList.add("preview-visible");
    };
    reader.readAsDataURL(file);
  } else {
    preview.classList.remove("preview-visible");
  }
}

/* -------------------------------------------------------
   SES ALANLARI TOGGLE
   ------------------------------------------------------- */

function showAudioFields() {
  document.querySelectorAll(".audio-fields").forEach(el => {
    el.style.display = "";
    el.style.removeProperty("display");
  });
  // Gorsel alanini gizle (ses icin gorsel gerekmez)
  const imageGroup = document.getElementById("upload-file")?.closest(".form-group");
  if (imageGroup) imageGroup.style.display = "none";
}

function hideAudioFields() {
  document.querySelectorAll(".audio-fields").forEach(el => {
    el.style.display = "none";
  });
  // Gorsel alanini tekrar goster
  const imageGroup = document.getElementById("upload-file")?.closest(".form-group");
  if (imageGroup) imageGroup.style.removeProperty("display");
}

function isAudioCategory(category) {
  return category === "podcast" || category === "audio";
}

/* -------------------------------------------------------
   AKILLİ YOUTUBE / DRIVE LİNK DÖNÜŞTURÜCÜ
   ------------------------------------------------------- */

/**
 * convertToYouTubeEmbed(rawUrl)
 * Desteklenen format dönüşümleri:
 *   youtube.com/watch?v=ID       → youtube.com/embed/ID
 *   youtu.be/ID                  → youtube.com/embed/ID
 *   youtube.com/embed/ID         → değişmez
 *   drive.google.com/.../view    → .../preview
 *   diğer URL                    → olduğu gibi
 */
function convertToYouTubeEmbed(rawUrl) {
  if (!rawUrl || !rawUrl.trim()) return "";
  let url = rawUrl.trim();

  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");

    // --- YouTube: watch?v=ID ---
    if ((host === "youtube.com" || host === "m.youtube.com") && u.pathname === "/watch") {
      const vid = u.searchParams.get("v");
      if (vid) return `https://www.youtube.com/embed/${vid}`;
    }

    // --- YouTube: youtu.be/ID ---
    if (host === "youtu.be") {
      const vid = u.pathname.slice(1).split("?")[0];
      if (vid) return `https://www.youtube.com/embed/${vid}`;
    }

    // --- YouTube: zaten embed ---
    if (host === "youtube.com" && u.pathname.startsWith("/embed/")) {
      return url;
    }

    // --- YouTube: shorts ---
    if (host === "youtube.com" && u.pathname.startsWith("/shorts/")) {
      const vid = u.pathname.replace("/shorts/", "").split("/")[0];
      if (vid) return `https://www.youtube.com/embed/${vid}`;
    }

    // --- Google Drive: /file/d/ID/view → /file/d/ID/preview ---
    if (host === "drive.google.com" && u.pathname.includes("/view")) {
      return url.replace(/\/view(\?.*)?$/, "/preview");
    }
    if (host === "drive.google.com" && u.pathname.includes("/preview")) {
      return url; // zaten preview
    }

  } catch (e) {
    // URL parse başarısız – olduğu gibi döndür
    console.warn("[Upload] URL parse hatası:", e);
  }

  // Bilinmeyen format – olduğu gibi döndür
  return url;
}

/* -------------------------------------------------------
   VİDEO ALANLARI TOGGLE
   ------------------------------------------------------- */

function showVideoFields() {
  document.querySelectorAll(".video-fields").forEach(el => {
    el.style.removeProperty("display");
  });
  // Görsel alanını gizle
  const imageGroup = document.getElementById("upload-file")?.closest(".form-group");
  if (imageGroup) imageGroup.style.display = "none";
  // Ses alanlarını gizle
  hideAudioFields();
}

function hideVideoFields() {
  document.querySelectorAll(".video-fields").forEach(el => {
    el.style.display = "none";
  });
  // Görsel alanını tekrar göster (sadece DnD için)
  const imageGroup = document.getElementById("upload-file")?.closest(".form-group");
  if (imageGroup) imageGroup.style.removeProperty("display");
  // Önizlemeyi gizle
  const preview = document.getElementById("video-link-preview");
  if (preview) preview.classList.remove("preview-show");
}

function isVideoCategory(category) {
  return category === "season1" || category === "season2";
}

/* -------------------------------------------------------
   UPLOAD SUBMIT (GUNCELLENMIS - localStorage destekli)
   ------------------------------------------------------- */

function handleUploadSubmit(event) {
  event.preventDefault();

  const title    = document.getElementById("upload-title")?.value.trim();
  const category = document.getElementById("upload-category")?.value;
  const desc     = document.getElementById("upload-desc")?.value.trim();
  const statusEl = document.getElementById("upload-status");
  const editId   = document.getElementById("upload-edit-id")?.value;

  if (!title || !category) {
    if (statusEl) {
      statusEl.textContent = "⚠️ Başlık ve kategori zorunludur!";
      statusEl.className   = "upload-status status-error";
    }
    return;
  }

  // EDİT MODU
  if (editId) {
    let link = "";
    if (isAudioCategory(category)) {
      link = document.getElementById("upload-audio-url")?.value.trim();
    } else if (isVideoCategory(category)) {
      const rawUrl = document.getElementById("upload-video-url")?.value.trim();
      link = convertToYouTubeEmbed(rawUrl);
    }
    
    if (typeof _getItemsByCategory === 'function') {
      const items = _getItemsByCategory(category);
      const index = items.findIndex(i => String(i.id) === String(editId));
      if (index !== -1) {
        items[index].title = title;
        items[index].description = desc;
        if (isAudioCategory(category)) {
          items[index].url = link;
        } else if (isVideoCategory(category)) {
          items[index].embedUrl = link;
        }
        
        if (typeof _saveItemsByCategory === 'function') _saveItemsByCategory(category, items);
        
        if (statusEl) {
          statusEl.textContent = `✅ İçerik başarıyla güncellendi!`;
          statusEl.className   = "upload-status status-success";
        }
        
        if (category === "podcast" && typeof loadPodcastsSection === 'function') loadPodcastsSection();
        else if (category === "audio" && typeof loadAudioVaultSection === 'function') loadAudioVaultSection();
        else if (category === "season1" && typeof loadSeason1Section === 'function') loadSeason1Section();
        else if (category === "season2" && typeof loadSeason2Section === 'function') loadSeason2Section();

        setTimeout(() => { closeUploadForm(); }, 1800);
      }
    }
    return;
  }

  if (isAudioCategory(category)) {
    // --- SES KATEGORISI ---
    const audioUrl      = document.getElementById("upload-audio-url")?.value.trim();
    const audioFileEl   = document.getElementById("upload-audio-file");
    const audioFile     = audioFileEl?.files[0] || null;

    if (!audioUrl && !audioFile) {
      if (statusEl) {
        statusEl.textContent = "⚠️ Ses URL'si veya dosya gereklidir!";
        statusEl.className   = "upload-status status-error";
      }
      return;
    }

    if (audioFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        _saveAudioEntry(category, title, desc, e.target.result, statusEl);
      };
      reader.onerror = () => {
        if (statusEl) {
          statusEl.textContent = "❌ Dosya okunurken hata oluştu.";
          statusEl.className   = "upload-status status-error";
        }
      };
      reader.readAsDataURL(audioFile);
    } else {
      _saveAudioEntry(category, title, desc, audioUrl, statusEl);
    }

  } else if (isVideoCategory(category)) {
    // --- VİDEO KATEGORISI (season1 / season2) ---
    const rawUrl   = document.getElementById("upload-video-url")?.value.trim();
    if (!rawUrl) {
      if (statusEl) {
        statusEl.textContent = "⚠️ Video linki zorunludur!";
        statusEl.className   = "upload-status status-error";
      }
      return;
    }
    const embedUrl = convertToYouTubeEmbed(rawUrl);
    _saveVideoEpisode(category, title, desc, embedUrl, statusEl);

  } else {
    // --- DIGER KATEGORILER (DnD vb.) ---
    const fileEl = document.getElementById("upload-file");
    const file   = fileEl?.files[0] || null;
    const payload = { title, category, description: desc, fileName: file?.name || null };
    console.log("%c[FeroFUFU Upload] İçerik kaydedildi (mock):", "color:#8b5cf6;font-weight:bold;", payload);

    if (statusEl) {
      statusEl.textContent = `✅ "${title}" başarıyla eklendi! (mock)`;
      statusEl.className   = "upload-status status-success";
    }

    setTimeout(() => { closeUploadForm(); }, 1800);
  }
}

function _saveAudioEntry(category, title, desc, url, statusEl) {
  const track = {
    id:          `${category}-${Date.now()}`,
    title,
    description: desc || "",
    url,
    addedAt:     new Date().toLocaleDateString("tr-TR")
  };

  try {
    if (category === "podcast" && typeof addPodcastFromUpload === "function") {
      addPodcastFromUpload(track);
    } else if (category === "audio" && typeof addAudioVaultFromUpload === "function") {
      addAudioVaultFromUpload(track);
    }

    if (statusEl) {
      statusEl.textContent = `✅ "${title}" ses listesine eklendi!`;
      statusEl.className   = "upload-status status-success";
    }
    console.log("%c[FeroFUFU Upload] Ses kaydedildi:", "color:#10b981;font-weight:bold;", track);
    setTimeout(() => { closeUploadForm(); }, 1800);

  } catch (e) {
    console.error("[Upload] Ses kaydedilemedi:", e);
    if (statusEl) {
      statusEl.textContent = "❌ Kaydedilemedi. Konsolu kontrol edin.";
      statusEl.className   = "upload-status status-error";
    }
  }
}

function _saveVideoEpisode(category, title, desc, embedUrl, statusEl) {
  const ep = {
    id:          `${category}-${Date.now()}`,
    title,
    description: desc || "",
    embedUrl,
    thumbnail:   "",
    addedAt:     new Date().toLocaleDateString("tr-TR")
  };

  try {
    if (category === "season1" && typeof addSeason1FromUpload === "function") {
      addSeason1FromUpload(ep);
    } else if (category === "season2" && typeof addSeason2FromUpload === "function") {
      addSeason2FromUpload(ep);
    }

    if (statusEl) {
      statusEl.textContent = `✅ "${title}" bölüm listeye eklendi!`;
      statusEl.className   = "upload-status status-success";
    }
    console.log("%c[FeroFUFU Upload] Video bölümü kaydedildi:", "color:#8b5cf6;font-weight:bold;", ep);
    setTimeout(() => { closeUploadForm(); }, 1800);

  } catch (e) {
    console.error("[Upload] Video kaydedilemedi:", e);
    if (statusEl) {
      statusEl.textContent = "❌ Kaydedilemedi. Konsolu kontrol edin.";
      statusEl.className   = "upload-status status-error";
    }
  }
}

/* -------------------------------------------------------
   EVENT BINDING
   ------------------------------------------------------- */

function setupUploadModule() {
  // Navbar upload button
  const uploadBtn = document.getElementById("upload-btn");
  if (uploadBtn) uploadBtn.addEventListener("click", openPasswordModal);

  // Password modal – close on backdrop click
  const pwModal = document.getElementById("password-modal");
  if (pwModal) {
    pwModal.addEventListener("click", (e) => {
      if (e.target === pwModal) closePasswordModal();
    });
  }

  // Password modal – close button
  const pwClose = document.getElementById("password-modal-close");
  if (pwClose) pwClose.addEventListener("click", closePasswordModal);

  // Password modal – submit button
  const pwSubmit = document.getElementById("password-submit");
  if (pwSubmit) pwSubmit.addEventListener("click", verifyPassword);

  // Password input – Enter key
  const pwInput = document.getElementById("password-input");
  if (pwInput) {
    pwInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") verifyPassword();
    });
  }

  // Upload modal – close on backdrop click
  const upModal = document.getElementById("upload-modal");
  if (upModal) {
    upModal.addEventListener("click", (e) => {
      if (e.target === upModal) closeUploadForm();
    });
  }

  // Upload modal – close button
  const upClose = document.getElementById("upload-modal-close");
  if (upClose) upClose.addEventListener("click", closeUploadForm);

  // Upload form – submit
  const upForm = document.getElementById("upload-form");
  if (upForm) upForm.addEventListener("submit", handleUploadSubmit);

  // File input – preview (gorsel)
  const fileInput = document.getElementById("upload-file");
  if (fileInput) fileInput.addEventListener("change", handleFileSelect);

  // Kategori seçimi değişince ilgili alanları göster/gizle
  const categorySelect = document.getElementById("upload-category");
  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      const val = categorySelect.value;
      if (isAudioCategory(val)) {
        showAudioFields();
        hideVideoFields();
      } else if (isVideoCategory(val)) {
        showVideoFields();
        hideAudioFields();
      } else {
        hideAudioFields();
        hideVideoFields();
      }
    });
  }

  // Ses dosyası seçilince dosya adını göster
  const audioFileInput = document.getElementById("upload-audio-file");
  if (audioFileInput) {
    audioFileInput.addEventListener("change", () => {
      const nameEl = document.getElementById("audio-file-name");
      const file   = audioFileInput.files[0];
      if (nameEl && file) {
        nameEl.textContent = `🎵 Seçilen: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      }
    });
  }

  // Video URL inputu değişince – canlı dönüşüm önizlemesi
  const videoUrlInput = document.getElementById("upload-video-url");
  const videoPreview  = document.getElementById("video-link-preview");
  const videoConverted = document.getElementById("video-link-converted");
  if (videoUrlInput) {
    videoUrlInput.addEventListener("input", () => {
      const raw       = videoUrlInput.value.trim();
      const converted = convertToYouTubeEmbed(raw);
      if (raw && converted && converted !== raw) {
        if (videoConverted) videoConverted.textContent = converted;
        if (videoPreview)   videoPreview.classList.add("preview-show");
      } else if (raw && converted) {
        if (videoConverted) videoConverted.textContent = converted + " (değişmedi)";
        if (videoPreview)   videoPreview.classList.add("preview-show");
      } else {
        if (videoPreview)   videoPreview.classList.remove("preview-show");
      }
    });
  }

  // ESC key closes any open modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closePasswordModal();
      closeUploadForm();
    }
  });
}
