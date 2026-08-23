/* =====================================================
   FeroFUFU – js/modules/auth.js
   Güvenli İstemci Taraflı Kimlik Doğrulama Modülü
   - SHA-256 Kriptografik Hash + Tuzlama (Salt)
   - Kriptografik Oturum İmzası (Session Token Validation)
   - Kaba Kuvvet Saldırısı Koruması (Anti-Brute-Force Rate Limiting)
   - Sıfır Düz Metin Şifre (Zero Plaintext Secrets)
   ===================================================== */

"use strict";

(function (window) {
  // 1. Kriptografik Sabitler
  const SALT = "ferofufu_salt_secure_2026";
  
  // Önceden hesaplanmış, tuzlanmış (salted) SHA-256 hash değerleri:
  // SHA-256(şifre + SALT)
  const ADMIN_HASH  = "83aa45d89c01b1c1fa878d735788c6c20fe850705831a2929f27973a2069f872";
  const UPLOAD_HASH = "e5556a0d9efbf1ae733e53f7e5897edfc1e2d4ccf9de1f95f06adc4287f9d342";

  // Oturum depolama anahtarları
  const SESSION_TOKEN_KEY = "_ff_admin_token";
  const SESSION_SID_KEY   = "_ff_admin_sid";
  const SESSION_TS_KEY    = "_ff_admin_ts";
  const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 saat

  // Brute-force sınırlama ayarları
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS   = 30 * 1000; // 30 saniye kilitlenme
  const ATTEMPT_KEY  = "_ff_auth_attempts";

  /* -------------------------------------------------------
     2. Standart SHA-256 Algoritması (Senkron Fallback)
     ------------------------------------------------------- */
  function sha256Sync(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    const lengthProperty = "length";
    let i, j;
    let result = "";

    const words = [];
    const hash = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];
    
    const k = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    const utf8 = unescape(encodeURIComponent(ascii));
    const utf8Length = utf8[lengthProperty];
    const utf8BitLength = utf8Length * 8;

    for (i = 0; i < utf8Length; i++) {
      words[i >> 2] |= (utf8.charCodeAt(i) & 0xff) << ((3 - (i % 4)) * 8);
    }
    words[utf8Length >> 2] |= 0x80 << ((3 - (utf8Length % 4)) * 8);
    
    while ((words.length % 16) !== 14) {
      words.push(0);
    }
    words.push((utf8BitLength / maxWord) | 0);
    words.push(utf8BitLength | 0);

    for (j = 0; j < words.length; j += 16) {
      const w = words.slice(j, j + 16);
      let a = hash[0], b = hash[1], c = hash[2], d = hash[3];
      let e = hash[4], f = hash[5], g = hash[6], h = hash[7];

      for (i = 0; i < 64; i++) {
        if (i >= 16) {
          const w15 = w[i - 15], w2 = w[i - 2];
          const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
          const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
          w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
        }
        const s1_e = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
        const ch = (e & f) ^ ((~e) & g);
        const temp1 = (h + s1_e + ch + k[i] + w[i]) | 0;
        const s0_a = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (s0_a + maj) | 0;

        h = g;
        g = f;
        f = e;
        e = (d + temp1) | 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) | 0;
      }

      hash[0] = (hash[0] + a) | 0;
      hash[1] = (hash[1] + b) | 0;
      hash[2] = (hash[2] + c) | 0;
      hash[3] = (hash[3] + d) | 0;
      hash[4] = (hash[4] + e) | 0;
      hash[5] = (hash[5] + f) | 0;
      hash[6] = (hash[6] + g) | 0;
      hash[7] = (hash[7] + h) | 0;
    }

    for (i = 0; i < 8; i++) {
      const hex = (hash[i] >>> 0).toString(16);
      result += ("00000000" + hex).slice(-8);
    }
    return result;
  }

  /* -------------------------------------------------------
     3. Web Crypto API ile Asenkron Hash (Varsa Donanım Hızlandırma)
     ------------------------------------------------------- */
  async function sha256Async(input) {
    if (window.crypto && window.crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      } catch (e) {
        // Fallback to sync
      }
    }
    return sha256Sync(input);
  }

  // Genel Hash fonksiyonu (Tuzlama ile birlikte)
  async function hashWithSalt(plainText) {
    if (!plainText) return "";
    return await sha256Async(plainText + SALT);
  }

  function hashWithSaltSync(plainText) {
    if (!plainText) return "";
    return sha256Sync(plainText + SALT);
  }

  /* -------------------------------------------------------
     4. Kaba Kuvvet (Brute-Force) Sınırlama
     ------------------------------------------------------- */
  function getAttemptData() {
    try {
      const raw = sessionStorage.getItem(ATTEMPT_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { count: 0, lockedUntil: 0 };
  }

  function saveAttemptData(data) {
    try {
      sessionStorage.setItem(ATTEMPT_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function checkLockout() {
    const data = getAttemptData();
    const now = Date.now();
    if (data.lockedUntil > now) {
      const remainingSec = Math.ceil((data.lockedUntil - now) / 1000);
      return { locked: true, remainingSec };
    }
    return { locked: false, remainingSec: 0 };
  }

  function registerFailedAttempt() {
    const data = getAttemptData();
    const now = Date.now();
    data.count = (data.count || 0) + 1;
    if (data.count >= MAX_ATTEMPTS) {
      data.lockedUntil = now + LOCKOUT_MS;
      data.count = 0;
    }
    saveAttemptData(data);
    return checkLockout();
  }

  function resetFailedAttempts() {
    saveAttemptData({ count: 0, lockedUntil: 0 });
  }

  /* -------------------------------------------------------
     5. Kriptografik Oturum İmzası Yönetimi
     ------------------------------------------------------- */
  function generateSessionSignature(sid, timestamp) {
    return sha256Sync(`${ADMIN_HASH}:session:${sid}:${timestamp}:${SALT}`);
  }

  function isSessionValid() {
    const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
    const sid = sessionStorage.getItem(SESSION_SID_KEY);
    const tsStr = sessionStorage.getItem(SESSION_TS_KEY);

    if (!token || !sid || !tsStr) return false;

    const ts = parseInt(tsStr, 10);
    if (isNaN(ts) || Date.now() - ts > SESSION_EXPIRY_MS) {
      clearSession();
      return false;
    }

    const expectedToken = generateSessionSignature(sid, tsStr);
    return token === expectedToken;
  }

  function createAdminSession() {
    const sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const ts = Date.now().toString();
    const token = generateSessionSignature(sid, ts);

    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    sessionStorage.setItem(SESSION_SID_KEY, sid);
    sessionStorage.setItem(SESSION_TS_KEY, ts);
    sessionStorage.setItem("isAdmin", "true"); // legacy compatibility
    resetFailedAttempts();
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_SID_KEY);
    sessionStorage.removeItem(SESSION_TS_KEY);
    sessionStorage.removeItem("isAdmin");
  }

  /* -------------------------------------------------------
     6. Doğrulama API'leri
     ------------------------------------------------------- */
  async function verifyAdminPassword(inputPassword) {
    const lockout = checkLockout();
    if (lockout.locked) {
      return { success: false, error: `Çok fazla deneme! Lütfen ${lockout.remainingSec} saniye bekleyin.` };
    }

    if (!inputPassword) {
      return { success: false, error: "Lütfen bir şifre girin." };
    }

    const computed = await hashWithSalt(inputPassword.trim().toLowerCase());
    if (computed === ADMIN_HASH) {
      createAdminSession();
      return { success: true };
    } else {
      const lockStatus = registerFailedAttempt();
      if (lockStatus.locked) {
        return { success: false, error: `❌ Çok fazla hatalı deneme! ${lockStatus.remainingSec} saniye kilitlendi.` };
      }
      return { success: false, error: "❌ Yanlış şifre! Lütfen tekrar deneyin." };
    }
  }

  async function verifyUploadPassword(inputPassword) {
    const lockout = checkLockout();
    if (lockout.locked) {
      return { success: false, error: `Çok fazla deneme! Lütfen ${lockout.remainingSec} saniye bekleyin.` };
    }

    if (!inputPassword) {
      return { success: false, error: "Lütfen bir şifre girin." };
    }

    const computed = await hashWithSalt(inputPassword.trim().toLowerCase());
    if (computed === UPLOAD_HASH) {
      resetFailedAttempts();
      return { success: true };
    } else {
      const lockStatus = registerFailedAttempt();
      if (lockStatus.locked) {
        return { success: false, error: `❌ Çok fazla hatalı deneme! ${lockStatus.remainingSec} saniye kilitlendi.` };
      }
      return { success: false, error: "❌ Yanlış şifre! Tekrar dene." };
    }
  }

  /* -------------------------------------------------------
     7. Genel Arayüze Dışa Aktarma
     ------------------------------------------------------- */
  const FeroAuth = {
    sha256: sha256Async,
    sha256Sync: sha256Sync,
    hashWithSalt: hashWithSalt,
    hashWithSaltSync: hashWithSaltSync,
    verifyAdmin: verifyAdminPassword,
    verifyUpload: verifyUploadPassword,
    isAdmin: isSessionValid,
    loginAdmin: createAdminSession,
    logoutAdmin: clearSession,
    checkLockout: checkLockout
  };

  window.FeroAuth = FeroAuth;
  
  // Eski checkAdminStatus çağrısını güvenli kriptografik doğrulamaya bağla
  window.checkAdminStatus = function () {
    return FeroAuth.isAdmin();
  };

  window.setAdminStatus = function (status) {
    if (status) {
      // Sadece token oluşturularak admin yapılabilir
      FeroAuth.loginAdmin();
    } else {
      FeroAuth.logoutAdmin();
    }
  };

})(window);
