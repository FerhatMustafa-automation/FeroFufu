/* =====================================================
   FeroFUFU – js/firebaseConfig.js
   Firebase Bulut Veritabanı Yapılandırma Dosyası
   ===================================================== */

"use strict";

/**
 * Firebase Proje Bilgileri
 * 
 * Nasıl Alınır?
 * 1. https://console.firebase.google.com adresine gidin (Google hesabınızla ücretsiz).
 * 2. "Proje Ekle" (Add Project) butonuna tıklayıp projeye bir isim verin (Örn: ferofufu-db).
 * 3. Sol menüden "Firestore Database" sekmesine tıklayın ve "Veritabanı Oluştur" (Create database) deyin.
 *    - Konum olarak "eur3 (europe-west)" seçebilirsiniz.
 *    - Kurallar kısmında "Test Modunda Başlat" (Start in test mode) seçin.
 * 4. Proje Ayarları (Project Settings - dişli çark simgesi) > "Uygulamalarınız" altından Web (</>) simgesine tıklayın.
 * 5. Size verilen aşağıdaki config nesnesini buraya yapıştırın.
 */

window.FIREBASE_CONFIG = {

  apiKey: "AIzaSyCpdG4e6-9Bhf4vxkZc-O6tb6Ssm8TqKUk",

  authDomain: "ferofufu-5268c.firebaseapp.com",

  projectId: "ferofufu-5268c",

  storageBucket: "ferofufu-5268c.firebasestorage.app",

  messagingSenderId: "560190451699",

  appId: "1:560190451699:web:4eecec6d2874ea21b92c86",

};
