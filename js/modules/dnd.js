/* =====================================================
   FeroFUFU – js/modules/dnd.js
   DnD Tournament Engine – Litvus'un Soytarilari
   (Komut 3 – script.js'den ayrıştırıldı)
   ===================================================== */

/* =====================================================
   DnD CHARACTER DATA – Litvus'un Soytarilari
   Gorseller: images/ klasorunden yuklendi (35 PNG karakter)
   ===================================================== */
const DEFAULT_DND_CHARACTERS = [
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

const DND_KEY = "ferofufu_dnd";

let dndCharacters = (function() {
  try {
    const raw = localStorage.getItem(DND_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("[DnD] localStorage okuma hatası:", e);
  }
  return DEFAULT_DND_CHARACTERS;
})();

function getDndCharacters() {
  if (window.FeroDB && typeof window.FeroDB.getItems === "function") {
    const cloudChars = window.FeroDB.getItems("dnd", []);
    if (cloudChars.length > 0) return cloudChars;
  }
  return dndCharacters;
}

function saveDndCharacters(chars) {
  try {
    if (window.FeroDB && typeof window.FeroDB.saveCollection === "function") {
      window.FeroDB.saveCollection("dnd", chars);
    } else if (window.feroMedia && typeof window.feroMedia.safeSave === 'function') {
      window.feroMedia.safeSave(DND_KEY, JSON.stringify(chars));
    } else {
      localStorage.setItem(DND_KEY, JSON.stringify(chars));
    }
    dndCharacters = chars;
    if (typeof categories !== "undefined" && categories.dnd) {
      categories.dnd.characters = chars;
    }
  } catch (e) {
    console.warn("[DnD] localStorage yazma hatası:", e);
  }
}

// Canlı bulut güncellemelerini dinle
window.addEventListener("ferofufu_cloud_update", function(e) {
  if (e.detail && e.detail.collection === "dnd") {
    dndCharacters = e.detail.items;
    if (typeof categories !== "undefined" && categories.dnd) {
      categories.dnd.characters = e.detail.items;
    }
  }
});

/* =====================================================
   TOURNAMENT ENGINE
   ===================================================== */

/**
 * startTournament(characters)
 * Verilen karakter dizisiyle turnuvayı başlatır.
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
 */
function loadNextMatch() {
  if (state.pool.length === 0 && state.nextPool.length === 0) {
    console.error("[DnD] Turnuva havuzu boş!");
    state.isAnimating = false;
    return;
  }

  if (state.pool.length < 2) {
    if (state.pool.length === 1) {
      state.nextPool.push(state.pool[0]);
      state.pool = [];
    }
    advanceToNextRound();
    return;
  }

  state.leftChar  = state.pool.shift();
  state.rightChar = state.pool.shift();

  updateMatchCounter();
  renderCharacters();
}

function renderCharacters() {
  const L = state.leftChar;
  const R = state.rightChar;

  [dom.cardLeft(), dom.cardRight()].forEach(card => {
    card.classList.remove("winner", "loser");
    card.style.opacity = "";
    card.style.filter  = "";
  });

  dom.imgLeft().src            = L.image || getDefaultImage(L);
  dom.imgLeft().alt            = L.name;
  dom.nameLeft().textContent   = L.name;
  dom.descLeft().textContent   = L.description;
  dom.classLeft().textContent  = L.class || "";

  dom.imgRight().src           = R.image || getDefaultImage(R);
  dom.imgRight().alt           = R.name;
  dom.nameRight().textContent  = R.name;
  dom.descRight().textContent  = R.description;
  dom.classRight().textContent = R.class || "";

  [dom.cardLeft(), dom.cardRight()].forEach((card, i) => {
    card.style.animation = "none";
    card.style.transform = `translateX(${i === 0 ? "-40px" : "40px"}) scale(0.92)`;
    card.style.opacity   = "0";
    requestAnimationFrame(() => {
      card.style.transition = "transform 0.5s cubic-bezier(.4,0,.2,1), opacity 0.5s ease";
      card.style.transform  = "";
      card.style.opacity    = "";
    });
  });
}

/** Fallback placeholder when image is missing */
function getDefaultImage(char) {
  if (!char) char = {};
  const color   = encodeURIComponent(char.color || "#8b5cf6");
  const initial = encodeURIComponent(char.name ? char.name[0].toUpperCase() : "?");
  return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><defs><radialGradient id='g' cx='50%' cy='50%' r='50%'><stop offset='0%' stop-color='${color}' stop-opacity='0.3'/><stop offset='100%' stop-color='%230f1117'/></radialGradient></defs><rect width='400' height='400' fill='%23131620'/><rect width='400' height='400' fill='url(%23g)'/><text x='200' y='230' text-anchor='middle' dominant-baseline='middle' font-size='120' font-family='serif' fill='${color}' opacity='0.8'>${initial}</text></svg>`;
}

/**
 * vote(side) – Kullanıcı oy kullandığında çağrılır.
 */
async function vote(side) {
  if (state.isAnimating) return;
  state.isAnimating = true;
  const safetyTimer = setTimeout(() => { state.isAnimating = false; }, 5000);

  try {
    const winner = side === "left" ? state.leftChar  : state.rightChar;
    const winnerCard = side === "left" ? dom.cardLeft()  : dom.cardRight();
    const loserCard  = side === "left" ? dom.cardRight() : dom.cardLeft();

    winnerCard.classList.add("winner");
    loserCard.classList.add("loser");

    state.nextPool.push(winner);
    state.matchIndex++;

    await sleep(900);

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
  } catch (err) {
    console.error('[DnD] Vote error:', err);
    state.isAnimating = false;
  } finally {
    clearTimeout(safetyTimer);
  }
}

/**
 * advanceToNextRound() – Turu ilerletir veya şampiyonu ilan eder.
 */
function advanceToNextRound() {
  if (state.nextPool.length === 1) {
    revealChampion(state.nextPool[0]);
    return;
  }

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
   BRACKET & PROGRESS UI
   ===================================================== */

function updateBracketUI() {
  const roundName = state.roundNames[state.currentRound] || "Tur " + (state.currentRound + 1);
  dom.roundTitle().textContent = roundName;

  const subtitles = [
    "Kim daha sevimli? 👇",
    "Sadece 4 kaldi! Kim gidecek?",
    "Buyuk Final! En iyisi kim?",
  ];
  dom.roundSubtitle().textContent = subtitles[state.currentRound] || "Devam et!";

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
  const total   = state.totalMatchesInRound;
  const current = state.matchIndex + 1;
  const label   = state.roundNames[state.currentRound] || "Tur";

  dom.matchCountText().textContent = `${label} – Mac ${current} / ${total}`;

  const pct = total > 0 ? (state.matchIndex / total) * 100 : 0;
  dom.progressFill().style.width = pct + "%";
  dom.progressFill().parentElement.setAttribute("aria-valuenow", pct);
}

/* =====================================================
   CHAMPION REVEAL
   ===================================================== */

function revealChampion(champion) {
  dom.championImg().src              = champion.image || getDefaultImage(champion);
  dom.championImg().alt              = champion.name;
  dom.championName().textContent     = champion.name;
  dom.championDesc().textContent     = champion.description;
  dom.championClass().textContent    = champion.class || "";

  showSection(dom.championSection());
  generateConfetti();
}
