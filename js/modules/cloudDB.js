/* =====================================================
   FeroFUFU – js/modules/cloudDB.js
   Bulut Veritabanı ve Gerçek Zamanlı Senkronizasyon Modülü
   - Firebase Firestore Entegrasyonu (Cloud Sync)
   - Otomatik Yerel Önbellekleme (LocalStorage Fallback)
   - Real-time (Canlı) Veri Dinleme ve Anlık UI Güncelleme
   ===================================================== */

"use strict";

(function (window) {
  let db = null;
  let isConnected = false;
  const listeners = {};

  // Koleksiyon anahtarları ve karşılık gelen localStorage anahtarları
  const COLLECTION_MAP = {
    season1: "ferofufu_season1",
    season2: "ferofufu_season2",
    podcast: "ferofufu_podcasts",
    audio: "ferofufu_audio",
    tournament: "ferofufu_custom_tournaments",
    tierlist: "ferofufu_community_tierlists",
    dnd: "ferofufu_custom_characters"
  };

  /* -------------------------------------------------------
     1. Firebase & Firestore Başlatma
     ------------------------------------------------------- */
  function initCloudDB() {
    try {
      const config = window.FIREBASE_CONFIG;
      if (
        typeof window.firebase !== "undefined" &&
        config &&
        config.projectId &&
        config.projectId.trim() !== "" &&
        config.apiKey &&
        config.apiKey.trim() !== ""
      ) {
        if (!firebase.apps.length) {
          firebase.initializeApp(config);
        }
        db = firebase.firestore();
        isConnected = true;
        console.log("☁️ [FeroCloud] Firebase Firestore bağlantısı başarılı!");
        setupRealtimeListeners();
      } else {
        console.log("💾 [FeroCloud] Firebase yapılandırması henüz girilmedi, Yerel Mod (localStorage) aktif.");
      }
    } catch (err) {
      console.warn("⚠️ [FeroCloud] Firebase başlatılamadı, yerel depolama kullanılacak:", err);
      isConnected = false;
    }
  }

  /* -------------------------------------------------------
     2. Canlı Real-Time Dinleyiciler
     ------------------------------------------------------- */
  function setupRealtimeListeners() {
    if (!db || !isConnected) return;

    Object.keys(COLLECTION_MAP).forEach(colKey => {
      const storageKey = COLLECTION_MAP[colKey];
      const firestoreColName = `ff_${colKey}`;

      db.collection(firestoreColName).onSnapshot(
        snapshot => {
          const cloudItems = [];
          snapshot.forEach(doc => {
            cloudItems.push({ id: doc.id, ...doc.data() });
          });

          if (cloudItems.length > 0) {
            // Yerel depolamayı bulut verisiyle güncelle
            try {
              localStorage.setItem(storageKey, JSON.stringify(cloudItems));
            } catch (e) {
              if (window.feroMedia && window.feroMedia.safeSave) {
                window.feroMedia.safeSave(storageKey, JSON.stringify(cloudItems));
              }
            }

            // Arayüze güncelleme sinyali gönder
            window.dispatchEvent(
              new CustomEvent("ferofufu_cloud_update", {
                detail: { collection: colKey, items: cloudItems }
              })
            );
          }
        },
        error => {
          console.warn(`[FeroCloud] ${colKey} dinleme hatası:`, error);
        }
      );
    });
  }

  /* -------------------------------------------------------
     3. Veri Okuma (Read)
     ------------------------------------------------------- */
  function getItems(categoryKey, defaultItems = []) {
    const storageKey = COLLECTION_MAP[categoryKey] || categoryKey;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn(`[FeroCloud] getItems (${categoryKey}) okuma hatası:`, e);
    }
    return defaultItems;
  }

  /* -------------------------------------------------------
     4. Veri Kaydetme / Güncelleme (Write / Update)
     ------------------------------------------------------- */
  async function saveItem(categoryKey, item) {
    if (!item || !item.id) return { success: false, error: "Geçersiz içerik nesnesi veya ID eksik." };

    const storageKey = COLLECTION_MAP[categoryKey] || categoryKey;
    const currentList = getItems(categoryKey, []);
    const index = currentList.findIndex(i => i.id === item.id);

    if (index >= 0) {
      currentList[index] = item;
    } else {
      currentList.push(item);
    }

    // 1. Önce yerel hafızaya kaydet (Anında tepki)
    let localResult = { success: true };
    try {
      localStorage.setItem(storageKey, JSON.stringify(currentList));
    } catch (e) {
      if (window.feroMedia && window.feroMedia.safeSave) {
        localResult = window.feroMedia.safeSave(storageKey, JSON.stringify(currentList));
      }
    }

    // 2. Bulut bağlıysa Firestore'a yaz
    if (db && isConnected) {
      try {
        const firestoreColName = `ff_${categoryKey}`;
        // ID'yi doküman adı olarak kullan, veriyi yaz
        const docData = { ...item };
        delete docData.id; // doc.id zaten ID'dir
        await db.collection(firestoreColName).doc(item.id).set(docData, { merge: true });
        console.log(`☁️ [FeroCloud] ${categoryKey}/${item.id} buluta kaydedildi.`);
      } catch (err) {
        console.error(`[FeroCloud] Buluta yazma hatası:`, err);
        return { success: false, error: "Buluta kaydedilemedi: " + err.message, localSaved: localResult.success };
      }
    }

    return { success: true, localSaved: localResult.success, cloudSaved: isConnected };
  }

  async function saveCollection(categoryKey, itemsList) {
    if (!Array.isArray(itemsList)) return;

    const storageKey = COLLECTION_MAP[categoryKey] || categoryKey;
    try {
      localStorage.setItem(storageKey, JSON.stringify(itemsList));
    } catch (e) {
      if (window.feroMedia && window.feroMedia.safeSave) {
        window.feroMedia.safeSave(storageKey, JSON.stringify(itemsList));
      }
    }

    // Buluta aktar
    if (db && isConnected) {
      const firestoreColName = `ff_${categoryKey}`;
      const batch = db.batch();
      itemsList.forEach(item => {
        if (item.id) {
          const docRef = db.collection(firestoreColName).doc(item.id);
          const docData = { ...item };
          delete docData.id;
          batch.set(docRef, docData, { merge: true });
        }
      });
      try {
        await batch.commit();
        console.log(`☁️ [FeroCloud] ${categoryKey} toplu senkronizasyon tamamlandı.`);
      } catch (e) {
        console.error("[FeroCloud] Batch commit hatası:", e);
      }
    }
  }

  /* -------------------------------------------------------
     5. Veri Silme (Delete)
     ------------------------------------------------------- */
  async function deleteItem(categoryKey, itemId) {
    if (!itemId) return { success: false };

    const storageKey = COLLECTION_MAP[categoryKey] || categoryKey;
    const currentList = getItems(categoryKey, []);
    const filtered = currentList.filter(i => i.id !== itemId);

    try {
      localStorage.setItem(storageKey, JSON.stringify(filtered));
    } catch (e) {
      if (window.feroMedia && window.feroMedia.safeSave) {
        window.feroMedia.safeSave(storageKey, JSON.stringify(filtered));
      }
    }

    // Buluttan sil
    if (db && isConnected) {
      try {
        const firestoreColName = `ff_${categoryKey}`;
        await db.collection(firestoreColName).doc(itemId).delete();
        console.log(`☁️ [FeroCloud] ${categoryKey}/${itemId} buluttan silindi.`);
      } catch (err) {
        console.error("[FeroCloud] Buluttan silme hatası:", err);
      }
    }

    return { success: true };
  }

  /* -------------------------------------------------------
     6. Dışa Aktarma
     ------------------------------------------------------- */
  window.FeroDB = {
    init: initCloudDB,
    isCloudActive: () => isConnected,
    getItems: getItems,
    saveItem: saveItem,
    saveCollection: saveCollection,
    deleteItem: deleteItem,
    COLLECTIONS: COLLECTION_MAP
  };

  // Sayfa yüklendiğinde otomatik başlat
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCloudDB);
  } else {
    initCloudDB();
  }

})(window);
