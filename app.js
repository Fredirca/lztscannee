const DEFAULT_TERMS = [
  "og renegade raider",
  "renegade raider",
  "og skull trooper",
  "skull trooper",
  "purple skull",
  "og ghoul trooper",
  "ghoul trooper",
  "pink ghoul",
  "og aerial assault",
  "aerial assault trooper",
  "aerial assault",
  "og raiders revenge",
  "raider's revenge",
  "raiders revenge",
  "raider revenge"
];

const STORAGE_KEYS = {
  terms: "fortnite_review_terms_v1",
  cases: "fortnite_review_cases_v1",
  theme: "fortnite_review_theme_v1"
};

const el = (id) => document.getElementById(id);

function loadTerms() {
  const raw = localStorage.getItem(STORAGE_KEYS.terms);
  if (!raw) return [...DEFAULT_TERMS];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...DEFAULT_TERMS];
  } catch {
    return [...DEFAULT_TERMS];
  }
}

function saveTerms(terms) {
  localStorage.setItem(
    STORAGE_KEYS.terms,
    JSON.stringify([...new Set(terms.map(t => t.trim().toLowerCase()).filter(Boolean))])
  );
}

function loadCases() {
  const raw = localStorage.getItem(STORAGE_KEYS.cases);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCases(cases) {
  localStorage.setItem(STORAGE_KEYS.cases, JSON.stringify(cases));
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

function renderWatchlist() {
  const terms = loadTerms();
  const box = el("watchlist");
  box.innerHTML = "";

  for (const term of terms) {
    const chip = document.createElement("span");
    chip.className = "term";
    chip.innerHTML = `${escapeHtml(term)} <button title="Remove">×</button>`;
    chip.querySelector("button").addEventListener("click", () => {
      saveTerms(loadTerms().filter(t => t !== term));
      renderWatchlist();
    });
    box.appendChild(chip);
  }
}

function fieldFromText(text, labels) {
  const lines = text.split(/\r?\n/);
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp("^\\s*" + escaped + "\\s*:\\s*(.+)$", "i");
    for (const line of lines) {
      const match = line.match(rx);
      if (match) return match[1].trim();
    }
  }
  return "";
}

function findUrl(text) {
  const match = text.match(/https?:\/\/(?:www\.)?lzt\.market\/[^\s)]+/i) ||
                text.match(/https?:\/\/[^\s)]+/i);
  return match ? match[0].trim() : "";
}

function findItemId(url) {
  const match = url.match(/lzt\.market\/(\d+)/i);
  return match ? match[1] : "";
}

function matchTerms(text) {
  const haystack = text.toLowerCase();
  return loadTerms().filter(term => haystack.includes(term.toLowerCase()));
}

function inferSkinCount(text) {
  const explicit = fieldFromText(text, ["Skin Count", "Skins", "SkinCount"]);
  if (explicit) return explicit;
  const match = text.match(/\b(\d+)\s*skins?\b/i);
  return match ? match[1] : "";
}

function buildReport(text) {
  const matched = matchTerms(text);
  const url = findUrl(text);
  const itemId = findItemId(url);

  const title =
    fieldFromText(text, ["Title", "Listing Title", "Name"]) ||
    text.split(/\r?\n/).find(line => line.trim().length > 8 && !line.includes(":")) ||
    "Unknown";

  const seller = fieldFromText(text, ["Seller", "Username", "User", "Vendor"]) || "Unknown";
  const price = fieldFromText(text, ["Price", "Listed Price", "Cost"]) || "Unknown";
  const skinCount = inferSkinCount(text) || "Unknown";
  const emailChangeable = fieldFromText(text, ["Email Changeable", "Email", "Change Email"]) || "Unknown";
  const country = fieldFromText(text, ["Country", "Region"]) || "Unknown";
  const lastActivity = fieldFromText(text, ["Last Activity", "Last Login", "Activity"]) || "Unknown";
  const seasonLevel = fieldFromText(text, ["Season Level", "Level", "Account Level"]) || "Unknown";
  const vbucks = fieldFromText(text, ["VB", "V-Bucks", "Vbucks", "VBucks"]) || "Unknown";

  const matchedDisplay = matched.length
    ? matched.map(t => `• ${t}`).join("\n")
    : "• None from current watchlist";

  const report = `🚩 Suspected Fortnite Account-Sale Violation

🏷️ Title: ${title}
👤 Seller: ${seller}
💵 Listed Price: ${price}
🎮 Skin Count: ${skinCount}
💰 V-Bucks: ${vbucks}

⭐ Matched Rare / OG Terms:
${matchedDisplay}

📧 Email Changeable: ${emailChangeable}
🔢 Level / Season Level: ${seasonLevel}
🌍 Country: ${country}
⏱️ Last Activity: ${lastActivity}

🆔 LZT Item ID: ${itemId || "Unknown"}
🔗 Listing URL: ${url || "Unknown"}

Evidence notes:
This report was generated from pasted listing text. Save the original page, screenshots, timestamps, and raw listing text separately if needed.

Review action:
Review evidence, preserve source material, and submit through the appropriate enforcement/takedown process.`;

  return {
    createdAt: new Date().toISOString(),
    title,
    seller,
    price,
    skinCount,
    emailChangeable,
    country,
    lastActivity,
    seasonLevel,
    vbucks,
    itemId,
    url,
    matched,
    sourceText: text,
    report
  };
}

let currentCase = null;

function scan() {
  const text = el("listingInput").value.trim();
  if (!text) {
    el("reportOutput").textContent = "Paste listing text first.";
    el("matchBadge").textContent = "No input";
    el("matchBadge").className = "badge warn";
    return;
  }

  currentCase = buildReport(text);
  el("reportOutput").textContent = currentCase.report;

  if (currentCase.matched.length) {
    el("matchBadge").textContent = `${currentCase.matched.length} watchlist match(es)`;
    el("matchBadge").className = "badge ok";
  } else {
    el("matchBadge").textContent = "No watchlist match";
    el("matchBadge").className = "badge warn";
  }
}

async function copyReport() {
  const text = el("reportOutput").textContent;
  await navigator.clipboard.writeText(text);
  el("copyReportBtn").textContent = "Copied";
  setTimeout(() => el("copyReportBtn").textContent = "Copy Report", 900);
}

function saveCurrentCase() {
  if (!currentCase) scan();
  if (!currentCase) return;

  const cases = loadCases();
  cases.unshift(currentCase);
  saveCases(cases.slice(0, 250));
  renderCases();
}

function renderCases() {
  const cases = loadCases();
  const box = el("cases");

  if (!cases.length) {
    box.innerHTML = `<p>No saved cases yet.</p>`;
    return;
  }

  box.innerHTML = cases.slice(0, 25).map((c, idx) => `
    <div class="case">
      <strong>${escapeHtml(c.title || "Untitled case")}</strong>
      <div>Matched: <code>${escapeHtml((c.matched || []).join(", ") || "none")}</code></div>
      <div>Seller: ${escapeHtml(c.seller || "Unknown")} · Price: ${escapeHtml(c.price || "Unknown")} · Country: ${escapeHtml(c.country || "Unknown")}</div>
      <div>URL: ${c.url ? `<a href="${escapeHtml(c.url)}" target="_blank" rel="noreferrer">${escapeHtml(c.url)}</a>` : "Unknown"}</div>
      <div>Saved: ${escapeHtml(c.createdAt || "")}</div>
      <div class="actions">
        <button class="secondary small" onclick="loadCase(${idx})">Load</button>
        <button class="danger small" onclick="deleteCase(${idx})">Delete</button>
      </div>
    </div>
  `).join("");
}

function loadCase(idx) {
  const cases = loadCases();
  const c = cases[idx];
  if (!c) return;
  currentCase = c;
  el("listingInput").value = c.sourceText || "";
  el("reportOutput").textContent = c.report || "";
  el("matchBadge").textContent = `${(c.matched || []).length} watchlist match(es)`;
  el("matchBadge").className = (c.matched || []).length ? "badge ok" : "badge warn";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteCase(idx) {
  const cases = loadCases();
  cases.splice(idx, 1);
  saveCases(cases);
  renderCases();
}

window.loadCase = loadCase;
window.deleteCase = deleteCase;

function download(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportJson() {
  download("fortnite-review-cases.json", JSON.stringify(loadCases(), null, 2), "application/json");
}

function csvCell(value) {
  const s = String(value ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

function exportCsv() {
  const cases = loadCases();
  const headers = ["createdAt", "title", "seller", "price", "skinCount", "emailChangeable", "country", "lastActivity", "seasonLevel", "vbucks", "itemId", "url", "matched"];
  const rows = [
    headers.join(","),
    ...cases.map(c => headers.map(h => csvCell(h === "matched" ? (c.matched || []).join("; ") : c[h])).join(","))
  ];
  download("fortnite-review-cases.csv", rows.join("\n"), "text/csv");
}

function applyTheme() {
  const theme = localStorage.getItem(STORAGE_KEYS.theme);
  document.body.classList.toggle("light", theme === "light");
}

function toggleTheme() {
  const light = !document.body.classList.contains("light");
  localStorage.setItem(STORAGE_KEYS.theme, light ? "light" : "dark");
  applyTheme();
}

function bindEvents() {
  el("scanBtn").addEventListener("click", scan);
  el("copyReportBtn").addEventListener("click", copyReport);
  el("saveCaseBtn").addEventListener("click", saveCurrentCase);

  el("clearInput").addEventListener("click", () => {
    el("listingInput").value = "";
  });

  el("addTermBtn").addEventListener("click", () => {
    const term = el("newTerm").value.trim().toLowerCase();
    if (!term) return;
    saveTerms([...loadTerms(), term]);
    el("newTerm").value = "";
    renderWatchlist();
  });

  el("newTerm").addEventListener("keydown", (e) => {
    if (e.key === "Enter") el("addTermBtn").click();
  });

  el("resetWatchlist").addEventListener("click", () => {
    saveTerms(DEFAULT_TERMS);
    renderWatchlist();
  });

  el("exportJsonBtn").addEventListener("click", exportJson);
  el("exportCsvBtn").addEventListener("click", exportCsv);

  el("clearCasesBtn").addEventListener("click", () => {
    if (confirm("Clear all saved cases from this browser?")) {
      saveCases([]);
      renderCases();
    }
  });

  el("themeToggle").addEventListener("click", toggleTheme);
}

applyTheme();
renderWatchlist();
renderCases();
bindEvents();
