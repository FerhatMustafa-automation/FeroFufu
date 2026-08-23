/* =====================================================
   FeroFUFU – js/modules/db.js
   Görsel Sıkıştırma Yardımcı Modülü
   Canvas API ile yüksek çözünürlüklü görselleri küçültür
   ===================================================== */

"use strict";

/**
 * Bir görsel dosyasını (File/Blob) Canvas üzerinde yeniden boyutlandırır
 * ve JPEG formatında sıkıştırılmış Base64 Data URL döndürür.
 *
 * @param {File} file         – Kullanıcının seçtiği görsel dosyası
 * @param {Object} [opts]     – Opsiyonel ayarlar
 * @param {number} [opts.maxWidth=900]   – Maksimum genişlik (px)
 * @param {number} [opts.maxHeight=900]  – Maksimum yükseklik (px)
 * @param {number} [opts.quality=0.75]   – JPEG kalite (0.0 – 1.0)
 * @returns {Promise<string>} – Sıkıştırılmış Base64 Data URL ("data:image/jpeg;base64,...")
 */
function compressImageFile(file, opts) {
  const maxWidth  = (opts && opts.maxWidth)  || 900;
  const maxHeight = (opts && opts.maxHeight) || 900;
  const quality   = (opts && opts.quality)   || 0.75;

  return new Promise(function (resolve, reject) {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("[db.js] Geçersiz dosya tipi: " + (file ? file.type : "null")));
      return;
    }

    console.log("[db.js] Sıkıştırma başlıyor:", file.name, "Boyut:", (file.size / 1024).toFixed(1), "KB");

    var reader = new FileReader();

    reader.onerror = function () {
      console.error("[db.js] FileReader hatası");
      reject(new Error("Dosya okunamadı."));
    };

    reader.onload = function (e) {
      var img = new Image();

      img.onerror = function () {
        console.error("[db.js] Image decode hatası");
        reject(new Error("Görsel decode edilemedi."));
      };

      img.onload = function () {
        // --- Boyut hesapla ---
        var w = img.width;
        var h = img.height;

        const ratio = Math.min(maxWidth / w, maxHeight / h, 1);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);

        // --- Canvas üzerinde çiz ---
        var canvas = document.createElement("canvas");
        canvas.width  = w;
        canvas.height = h;

        var ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled  = true;
        ctx.imageSmoothingQuality  = "high";
        ctx.drawImage(img, 0, 0, w, h);

        // --- JPEG olarak Base64'e çevir ---
        var dataUrl = canvas.toDataURL("image/jpeg", quality);

        var originalKB   = (file.size / 1024).toFixed(1);
        var compressedKB = (dataUrl.length * 0.75 / 1024).toFixed(1);
        console.log(
          "[db.js] Sıkıştırma tamamlandı: " + originalKB + " KB → ~" + compressedKB + " KB " +
          "(" + w + "x" + h + ", q=" + quality + ")"
        );

        resolve(dataUrl);
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Sıkıştırılmış Base64 stringini güvenli şekilde localStorage'a yazar.
 * QuotaExceededError yakalar ve anlamlı hata mesajı döndürür.
 *
 * @param {string} key   – localStorage anahtarı
 * @param {string} value – JSON.stringify edilmiş veri
 * @returns {{ success: boolean, error?: string }}
 */
function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (e) {
    if (e.name === "QuotaExceededError" || e.code === 22) {
      console.error("[db.js] localStorage KOTA AŞILDI! Anahtar:", key, "Veri boyutu:", (value.length / 1024).toFixed(1), "KB");
      return { success: false, error: "Depolama alanı doldu. Eski içerikleri silerek yer açın." };
    }
    console.error("[db.js] localStorage yazma hatası:", e);
    return { success: false, error: "Bilinmeyen hata: " + e.message };
  }
}

// Global olarak erişilebilir yap
window.feroMedia = {
  compressImage: compressImageFile,
  safeSave: safeLocalStorageSet
};
