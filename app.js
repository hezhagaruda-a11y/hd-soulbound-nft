// app.js - CSP-SAFE VERSION - Human Design Soulbound Blueprint
console.log("✅ CSP-SAFE app.js loaded successfully - version 2026-05-07");

const BACKEND_URL = "https://humandesignapi-production-5a7b.up.railway.app";
const HD_API_TOKEN = "honey-lattice-2026-ubiquitous-memory-xyz789abc123";

const planetSymbols = {
  Sun: "☉", Earth: "⊕", Moon: "☽", North_Node: "☊", South_Node: "☋",
  Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃",
  Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇"
};

console.log("✅ Constants and planet symbols ready");

document.getElementById("generateBtn").onclick = async () => {
  console.log("🟢 Generate button clicked");

  const btn = document.getElementById("generateBtn");
  btn.disabled = true;
  btn.textContent = "Generating... 🌌";

  const dateInput = document.getElementById("birthDate").value;
  const timeInput = document.getElementById("birthTime").value;
  const place = document.getElementById("birthPlace").value.trim() || "Sulaymaniyah";

  const [year, month, day] = dateInput.split("-");
  const [hour, minute] = timeInput.split(":");

  const params = new URLSearchParams({ year, month, day, hour, minute, place });

  try {
    const res = await fetch(`${BACKEND_URL}/calculate?${params}`, {
      headers: { "Authorization": `Bearer ${HD_API_TOKEN}` }
    });
    if (!res.ok) throw new Error(`Calculate failed: ${res.status}`);
    const data = await res.json();

    const imgRes = await fetch(`${BACKEND_URL}/bodygraph?${params}`, {
      headers: { "Authorization": `Bearer ${HD_API_TOKEN}` }
    });
    if (!imgRes.ok) throw new Error(`Bodygraph failed: ${imgRes.status}`);
    const imageBlob = await imgRes.blob();
    const imageUrl = URL.createObjectURL(imageBlob);

    // Fill summary table
    const tbody = document.querySelector("#hdTable tbody");
    tbody.innerHTML = `
      <tr><td><strong>Energy Type</strong></td><td>${data.general?.energy_type || "—"}</td></tr>
      <tr><td><strong>Strategy</strong></td><td>${data.general?.strategy || "—"}</td></tr>
      <tr><td><strong>Authority</strong></td><td>${data.general?.inner_authority || "—"}</td></tr>
      <tr><td><strong>Profile</strong></td><td>${data.general?.profile || "—"}</td></tr>
      <tr><td><strong>Incarnation Cross</strong></td><td>${data.general?.inc_cross || "—"}</td></tr>
    `;

    document.getElementById("bodygraph").src = imageUrl;

    renderCompactPlanetarySides(data);
    render6LevelDashboard(data);

    document.getElementById("result").style.display = "block";
    window.currentData = data;
    window.currentImageUrl = imageUrl;

    console.log("🎉 Full dashboard rendered successfully!");

  } catch (e) {
    console.error("🚨 ERROR:", e);
    alert("Error: " + e.message + "\n\nOpen F12 → Console and send me everything red");
  } finally {
    btn.disabled = false;
    btn.textContent = "Generate Human Design Chart";
  }
};

function renderCompactPlanetarySides(data) {
  let leftHTML = `<h3 style="color:#ff6666; margin-bottom:20px;">DESIGN</h3>`;
  let rightHTML = `<h3 style="color:#6666ff; margin-bottom:20px;">PERSONALITY</h3>`;

  const createRow = (p, isDesign) => {
    const sym = planetSymbols[p.Planet] || "⚪";
    const activation = `${p.Gate}.${p.Line}`;
    const ctbHTML = `C${p.Color} • T${p.Tone} • B${p.Base}`;

    if (isDesign) {
      return `<div class="planet-row" data-ctb="${ctbHTML}">
                <button class="small-plus">+</button>
                <span class="activation">${activation}</span>
                <span class="symbol">${sym}</span>
                <div class="ctb-info" style="display:none;">${ctbHTML}</div>
              </div>`;
    } else {
      return `<div class="planet-row" data-ctb="${ctbHTML}">
                <span class="symbol">${sym}</span>
                <span class="activation">${activation}</span>
                <button class="small-plus">+</button>
                <div class="ctb-info" style="display:none;">${ctbHTML}</div>
              </div>`;
    }
  };

  (data.gates?.des?.Planets || []).forEach(p => leftHTML += createRow(p, true));
  (data.gates?.prs?.Planets || []).forEach(p => rightHTML += createRow(p, false));

  const containerHTML = `
    <div style="display:flex; gap:24px; align-items:flex-start;">
      <div style="flex:1;">${leftHTML}</div>
      <div style="flex:1;">${rightHTML}</div>
    </div>
  `;

  const planetaryContainer = document.getElementById("planetarySides");
  planetaryContainer.innerHTML = containerHTML;

  // Event delegation - completely CSP safe
  planetaryContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('small-plus')) {
      const row = e.target.closest('.planet-row');
      const ctb = row.querySelector('.ctb-info');
      const isHidden = ctb.style.display === 'none';
      ctb.style.display = isHidden ? 'block' : 'none';
      e.target.textContent = isHidden ? '–' : '+';
    }
  });
}

function render6LevelDashboard(data) {
  const pentaGates = [15,5,46,29,14,2,1,8,7,31,13,33];
  let html = `
    <div class="level-card"><div class="level-header">Line 1 — Foundation</div><div>Planetary activations shown above</div></div>
    <div class="level-card"><div class="level-header">Line 2 — Defined Centers</div><div>Defined: ${(data.general?.defined_centers || []).join(", ")}</div></div>
    <div class="level-card"><div class="level-header">Line 3 — Open Centers</div><div>Open: ${(data.general?.undefined_centers || []).join(", ")}</div></div>
    <div class="level-card"><div class="level-header">Line 4 — Channels & Circuitry</div><ul>${(data.channels?.Channels || []).map(ch => `<li>${ch.channel}</li>`).join("")}</ul></div>
    <div class="level-card"><div class="level-header">Line 5 — Penta Gate Score</div><div>Penta gates present: ${pentaGates.filter(g => (data.gates?.prs?.Planets || []).some(p => p.Gate === g) || (data.gates?.des?.Planets || []).some(p => p.Gate === g)).join(", ") || "None"}</div></div>
    <div class="level-card"><div class="level-header">Line 6 — Higher Purpose & NFT Utility</div><div><strong>Incarnation Cross Role:</strong> ${data.general?.inc_cross || "—"}<br><strong>Soulbound NFT:</strong> Ready to mint<br><em>This blueprint is yours forever.</em></div></div>
  `;
  document.getElementById("dashboardLevels").innerHTML = html;
};

// Download buttons
document.getElementById("downloadImageBtn").onclick = () => {
  if (!window.currentImageUrl) return alert("Generate chart first");
  const a = document.createElement("a");
  a.href = window.currentImageUrl;
  a.download = "human-design-bodygraph.png";
  a.click();
};

document.getElementById("downloadJsonBtn").onclick = () => {
  if (!window.currentData) return alert("Generate chart first");
  const dataStr = JSON.stringify(window.currentData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "human-design-blueprint.json";
  a.click();
  URL.revokeObjectURL(url);
};

document.getElementById("mintBtn").onclick = () => {
  alert("✨ Soulbound NFT minting is ready for the next step!");
};
