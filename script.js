/* =====================================================
   FeroFUFU - script.js
   UwUFUFU Tournament System v1.0
   ===================================================== */

"use strict";

/* =====================================================
   SECTION 1: MODULAR CATEGORIES CONFIGURATION
   Komut 4 - Modüler yapı
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
   SECTION 2: DnD CHARACTER DATA – Litvus'un Soytarilari
   Gorseller: images/ klasorunden yuklendi (35 PNG karakter)
   ===================================================== */
const dndCharacters = [
  {
    id: 1,
    name: "Bob",
    image: "images/Bob.png",
    description: "Sade ama etkili. Ne düşündüğünü hiç belli etmez, ama her şeyi görüp işitir.",
    class: "Bilinmeyen",
    color: "#64748b"
  },
  {
    id: 2,
    name: "Valor",
    image: "images/Valor.png",
    description: "Yiğitlik onun ikinci adı. Tehlikeden kaçmak diye bir şey yok sözlüğünde.",
    class: "Savaşçı",
    color: "#ef4444"
  },
  {
    id: 3,
    name: "Doktor Tim",
    image: "images/Doktor Tim.png",
    description: "İyileştirdiğinden çok daha fazlasını bozar ama hep iyi niyetle yapar.",
    class: "Healer",
    color: "#06b6d4"
  },
  {
    id: 4,
    name: "Paladin Doris",
    image: "images/Paladin Doris.png",
    description: "Tanrının gözde kızı. Işığı hem kalkan hem kılıç olarak kullanır.",
    class: "Paladin",
    color: "#f59e0b"
  },
  {
    id: 5,
    name: "Kont Mrakula",
    image: "images/Kont Mrakula.png",
    description: "Zarif, gizemli ve biraz tehlikeli. Gece yarısı davetlere bayılır.",
    class: "Vampire",
    color: "#6d28d9"
  },
  {
    id: 6,
    name: "Kral",
    image: "images/Kral.png",
    description: "Tahtı kadar ağır bir sorumluluğu var. Kararları krallığın kaderini şekillendirir.",
    class: "Ruler",
    color: "#d4af37"
  },
  {
    id: 7,
    name: "Kaslı Ted",
    image: "images/Kaslı ted.png",
    description: "Kolları kaya gibi, kalbi de aynı. Düşünmeden önce yumruk atar.",
    class: "Barbarian",
    color: "#f97316"
  },
  {
    id: 8,
    name: "Kaslı Lim",
    image: "images/Kaslı lim.png",
    description: "Ted'in biraz daha akıllı versiyonu. Biraz.",
    class: "Fighter",
    color: "#84cc16"
  },
  {
    id: 9,
    name: "Nazik Prens",
    image: "images/Nazik Prens.png",
    description: "Kibarlığı bazen zayıflık sanılır ama yanılırlar. Çok yanılırlar.",
    class: "Bard",
    color: "#ec4899"
  },
  {
    id: 10,
    name: "Prens Arthur",
    image: "images/7.Prens Arthur.png",
    description: "Krallığın yedinci prensi. Sıraya girmekten bıkmış, macera arıyor.",
    class: "Knight",
    color: "#3b82f6"
  },
  {
    id: 11,
    name: "Sir David",
    image: "images/Sir David(Ejder Dogan).png",
    description: "Ejderden doğdu, ejder gibi savaşır. Alev nefesi sadece mecazi değil.",
    class: "Dragon Knight",
    color: "#dc2626"
  },
  {
    id: 12,
    name: "Yüce Boris",
    image: "images/Yüce Efsanevi Paladin Boris.png",
    description: "Efsanevi paladin. Adı bile söylenince düşmanlar titrer.",
    class: "Legendary Paladin",
    color: "#f59e0b"
  },
  {
    id: 13,
    name: "Elf Anna",
    image: "images/Elf anna.png",
    description: "Ormanların sesi, rüzgarın kızı. Oku asla ıskalamaz.",
    class: "Ranger",
    color: "#10b981"
  },
  {
    id: 14,
    name: "Küçük Elf Citrus",
    image: "images/Kucuk elf Citrus.png",
    description: "Küçük ama marifeti büyük. Elfçe büyüler konusunda kimseyle yarışamaz.",
    class: "Wizard",
    color: "#a3e635"
  },
  {
    id: 15,
    name: "Golem",
    image: "images/Golem.png",
    description: "Taştan yapılmış, kalpten hisseden. Konuşmaz ama anlar.",
    class: "Construct",
    color: "#78716c"
  },
  {
    id: 16,
    name: "Döldalf",
    image: "images/Döldalf ve torunları.png",
    description: "Bilge büyücü, torunlarıyla birlikte. Asasıyla dünyayı şekillendirdi.",
    class: "Archmage",
    color: "#8b5cf6"
  },
  {
    id: 17,
    name: "İksir Matilda",
    image: "images/8 iksir Matilda.png",
    description: "Küçük şişelerde büyük sırlar taşır. Hangi renk ne yapar? O bile tam bilmez.",
    class: "Alchemist",
    color: "#a855f7"
  },
  {
    id: 18,
    name: "Ağır Zırhlı Şövalye",
    image: "images/Agır zırhlı şövalye.png",
    description: "Demirden kalın, yürekten daha da kalın. Her adımda zemin titrer.",
    class: "Heavy Knight",
    color: "#94a3b8"
  },
  {
    id: 19,
    name: "Demir Korsan Jack",
    image: "images/Demir korsan jack.png",
    description: "Denizlerin yıldızı karaya çıktı. Kılıcı kancasından daha keskin.",
    class: "Pirate",
    color: "#0ea5e9"
  },
  {
    id: 20,
    name: "Fakir Dilenci Kız",
    image: "images/Fakir dilenci kiz.png",
    description: "Görünüşe aldanma. Sokakların en zeki gözleri ona aittir.",
    class: "Rogue",
    color: "#b45309"
  },
  {
    id: 21,
    name: "Gazeteci Çocuk",
    image: "images/Gazeteci çocuk.png",
    description: "Kaleminden çıkan her sözcük bir ok gibi hedefe saplanır. Gerçeği gizleyemezsin.",
    class: "Scholar",
    color: "#f0abfc"
  },
  {
    id: 22,
    name: "Hancı",
    image: "images/Hanci(Yusufun hanına gergerdanla girdiği).png",
    description: "Yusuf'un hanının efsanevi sahibi. Gergedanla giren müşterisini hâlâ unutamadı.",
    class: "Innkeeper",
    color: "#c2410c"
  },
  {
    id: 23,
    name: "Ejderha Avcıları",
    image: "images/Kam ateşi etrafindaki Ejderha avcisi şovalyeleri.png",
    description: "Kamp ateşinin etrafında birleşen yiğitler. Her biri bir efsane, hepsi bir ordu.",
    class: "Dragon Hunters",
    color: "#b91c1c"
  },
  {
    id: 24,
    name: "Leydi Lana",
    image: "images/Leydi Lana ve efendi Rhods.png",
    description: "Efendi Rhods ile seyahat eder. Nezaketi kılıcından keskin, gülüşü zehirden tatlı.",
    class: "Noble",
    color: "#db2777"
  },
  {
    id: 25,
    name: "Matilda'nın Babası",
    image: "images/Matildanin Babasi.png",
    description: "Kızı için her kapıyı kırar, her ejderhayı ezer. Babalık en güçlü büyüdür.",
    class: "Warrior",
    color: "#7c3aed"
  },
  {
    id: 26,
    name: "Taş Gibi Elfler",
    image: "images/Taş gibi 5 elf.png",
    description: "Beş elf, tek bir nefes gibi hareket eder. Ormanda kaybolmuşsalar, sen zaten mahvolmuşsundur.",
    class: "Elf Squad",
    color: "#16a34a"
  },
  {
    id: 27,
    name: "Ted (Sonrası)",
    image: "images/Ted(Ailesini terk ettikten sonra).png",
    description: "Ailesini terk ettikten sonra değişti. Gözlerinde eski sıcaklık yok artık.",
    class: "Wanderer",
    color: "#475569"
  },
  {
    id: 28,
    name: "Usta Jax & Çıraklar",
    image: "images/Usta Jax ve Çirak Max Çirak Dax.png",
    description: "Jax öğretir, Max hızlı öğrenir, Dax her şeyi tersine yapar. Üçü de mükemmel.",
    class: "Artisan Trio",
    color: "#d97706"
  },
  {
    id: 29,
    name: "William'ın Şövalyeleri",
    image: "images/William' in 2 şövalyesi.png",
    description: "Kasabanın koruyucuları. İkisi bir arada oldukça hiçbir tehlike yaklaşamaz.",
    class: "Knights",
    color: "#1d4ed8"
  },
  {
    id: 30,
    name: "Zeyno & Çocuklar",
    image: "images/Zeyno ve 3 cocuk.png",
    description: "Üç çocuğu ile dünyanın dört bir yanını gezer. Neşe onların silahı.",
    class: "Guardian",
    color: "#0891b2"
  },
  {
    id: 31,
    name: "Döldalf (Zindanda)",
    image: "images/döldalf zindanda.png",
    description: "Zindan onu durduramadı. Asasını kaybetmiş ama gücünü kaybetmemiş.",
    class: "Archmage",
    color: "#7e22ce"
  },
  {
    id: 32,
    name: "Ejder Dalgalı",
    image: "images/ejder dalgali.png",
    description: "Dalgalar gibi gelir, ejder gibi vurur. Denizin derinliklerinden yükselen güç.",
    class: "Sea Dragon",
    color: "#0284c7"
  },
  {
    id: 33,
    name: "Kasaba Şefi William",
    image: "images/kasaba şefi william.png",
    description: "Herkesi tanır, her şeyi bilir. Kasabanın ruhu ve vazgeçilmez lideri.",
    class: "Town Chief",
    color: "#92400e"
  },
  {
    id: 34,
    name: "6 Şövalye (Kamp)",
    image: "images/6 Şövalye kamp(Tyrelin dovustugu).png",
    description: "Tyrel'in dövüştüğü o efsanevi kamp gecesi. Altı şövalye, bir ateş, sonsuz hikaye.",
    class: "Warrior Band",
    color: "#b45309"
  },
  {
    id: 35,
    name: "Atlı Şövalyeler",
    image: "images/sokakta 6 tane Atlı şövalye(1. bolum).png",
    description: "Birinci bölümün açılış sahnesi. Sokakları dolduran bu altı süvari masumiyetin sonu oldu.",
    class: "Cavalry",
    color: "#4f46e5"
  }
];

// Link karakter dizisini categories nesnesine bagla
categories.dnd.characters = dndCharacters;

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
  [dom.heroSection(), dom.arenaSection(), dom.championSection()].forEach(el => {
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
    case "lol":
      // İleride: startTournament(lolCharacters); 
      showComingSoonToast(cat.label);
      break;
    case "funny_moments":
      // İleride: startTournament(funnyMomentsData);
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
   SECTION 8: TOURNAMENT ENGINE
   Komut 2 - Turnuva mekaniği
   ===================================================== */

/**
 * startTournament(characters)
 * Verilen karakter dizisiyle turnuvayı başlatır.
 * Turnuva mantığı: Son 8 -> Yarı Final (4) -> Final (2) -> Şampiyon
 */
function startTournament(characters) {
  if (!characters || characters.length < 2) {
    console.error("Turnuva icin en az 2 karakter gerekli!");
    return;
  }

  // State reset
  state.pool = shuffle(characters);
  state.nextPool = [];
  state.currentRound = 0;
  state.matchIndex = 0;
  state.totalMatchesInRound = Math.floor(state.pool.length / 2);
  state.isAnimating = false;

  // Update UI labels
  const cat = state.currentCategory || categories.dnd;
  dom.tournamentCatLabel().textContent = `${cat.icon} ${cat.label}`;
  dom.championAnnouncement().textContent = cat.announcement;

  // Show arena
  showSection(dom.arenaSection());
  updateBracketUI();
  generateVsSparks();

  // Load first match
  loadNextMatch();
}

/**
 * loadNextMatch()
 * Havuzdan bir sonraki eşleşmeyi ekrana getirir.
 * Havuz bitince ya bir sonraki tura geçer ya da şampiyon ilan eder.
 */
function loadNextMatch() {
  // Need at least 2 in pool for a match
  if (state.pool.length < 2) {
    // If we have 1 left (odd number), it's a bye - advance automatically
    if (state.pool.length === 1) {
      state.nextPool.push(state.pool[0]);
      state.pool = [];
    }
    advanceToNextRound();
    return;
  }

  // Pop two characters
  state.leftChar = state.pool.shift();
  state.rightChar = state.pool.shift();

  updateMatchCounter();
  renderCharacters();
}

function renderCharacters() {
  const L = state.leftChar;
  const R = state.rightChar;

  // Reset card states
  [dom.cardLeft(), dom.cardRight()].forEach(card => {
    card.classList.remove("winner", "loser");
    card.style.opacity = "";
    card.style.filter = "";
  });

  // Left card
  dom.imgLeft().src  = L.image || getDefaultImage(L);
  dom.imgLeft().alt  = L.name;
  dom.nameLeft().textContent  = L.name;
  dom.descLeft().textContent  = L.description;
  dom.classLeft().textContent = L.class || "";

  // Right card
  dom.imgRight().src  = R.image || getDefaultImage(R);
  dom.imgRight().alt  = R.name;
  dom.nameRight().textContent  = R.name;
  dom.descRight().textContent  = R.description;
  dom.classRight().textContent = R.class || "";

  // Entrance animation
  [dom.cardLeft(), dom.cardRight()].forEach((card, i) => {
    card.style.animation = "none";
    card.style.transform = `translateX(${i === 0 ? "-40px" : "40px"}) scale(0.92)`;
    card.style.opacity = "0";
    requestAnimationFrame(() => {
      card.style.transition = "transform 0.5s cubic-bezier(.4,0,.2,1), opacity 0.5s ease";
      card.style.transform = "";
      card.style.opacity = "";
    });
  });
}

/** Fallback placeholder when image is missing */
function getDefaultImage(char) {
  // Generate a simple SVG placeholder with the character's color
  const color = encodeURIComponent(char.color || "#8b5cf6");
  const initial = encodeURIComponent(char.name ? char.name[0].toUpperCase() : "?");
  return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><defs><radialGradient id='g' cx='50%25' cy='50%25' r='50%25'><stop offset='0%25' stop-color='${color}' stop-opacity='0.3'/><stop offset='100%25' stop-color='%230f1117'/></radialGradient></defs><rect width='400' height='400' fill='%23131620'/><rect width='400' height='400' fill='url(%23g)'/><text x='200' y='230' text-anchor='middle' dominant-baseline='middle' font-size='120' font-family='serif' fill='${color}' opacity='0.8'>${initial}</text></svg>`;
}

/**
 * vote(side)
 * Kullanıcı sol ("left") veya sağ ("right") karaktere tıkladığında çağrılır.
 */
async function vote(side) {
  if (state.isAnimating) return;
  state.isAnimating = true;

  const winner = side === "left" ? state.leftChar : state.rightChar;
  const loser  = side === "left" ? state.rightChar : state.leftChar;

  const winnerCard = side === "left" ? dom.cardLeft() : dom.cardRight();
  const loserCard  = side === "left" ? dom.cardRight() : dom.cardLeft();

  // Apply visual result
  winnerCard.classList.add("winner");
  loserCard.classList.add("loser");

  // Advance winner
  state.nextPool.push(winner);
  state.matchIndex++;

  // Wait for animation
  await sleep(900);

  // Check if round is over
  if (state.pool.length < 2) {
    if (state.pool.length === 1) {
      state.nextPool.push(state.pool[0]);
      state.pool = [];
    }
    await sleep(200);
    advanceToNextRound();
  } else {
    state.isAnimating = false;
    loadNextMatch();
  }
}

/**
 * advanceToNextRound()
 * Turu ilerletir veya şampiyonu ilan eder.
 */
function advanceToNextRound() {
  // If only one character left -> champion!
  if (state.nextPool.length === 1) {
    revealChampion(state.nextPool[0]);
    return;
  }

  // If 2 or more -> next round
  state.currentRound++;
  state.pool = shuffle(state.nextPool);
  state.nextPool = [];
  state.matchIndex = 0;
  state.totalMatchesInRound = Math.floor(state.pool.length / 2);

  updateBracketUI();
  state.isAnimating = false;
  loadNextMatch();
}

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
   SECTION 12: INIT
   ===================================================== */

function init() {
  setupNavbar();
  setupButtons();
  generateParticles();

  // Show hero section by default
  showSection(dom.heroSection());

  console.log(
    "%cFeroFUFU Tournament System v1.0\n%c🎭 Litvus'un Soytarilari ready!",
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
