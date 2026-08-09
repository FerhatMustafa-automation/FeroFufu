/* =====================================================
   FeroFUFU - script.js
   UwUFUFU Platform v2.0  –  Ana Orkestrasyon Dosyası

   Modüler yapı:
     js/modules/dnd.js     – DnD turnuva motoru + karakter verileri
     js/modules/upload.js  – Şifre doğrulama + içerik yükleme formu
     css/sidebar.css       – Yan menü stilleri
     css/modals.css        – Modal stilleri
   ===================================================== */

"use strict";

/* =====================================================
   SECTION 1: MODULAR CATEGORIES CONFIGURATION
   ===================================================== */
const categories = {
  dnd: {
    id: "dnd",
    label: "Litvus'un Soytarilari",
    icon: "🎭",
    active: true,
    announcement: "Litvus'un Soytarilari'nin",
    color: "#8b5cf6",
    characters: null  // loaded from dndCharacters
  },
  podcast: {
    id: "podcast",
    label: "Yılbaşı Podcastleri",
    icon: "🎄",
    active: true,
    announcement: "Yılbaşı Podcastleri",
    color: "#22c55e",
    characters: null
  },
  audio: {
    id: "audio",
    label: "Epik Ses Kayıtları",
    icon: "🎙️",
    active: true,
    announcement: "Epik Ses Kayıtları",
    color: "#f97316",
    characters: null
  },
  season1: {
    id: "season1",
    label: "Litvus'un Soytarıları Sezon 1",
    icon: "🎥",
    active: true,
    announcement: "Litvus'un Soytarıları Sezon 1",
    color: "#8b5cf6",
    characters: null
  },
  season2: {
    id: "season2",
    label: "Litvus'un Soytarıları Sezon 2",
    icon: "🎥",
    active: true,
    announcement: "Litvus'un Soytarıları Sezon 2",
    color: "#ef4444",
    characters: null
  },
  lol: {
    id: "lol",
    label: "LoL Karakterleri",
    icon: "⚔️",
    active: false,
    announcement: "LoL Karakterleri'nin",
    color: "#06b6d4",
    characters: null  // placeholder for future
  },
  funny_moments: {
    id: "funny_moments",
    label: "Komik Anlar",
    icon: "😂",
    active: false,
    announcement: "Komik Anlarin",
    color: "#ec4899",
    characters: null
  }
};

/* =====================================================
   SECTION 2: DnD CHARACTER DATA
   → Taşındı: js/modules/dnd.js
   ===================================================== */
// dndCharacters dizisi artık js/modules/dnd.js içinde tanımlıdır.

// dnd.js yüklendikten sonra bağlantı init() içinde kurulur.


    
/* =====================================================
   SECTION 3: TOURNAMENT STATE
   ===================================================== */
const state = {
  currentCategory: null,
  currentRound: 0,        // 0-indexed: 0=R1, 1=Semi, 2=Final
  roundNames: ["1. Tur", "Yari Final", "Final"],
  bracketIds: ["bracket-r1", "bracket-semi", "bracket-final"],
  pool: [],               // Characters remaining in current round
  nextPool: [],           // Winners advancing to next round
  matchIndex: 0,          // Current match index in the round
  totalMatchesInRound: 0, // Total matches in the round
  leftChar: null,
  rightChar: null,
  isAnimating: false      // Prevent double-click during transitions
};

/* =====================================================
   SECTION 4: DOM REFERENCES
   ===================================================== */
const dom = {
  heroSection:     () => document.getElementById("hero-section"),
  arenaSection:    () => document.getElementById("arena-section"),
  championSection: () => document.getElementById("champion-section"),

  // Navbar
  hamburgerBtn:    () => document.getElementById("hamburger-btn"),
  navbarMenu:      () => document.getElementById("navbar-menu"),
  navbar:          () => document.getElementById("navbar"),
  navItems:        () => document.querySelectorAll(".nav-item"),
  navbarLogo:      () => document.getElementById("navbar-logo"),

  // Arena
  roundTitle:      () => document.getElementById("round-title"),
  roundSubtitle:   () => document.getElementById("round-subtitle"),
  tournamentCatLabel: () => document.getElementById("tournament-cat-label"),
  matchCountText:  () => document.getElementById("match-count-text"),
  progressFill:    () => document.getElementById("match-progress-fill"),
  bracketSteps:    () => document.querySelectorAll(".bracket-step"),
  bracketR1:       () => document.getElementById("bracket-r1"),
  bracketSemi:     () => document.getElementById("bracket-semi"),
  bracketFinal:    () => document.getElementById("bracket-final"),

  // Character cards
  cardLeft:        () => document.getElementById("char-card-left"),
  cardRight:       () => document.getElementById("char-card-right"),
  imgLeft:         () => document.getElementById("char-img-left"),
  imgRight:        () => document.getElementById("char-img-right"),
  nameLeft:        () => document.getElementById("char-name-left"),
  nameRight:       () => document.getElementById("char-name-right"),
  descLeft:        () => document.getElementById("char-desc-left"),
  descRight:       () => document.getElementById("char-desc-right"),
  classLeft:       () => document.getElementById("char-class-left"),
  classRight:      () => document.getElementById("char-class-right"),

  // Champion
  championImg:     () => document.getElementById("champion-img"),
  championName:    () => document.getElementById("champion-name"),
  championDesc:    () => document.getElementById("champion-desc"),
  championClass:   () => document.getElementById("champion-class"),
  championAnnouncement: () => document.getElementById("champion-announcement"),
  confettiContainer: () => document.getElementById("confetti-container"),

  // Buttons
  startDndBtn:     () => document.getElementById("start-dnd-btn"),
  backToHomeBtn:   () => document.getElementById("back-to-home-btn"),
  replayBtn:       () => document.getElementById("replay-btn"),
  championHomeBtn: () => document.getElementById("champion-home-btn"),

  // Particles
  particlesContainer: () => document.getElementById("particles-container"),
  vsSparks:        () => document.getElementById("vs-sparks")
};

/* =====================================================
   SECTION 5: UTILITY FUNCTIONS
   ===================================================== */

/** Fisher-Yates shuffle */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showSection(sectionEl) {
  [
    dom.heroSection(),
    dom.arenaSection(),
    dom.championSection(),
    document.getElementById("podcasts-section"),
    document.getElementById("audio-vault-section"),
    document.getElementById("season1-section"),
    document.getElementById("season2-section")
  ].forEach(el => {
    if (el) el.classList.add("hidden");
  });
  if (sectionEl) sectionEl.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* =====================================================
   SECTION 6: PARTICLE & EFFECT GENERATORS
   ===================================================== */

function generateParticles() {
  const container = dom.particlesContainer();
  if (!container) return;
  container.innerHTML = "";
  const colors = ["#8b5cf6", "#06b6d4", "#ec4899", "#f59e0b", "#10b981"];
  for (let i = 0; i < 25; i++) {
    const dot = document.createElement("div");
    dot.className = "particle-dot";
    const size = Math.random() * 4 + 2;
    dot.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      --p-dur: ${Math.random() * 6 + 5}s;
      --p-delay: ${Math.random() * 4}s;
      --p-tx: ${(Math.random() - 0.5) * 60}px;
      --p-ty: ${(Math.random() - 0.5) * 60}px;
    `;
    container.appendChild(dot);
  }
}

function generateVsSparks() {
  const container = dom.vsSparks();
  if (!container) return;
  container.innerHTML = "";
  const colors = ["#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];
  for (let i = 0; i < 10; i++) {
    const spark = document.createElement("div");
    spark.className = "vs-spark";
    const angle = (Math.PI * 2 / 10) * i;
    const dist = 30 + Math.random() * 20;
    spark.style.cssText = `
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      --tx: ${Math.cos(angle) * dist}px;
      --ty: ${Math.sin(angle) * dist}px;
      --dur: ${0.8 + Math.random() * 0.8}s;
      --delay: ${Math.random() * 0.6}s;
    `;
    container.appendChild(spark);
  }
}

function generateConfetti() {
  const container = dom.confettiContainer();
  if (!container) return;
  container.innerHTML = "";
  const colors = ["#8b5cf6","#ec4899","#f59e0b","#10b981","#06b6d4","#f97316","#6d28d9"];
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${Math.random() * 8 + 5}px;
      height: ${Math.random() * 8 + 5}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
      animation-duration: ${Math.random() * 3 + 3}s;
      animation-delay: ${Math.random() * 3}s;
    `;
    container.appendChild(piece);
  }
}

/* =====================================================
   SECTION 7: CATEGORY LOADER
   Komut 4 - loadCategory mimarisi
   ===================================================== */

/**
 * loadCategory(categoryId)
 * Ana modüler giriş noktası.
 * Yeni bir kategori eklediğinde buraya mantığını koyabilirsin.
 */
function loadCategory(categoryId) {
  const cat = categories[categoryId];
  if (!cat) {
    console.warn("Kategori bulunamadi:", categoryId);
    return;
  }
  if (!cat.active) {
    showComingSoonToast(cat.label);
    return;
  }

  state.currentCategory = cat;

  switch (categoryId) {
    case "dnd":
      startTournament(cat.characters);
      break;
    case "podcast":
      showSection(document.getElementById("podcasts-section"));
      if (typeof loadPodcastsSection === "function") loadPodcastsSection();
      break;
    case "audio":
      showSection(document.getElementById("audio-vault-section"));
      if (typeof loadAudioVaultSection === "function") loadAudioVaultSection();
      break;
    case "season1":
      showSection(document.getElementById("season1-section"));
      if (typeof loadSeason1Section === "function") loadSeason1Section();
      break;
    case "season2":
      showSection(document.getElementById("season2-section"));
      if (typeof loadSeason2Section === "function") loadSeason2Section();
      break;
    case "lol":
      showComingSoonToast(cat.label);
      break;
    case "funny_moments":
      showComingSoonToast(cat.label);
      break;
    default:
      console.warn("Bilinmeyen kategori:", categoryId);
  }
}

function showComingSoonToast(label) {
  const existing = document.getElementById("coming-soon-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "coming-soon-toast";
  toast.innerHTML = `🔒 <strong>${label}</strong> yakında geliyor!`;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "32px",
    left: "50%",
    transform: "translateX(-50%) translateY(20px)",
    background: "rgba(13,16,23,0.95)",
    backdropFilter: "blur(12px)",
    color: "#f1f5f9",
    padding: "14px 28px",
    borderRadius: "50px",
    border: "1px solid rgba(245,158,11,0.4)",
    fontSize: "0.9rem",
    fontWeight: "500",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    zIndex: "9999",
    transition: "all 0.3s ease",
    opacity: "0"
  });
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(20px)";
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

/* =====================================================
   SECTION 8–10: TOURNAMENT ENGINE / BRACKET / CHAMPION
   → Taşındı: js/modules/dnd.js
   (startTournament, loadNextMatch, vote, advanceToNextRound,
    updateBracketUI, updateMatchCounter, revealChampion)
   ===================================================== */

/* =====================================================
   SECTION 9: BRACKET & PROGRESS UI
   ===================================================== */

function updateBracketUI() {
  // Round title
  const roundName = state.roundNames[state.currentRound] || "Tur " + (state.currentRound + 1);
  dom.roundTitle().textContent = roundName;

  const subtitles = [
    "Kim daha sevimli? 👇",
    "Sadece 4 kaldi! Kim gidecek?",
    "Buyuk Final! En iyisi kim?",
  ];
  dom.roundSubtitle().textContent = subtitles[state.currentRound] || "Devam et!";

  // Bracket steps highlight
  const bracketIds = ["bracket-r1", "bracket-semi", "bracket-final"];
  bracketIds.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("active-bracket", "done-bracket");
    if (i < state.currentRound)        el.classList.add("done-bracket");
    else if (i === state.currentRound) el.classList.add("active-bracket");
  });
}

function updateMatchCounter() {
  const total = state.totalMatchesInRound;
  const current = state.matchIndex + 1;
  const label = state.roundNames[state.currentRound] || "Tur";

  dom.matchCountText().textContent = `${label} – Mac ${current} / ${total}`;

  const pct = total > 0 ? (state.matchIndex / total) * 100 : 0;
  dom.progressFill().style.width = pct + "%";
  dom.progressFill().parentElement.setAttribute("aria-valuenow", pct);
}

/* =====================================================
   SECTION 10: CHAMPION REVEAL
   ===================================================== */

function revealChampion(champion) {
  dom.championImg().src = champion.image || getDefaultImage(champion);
  dom.championImg().alt = champion.name;
  dom.championName().textContent = champion.name;
  dom.championDesc().textContent = champion.description;
  dom.championClass().textContent = champion.class || "";

  showSection(dom.championSection());
  generateConfetti();
}

/* =====================================================
   SECTION 11: NAVIGATION & EVENT BINDING
   ===================================================== */

function setupNavbar() {
  // Hamburger toggle
  const hamburger = dom.hamburgerBtn();
  const menu      = dom.navbarMenu();
  if (hamburger && menu) {
    hamburger.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", isOpen);
    });
    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!hamburger.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Nav items
  dom.navItems().forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      if (item.classList.contains("coming-soon")) return;
      const catId = item.dataset.category;
      loadCategory(catId);
      menu.classList.remove("open");
    });
  });

  // Scroll effect
  window.addEventListener("scroll", () => {
    const navbar = dom.navbar();
    if (navbar) {
      navbar.classList.toggle("scrolled", window.scrollY > 20);
    }
  }, { passive: true });

  // Logo -> home
  const logo = dom.navbarLogo();
  if (logo) {
    logo.addEventListener("click", (e) => {
      e.preventDefault();
      goHome();
    });
  }
}

function setupButtons() {
  // Category cards & start buttons
  document.querySelectorAll("[data-category]").forEach(el => {
    el.addEventListener("click", (e) => {
      const catId = el.dataset.category;
      const cat   = categories[catId];
      if (!cat || !cat.active) return;
      if (el.tagName === "DIV" || el.id === "start-dnd-btn") {
        loadCategory(catId);
      }
    });

    // Keyboard support
    if (el.classList.contains("category-card")) {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          el.click();
        }
      });
    }
  });

  // Character cards – vote on click
  const cardLeft  = dom.cardLeft();
  const cardRight = dom.cardRight();

  if (cardLeft) {
    cardLeft.addEventListener("click", () => vote("left"));
    cardLeft.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") vote("left");
    });
  }
  if (cardRight) {
    cardRight.addEventListener("click", () => vote("right"));
    cardRight.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") vote("right");
    });
  }

  // Back to home from arena
  const backBtn = dom.backToHomeBtn();
  if (backBtn) backBtn.addEventListener("click", goHome);

  // Replay – restart same category tournament
  const replayBtn = dom.replayBtn();
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      const cat = state.currentCategory || categories.dnd;
      if (cat && cat.characters) startTournament(cat.characters);
    });
  }

  // Champion home button
  const champHomeBtn = dom.championHomeBtn();
  if (champHomeBtn) champHomeBtn.addEventListener("click", goHome);
}

function goHome() {
  state.currentCategory = null;
  state.isAnimating = false;
  showSection(dom.heroSection());
}

/* =====================================================
   SECTION 12: SIDEBAR
   ===================================================== */

function setupSidebar() {
  const toggleBtn  = document.getElementById("sidebar-toggle");
  const sidebar    = document.getElementById("sidebar");
  const overlay    = document.getElementById("sidebar-overlay");
  const closeBtn   = document.getElementById("sidebar-close");

  if (!toggleBtn || !sidebar || !overlay) return;

  function openSidebar() {
    sidebar.classList.add("sidebar-open");
    overlay.classList.add("overlay-visible");
    toggleBtn.classList.add("is-open");
    toggleBtn.setAttribute("aria-expanded", "true");
  }

  function closeSidebar() {
    sidebar.classList.remove("sidebar-open");
    overlay.classList.remove("overlay-visible");
    toggleBtn.classList.remove("is-open");
    toggleBtn.setAttribute("aria-expanded", "false");
  }

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.contains("sidebar-open") ? closeSidebar() : openSidebar();
  });

  if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });

  // Sidebar nav items
  document.querySelectorAll(".sidebar-item[data-category]").forEach(item => {
    item.addEventListener("click", () => {
      if (item.classList.contains("sidebar-locked")) return;
      const catId = item.dataset.category;
      closeSidebar();
      loadCategory(catId);
    });
  });
}

/* =====================================================
   SECTION 13: INIT
   ===================================================== */

function init() {
  setupNavbar();
  setupButtons();
  setupSidebar();
  setupUploadModule();
  generateParticles();

  // Link dndCharacters (defined in dnd.js) to categories
  if (typeof dndCharacters !== "undefined") {
    categories.dnd.characters = dndCharacters;
  }

  // Show hero section by default
  showSection(dom.heroSection());

  console.log(
    "%cFeroFUFU Platform v2.0\n%c🎭 Litvus'un Soytarilari + Sidebar + Upload ready!",
    "color:#8b5cf6;font-size:16px;font-weight:bold;",
    "color:#10b981;font-size:12px;"
  );
}

// Boot on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
