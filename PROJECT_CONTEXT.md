# FeroFUFU - Proje Özeti ve Mimarisi

- Çok amaçlı modüler platform (Dark mode, glassmorphism, mobile-first responsive tasarım).
- Mevcut Modüller:
  - 🎭 **Litvus'un Soytarıları (DnD 1v1 Turnuvası)** -> `js/modules/dnd.js`
  - 📊 **FeroTier (TierMaker Klonu / Katman Listesi)** -> `js/modules/tierMaker.js` (Canvas ile PNG export, sürükle-bırak & mobil tap-to-place, Topluluğa kaydetme)
  - ✨ **FeroFUFU Maker (Özel Turnuva Oluşturucu)** -> `js/modules/fufuMaker.js` (Çoklu görsel sıkıştırma, kütüphane, JSON dışa/içe aktarma, 1v1 motoruna anında aktarım)
  - 🌍 **Topluluk Galerisi (Community Hub)** -> `js/modules/community.js` (Kullanıcı turnuvaları & Tier listeleri kalıcı arşivi)
  - 🎄 **Yılbaşı Podcastleri** -> `js/modules/podcasts.js`
  - 🎙️ **Epik Ses Kayıtları (Audio Vault)** -> `js/modules/audioVault.js`
  - 🎥 **Litvus Sezon 1 & Sezon 2 Video Galerileri** -> `js/modules/season1.js`, `js/modules/season2.js`
  - ☁️ **Bulut Veritabanı & Canlı Senkronizasyon** -> `js/modules/cloudDB.js`, `js/firebaseConfig.js` (Firebase Firestore real-time senkronizasyon + localStorage fallback)
  - 🔒 **Güvenli Kimlik Doğrulama Modülü** -> `js/modules/auth.js` (Salted SHA-256 kriptografik doğrulama, token tabanlı oturum, brute-force koruması)
  - ⚙️ **Canlı Yönetim Modu (Admin Panel)** -> `js/modules/admin.js` (Kriptografik oturum, inline edit ve silme)
  - 🖼️ **Canvas Görsel Sıkıştırma ve Depolama** -> `js/modules/db.js`
- Mobil Uyumluluk: `css/mobile.css` ile mobil alt gezinme çubuğu (Bottom Navigation), dokunmatik optimizasyonlar ve dinamik yerleşim.

## Dosya Hiyerarşisi
```
FeroFufu/
├── index.html
├── PROJECT_CONTEXT.md
├── style.css             (Genel temalar, hero, 1v1 arena, champion ekranı)
├── css/
│   ├── mobile.css        (Mobil-first responsive, bottom nav bar, touch optimizasyonu)
│   ├── fufu-maker.css    (Özel turnuva stüdyosu stilleri)
│   ├── tier-maker.css    (TierMaker katman tablosu ve mobil kontrol stilleri)
│   ├── community.css     (Topluluk galerisi stilleri)
│   ├── sidebar.css       (Açılır yan menü)
│   ├── modals.css        (Şifre ve yükleme modalları)
│   ├── audio-player.css  (Podcast & ses çalar stilleri)
│   ├── video-gallery.css (Sezon video galerileri)
│   └── admin.css         (Yönetici paneli stilleri)
├── js/
│   ├── firebaseConfig.js (Firebase Firestore bağlantı ayarları)
│   ├── modules/
│   │   ├── cloudDB.js    (Bulut veritabanı CRUD & Real-time senkronizasyon motoru)
│   │   ├── auth.js       (Salted SHA-256 kriptografik auth & oturum güvenliği)
│   │   ├── db.js         (Canvas görsel sıkıştırma & güvenli localStorage)
│   │   ├── dnd.js        (DnD 35 karakter havuzu ve 1v1 turnuva motoru)
│   │   ├── fufuMaker.js  (Özel turnuva oluşturucu motoru)
│   │   ├── tierMaker.js  (TierMaker motoru & Canvas PNG exporter)
│   │   ├── community.js  (Topluluk galerisi & kalıcı paylaşım)
│   │   ├── podcasts.js   (Podcast çalar modülü)
│   │   ├── audioVault.js (Epik ses kayıtları)
│   │   ├── season1.js    (Sezon 1 video galerisi)
│   │   ├── season2.js    (Sezon 2 video galerisi)
│   │   ├── upload.js     (İçerik yükleme & düzenleme)
│   │   └── admin.js      (Yönetici oturumu & inline edit)
│   └── script.js         (Ana yönlendirme ve orkestrasyon)
└── images/               (Karakter çizimleri, videolar ve animasyonlar)
```