// ==========================================
// script.js — Finance RDC Pro v2.7
// ==========================================

// ── 1. FIREBASE ───────────────────────────────────────────────
import { initializeApp }    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyDr7swsZsXBJ72x7FpMXHA6YMN-76H43ZI",
  authDomain:        "mon-site-chat.firebaseapp.com",
  projectId:         "mon-site-chat",
  storageBucket:     "mon-site-chat.firebasestorage.app",
  messagingSenderId: "408362473343",
  appId:             "1:408362473343:web:afa7ad876b271e4bf5ec4a"
};

const app   = initializeApp(firebaseConfig);
const db    = getFirestore(app);
const colRef = collection(db, "commentaires");

// Envoi d'un commentaire
document.getElementById("btnFirebase").addEventListener("click", async () => {
  const btn = document.getElementById("btnFirebase");
  const nom = document.getElementById("userName").value.trim() || "Anonyme";
  const com = document.getElementById("userComment").value.trim();
  if (!com) return;

  btn.disabled = true;
  btn.textContent = "Publication…";
  try {
    await addDoc(colRef, { nom, message: com, date: serverTimestamp() });
    document.getElementById("userComment").value = "";
  } catch (e) {
    console.error("Erreur Firebase :", e);
    alert("❌ Impossible de publier. Vérifiez votre connexion.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Publier mon avis ✈️";
  }
});

// Lecture en temps réel
onSnapshot(query(colRef, orderBy("date", "desc")), (snap) => {
  const display = document.getElementById("listeDisplay");
  display.innerHTML = "";
  if (snap.empty) {
    display.innerHTML = `<p class="text-muted small text-center py-2">Soyez le premier à laisser un avis !</p>`;
    return;
  }
  snap.docs.slice(0, 20).forEach(doc => {
    const d = doc.data();
    const nom = escapeHtml(d.nom || "Anonyme");
    const msg = escapeHtml(d.message || "");
    const date = d.date?.toDate ? d.date.toDate().toLocaleDateString("fr-FR") : "";
    display.innerHTML += `
      <article class="comment-item" role="article">
        <div class="d-flex justify-content-between align-items-baseline">
          <b>${nom}</b>
          <span class="text-muted" style="font-size:0.72rem;">${date}</span>
        </div>
        <span class="d-block mt-1">${msg}</span>
      </article>`;
  });
});

// ── 2. THÈME ──────────────────────────────────────────────────
window.toggleTheme = function () {
  const current  = document.documentElement.getAttribute("data-bs-theme");
  const newTheme = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-bs-theme", newTheme);
  localStorage.setItem("financeRDC_theme", newTheme);
  document.getElementById("themeToggle").textContent = newTheme === "dark" ? "☀️" : "🌙";
  if (window._chart) actualisThemeChart(newTheme);
};

// Appliquer l'icône correcte au chargement
const _initTheme = localStorage.getItem("financeRDC_theme") || "light";
document.getElementById("themeToggle").textContent = _initTheme === "dark" ? "☀️" : "🌙";

function actualisThemeChart(theme) {
  const gridColor = theme === "dark" ? "#1e293b" : "#e2e8f0";
  const tickColor = theme === "dark" ? "#64748b" : "#94a3b8";
  window._chart.options.scales.x.grid.color = gridColor;
  window._chart.options.scales.y.grid.color = gridColor;
  window._chart.options.scales.x.ticks.color = tickColor;
  window._chart.options.scales.y.ticks.color = tickColor;
  window._chart.update();
}

// ── 3. PREMIUM ────────────────────────────────────────────────
const MON_CODE_PRO = "L1SI-2026";
const WA_NUMERO    = "243842317817";

let bsModal;
window.addEventListener("DOMContentLoaded", () => {
  bsModal = new bootstrap.Modal(document.getElementById("premiumBootstrapModal"));
});

window.ouvrirModal  = () => bsModal.show();
window.fermerModal  = () => bsModal.hide();

function activerPremiumUI(showAlert) {
  document.getElementById("premiumFeatures").style.display = "block";
  document.getElementById("btnStatus").style.display = "none";
  localStorage.setItem("financeRDC_premium", "true");
  if (showAlert) showToast("✅ Mode Premium activé avec succès !", "success");
}

window.verifierCode = function () {
  const code = document.getElementById("licenseCode").value.trim().toUpperCase();
  const err  = document.getElementById("licenseError");
  if (code === MON_CODE_PRO) {
    activerPremiumUI(true);
    bsModal.hide();
    document.getElementById("licenseCode").value = "";
    err.textContent = "";
  } else {
    err.textContent = "❌ Code incorrect. Contactez-nous sur WhatsApp.";
    document.getElementById("licenseCode").classList.add("is-invalid");
    setTimeout(() => {
      document.getElementById("licenseCode").classList.remove("is-invalid");
    }, 2000);
  }
};

// Activer aussi avec Entrée dans le champ code
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("licenseCode")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") window.verifierCode();
  });
});

window.verrouillerPremium = function () {
  if (confirm("Désactiver le mode Premium sur cet appareil ?")) {
    localStorage.removeItem("financeRDC_premium");
    location.reload();
  }
};

window.ouvrirPaiementDirect = function () {
  const msg = "Bonjour Exaucé, je souhaite acheter mon code Premium Finance RDC Pro (1 $).";
  window.open(`https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(msg)}`, "_blank");
};

window.partagerPourBonus = function () {
  const text = "📲 Suis le taux du dollar en temps réel avec Finance RDC Pro ! Gratuit : " + window.location.href;
  if (navigator.share) {
    navigator.share({ title: "Finance RDC Pro", text, url: window.location.href }).catch(() => {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    });
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }
};

window.toggleAbout = function () {
  const s = document.getElementById("aboutSection");
  const isVisible = s.style.display === "block";
  s.style.display = isVisible ? "none" : "block";
  document.querySelector("[aria-controls='aboutSection']")
    ?.setAttribute("aria-expanded", String(!isVisible));
};

// ── 4. SPLASH ─────────────────────────────────────────────────
window.fermerSplash = function () {
  const splash = document.getElementById("autoSplash");
  if (!splash) return;
  splash.classList.add("fading");
  setTimeout(() => { splash.style.display = "none"; }, 650);
};
setTimeout(fermerSplash, 2400);

// ── 5. TAUX & CALCULS ─────────────────────────────────────────
window.tauxBanques = [
  { nom: "Marché Central", taux: 2850 },
  { nom: "Rawbank",        taux: 2835 },
  { nom: "Equity BCDC",   taux: 2840 },
  { nom: "TMB",           taux: 2825 },
  { nom: "Ecobank",       taux: 2845 }
];

const CACHE_KEY_TAUX  = "financeRDC_taux";
const CACHE_KEY_DATE  = "financeRDC_tauxDate";
const CACHE_DUREE_MS  = 15 * 60 * 1000; // 15 minutes

async function chargerTauxReels() {
  const dateUpdate = document.getElementById("dateUpdate");

  // Vérifier cache local (évite appels répétés)
  try {
    const cachedDate = localStorage.getItem(CACHE_KEY_DATE);
    const cachedTaux = localStorage.getItem(CACHE_KEY_TAUX);
    if (cachedDate && cachedTaux && (Date.now() - parseInt(cachedDate)) < CACHE_DUREE_MS) {
      const ref = parseInt(cachedTaux);
      _appliquerTaux(ref);
      const d = new Date(parseInt(cachedDate));
      dateUpdate.innerHTML = `✅ Taux du ${d.toLocaleDateString("fr-FR")} à ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} <span style="opacity:0.6">(cache)</span>`;
      _finChargement();
      return;
    }
  } catch (_) {}

  // Appel API
  try {
    const res  = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const ref  = Math.round(data.rates.CDF);

    // Sauvegarder en cache
    localStorage.setItem(CACHE_KEY_TAUX, String(ref));
    localStorage.setItem(CACHE_KEY_DATE, String(Date.now()));

    _appliquerTaux(ref);
    const now = new Date();
    dateUpdate.innerHTML = `✅ Taux en direct — ${now.toLocaleDateString("fr-FR")} à ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  } catch (e) {
    console.warn("API taux indisponible, taux locaux utilisés :", e);
    dateUpdate.innerHTML = `⚠️ Taux de repli — connexion indisponible`;
  }

  _finChargement();
}

function _appliquerTaux(ref) {
  window.tauxBanques[0].taux = ref;
  window.tauxBanques[1].taux = ref - 15;
  window.tauxBanques[2].taux = ref - 10;
  window.tauxBanques[3].taux = ref - 25;
  window.tauxBanques[4].taux = ref - 5;
}

function _finChargement() {
  calculerTout();
  if (localStorage.getItem("financeRDC_premium") === "true") activerPremiumUI(false);
  // Lire le paramètre URL pour pré-sélectionner la direction
  const params = new URLSearchParams(window.location.search);
  const dir = params.get("dir");
  if (dir === "CDF_USD" || dir === "USD_CDF") {
    document.getElementById("direction").value = dir;
    calculerTout();
  }
}

// ── 6. MOTEURS DE CALCUL ──────────────────────────────────────
window.calculerTout = function () {
  const m    = parseFloat(document.getElementById("montant").value) || 0;
  const dir  = document.getElementById("direction").value;
  const tRef = window.tauxBanques[0].taux;

  const final = dir === "CDF_USD"
    ? (m / tRef).toFixed(2) + " $"
    : Math.round(m * tRef).toLocaleString("fr-FR") + " FC";

  document.getElementById("resultat-principal").textContent = final;

  // Partage WhatsApp
  const monnaieSource = dir === "CDF_USD" ? "FC" : "$";
  const textWA = `Finance RDC Pro 🇨🇩\n${m.toLocaleString("fr-FR")} ${monnaieSource} = ${final}\nTaux Marché Central : ${tRef} FC/$\n${window.location.href}`;
  document.getElementById("shareWA").href = `https://wa.me/?text=${encodeURIComponent(textWA)}`;

  // Tableau des banques
  const tbody = document.getElementById("tableBanques");
  tbody.innerHTML = "";
  window.tauxBanques.forEach(b => {
    const conv = dir === "CDF_USD"
      ? (m / b.taux).toFixed(2) + " $"
      : Math.round(m * b.taux).toLocaleString("fr-FR") + " FC";
    tbody.innerHTML += `
      <tr>
        <td class="text-start fw-medium py-2">${b.nom}</td>
        <td class="taux-value py-2 text-center">${b.taux}</td>
        <td class="text-secondary text-end py-2">${conv}</td>
      </tr>`;
  });

  genererGraphique();
  calculerRenduMixte();
};

window.calculerRenduMixte = function () {
  const prixUSD    = parseFloat(document.getElementById("mixtePrixArticle").value) || 0;
  const donneUSD   = parseFloat(document.getElementById("mixteDonneUSD").value)    || 0;
  const donneCDF   = parseFloat(document.getElementById("mixteDonneCDF").value)    || 0;
  const taux       = window.tauxBanques[0].taux;
  if (taux <= 0) return;

  const totalUSD  = donneUSD + donneCDF / taux;
  const resteUSD  = totalUSD - prixUSD;

  const card  = document.getElementById("mixteStatutCard");
  const label = document.getElementById("mixteResultatLabel");
  const divFC = document.getElementById("mixteResultatFC");
  const divUS = document.getElementById("mixteResultatUSD");

  card.className = "p-3 rounded-3 text-start mt-2 border";

  if (resteUSD < -0.001) {
    const manqueFC = Math.round(Math.abs(resteUSD) * taux);
    card.classList.add("bg-danger-subtle", "border-danger");
    label.className = "small fw-bold mb-1 text-danger";
    label.textContent = "⚠️ Le client doit encore payer :";
    divFC.className = "fw-bold text-danger fs-4";
    divFC.textContent = manqueFC.toLocaleString("fr-FR") + " FC";
    divUS.className = "text-danger small";
    divUS.textContent = "soit " + Math.abs(resteUSD).toFixed(2) + " $";
  } else if (Math.abs(resteUSD) <= 0.001) {
    card.classList.add("bg-body-secondary", "border-secondary");
    label.className = "small mb-1 text-secondary";
    label.textContent = "✅ Compte juste :";
    divFC.className = "fw-bold text-secondary fs-5";
    divFC.textContent = "Pas de monnaie à rendre";
    divUS.className = "text-muted small";
    divUS.textContent = "0.00 $";
  } else {
    const resteFC = Math.round(resteUSD * taux);
    card.classList.add("bg-success-subtle", "border-success");
    label.className = "small fw-bold mb-1 text-success";
    label.textContent = "💰 Monnaie à rendre au client :";
    divFC.className = "fw-bold text-success fs-4";
    divFC.textContent = resteFC.toLocaleString("fr-FR") + " FC";
    divUS.className = "text-success small";
    divUS.textContent = "soit " + resteUSD.toFixed(2) + " $";
  }
};

window.calculerCompta = function () {
  const achat = parseFloat(document.getElementById("achatUSD").value) || 0;
  const vente = parseFloat(document.getElementById("venteCDF").value) || 0;
  const taux  = window.tauxBanques[0].taux;
  const ben   = Math.round(vente - achat * taux);
  const el    = document.getElementById("resultMarge");
  el.style.color = ben >= 0 ? "#059669" : "#dc2626";
  el.textContent  = (ben >= 0 ? "Bénéfice : " : "Perte : ") + Math.abs(ben).toLocaleString("fr-FR") + " FC";
};

window.calculerStock = function () {
  const q = parseFloat(document.getElementById("stockQty").value)  || 0;
  const p = parseFloat(document.getElementById("unitPrice").value) || 0;
  document.getElementById("resultStock").textContent =
    "Total Stock : " + (q * p).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $";
};

window.calculerInflation = function () {
  const px   = parseFloat(document.getElementById("prixActuel").value) || 0;
  const tf   = parseFloat(document.getElementById("tauxFutur").value)  || 0;
  const tRef = window.tauxBanques[0].taux;
  if (tRef > 0 && tf > 0) {
    const res = Math.round((px / tRef) * tf);
    const hausse = res - px;
    document.getElementById("resultInflation").textContent =
      "Nouveau prix : " + res.toLocaleString("fr-FR") + " FC"
      + (hausse > 0 ? " (+" + hausse.toLocaleString("fr-FR") + " FC)" : "");
  }
};

window.calculerFrais = function () {
  const m     = parseFloat(document.getElementById("montantRetrait").value) || 0;
  const frais = m <= 10000 ? 800 : Math.round(m * 0.03);
  document.getElementById("resultFrais").textContent =
    "Frais estimés : " + frais.toLocaleString("fr-FR") + " FC";
};

// ── 7. GRAPHIQUE ──────────────────────────────────────────────
window._chart = undefined;

function genererGraphique() {
  const ctx     = document.getElementById("monGraphique").getContext("2d");
  const isDark  = document.documentElement.getAttribute("data-bs-theme") === "dark";
  const gridColor = isDark ? "#1e293b" : "#e2e8f0";
  const tickColor = isDark ? "#64748b" : "#94a3b8";

  if (window._chart) window._chart.destroy();

  window._chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: window.tauxBanques.map(b => b.nom),
      datasets: [{
        label: "Taux (FC/$)",
        data:  window.tauxBanques.map(b => b.taux),
        backgroundColor: ["#1d4ed8", "#059669", "#d97706", "#dc2626", "#7c3aed"],
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400, easing: "easeOutQuart" },
      scales: {
        y: {
          min: Math.min(...window.tauxBanques.map(b => b.taux)) - 35,
          max: Math.max(...window.tauxBanques.map(b => b.taux)) + 10,
          grid:  { color: gridColor },
          ticks: { color: tickColor, font: { size: 11 } }
        },
        x: {
          grid:  { display: false },
          ticks: { color: tickColor, font: { size: 10 } }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? "#1e293b" : "#0f172a",
          padding: 10,
          cornerRadius: 10,
          titleFont: { size: 12 },
          bodyFont:  { size: 13, weight: "bold" },
          callbacks: {
            label: (ctx) => ` ${ctx.raw} FC / $`
          }
        }
      }
    }
  });
}

// ── 8. UTILITAIRES ────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message, type = "info") {
  // Toast bootstrap léger
  const toastEl = document.createElement("div");
  toastEl.className = `alert alert-${type === "success" ? "success" : "info"} position-fixed shadow`;
  toastEl.style.cssText = "bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;min-width:260px;text-align:center;border-radius:14px;font-weight:600;";
  toastEl.textContent = message;
  document.body.appendChild(toastEl);
  setTimeout(() => toastEl.remove(), 3000);
}

// ── 9. DÉMARRAGE ──────────────────────────────────────────────
window.addEventListener("load", chargerTauxReels);
