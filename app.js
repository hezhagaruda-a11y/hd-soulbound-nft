// app.js - Human Design Soulbound Blueprint dApp (Clean Compact Planetary Display)
const BACKEND_URL = "https://humandesignapi-production-5a7b.up.railway.app";
const HD_API_TOKEN = "honey-lattice-2026-ubiquitous-memory-xyz789abc123";

const planetSymbols = {
  Sun: "☉", Earth: "⊕", Moon: "☽", North_Node: "☊", South_Node: "☋",
  Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃",
  Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇"
};

document.getElementById("generateBtn").onclick = async () => {
  const btn = document.getElementById("generateBtn");
  btn.disabled = true;
  btn.textContent = "Generating...";

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
    if (!res.ok) throw new Error("Failed to calculate chart");
    const data = await res.json();

    const imgRes = await fetch(`${BACKEND_URL}/bodygraph?${params}`, {
      headers: { "Authorization": `Bearer ${HD_API_TOKEN}` }
    });
    if (!imgRes.ok) throw new Error("Failed to load BodyGraph");
    const imageBlob = await imgRes.blob();
    const imageUrl = URL.createObjectURL(imageBlob);

    // Basic table
    const tbody = document.querySelector("#hdTable tbody");
    tbody.innerHTML = `
      <tr><td><strong>Energy Type</strong></td><td>${data.general?.energy_type || "—"}</td></tr>
      <tr><td><strong>Strategy</strong></td><td>${data.general?.strategy || "—"}</td></tr>
      <tr><td><strong>Authority</strong></td><td>${data.general?.inner_authority || "—"}</td></tr>
      <tr><td><strong>Profile</strong></td><td>${data.general?.profile || "—"}</td></tr>
      <tr><td><strong>Incarnation Cross</strong></td><td>${data.general?.inc_cross || "—"}</td></tr>
    `;

    renderCompactPlanetarySides(data, imageUrl);
    renderRichDashboard(data);

    document.getElementById("result").style.display = "block";
    window.currentData = data;
    window.currentImageUrl = imageUrl;

  } catch (e) {
    console.error(e);
    alert("Error: " + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Generate Human Design Chart";
  }
};

function renderCompactPlanetarySides(data, imageUrl) {
  let leftHTML = `<h3 style="color:#ff6666; margin-bottom:24px;">DESIGN</h3>`;
  let rightHTML = `<h3 style="color:#6666ff; margin-bottom:24px;">PERSONALITY</h3>`;

  const createRow = (p, side) => {
    const sym = planetSymbols[p.Planet] || "⚪";
    return `
      <div class="planet-row" style="display:flex; align-items:center; gap:12px; padding:10px 14px; background:rgba(255,255,255,0.05); border-radius:14px; margin-bottom:8px;">
        <span class="symbol" style="font-size:28px; width:36px;">${sym}</span>
        <strong style="min-width:110px;">${p.Planet}</strong>
        <span class="activation" style="font-size:1.1rem;">${p.Gate}.${p.Line}</span>
        <button class="small-plus" onclick="this.parentElement.classList.toggle('expanded'); event.stopImmediatePropagation();" 
                style="margin-left:auto; background:none; border:none; font-size:24px; width:28px; height:28px; line-height:24px; cursor:pointer;">+</button>
        <div class="ctb-info" style="display:none; margin-left:8px; font-size:0.95rem; color:#aaa;">
          C${p.Color} • T${p.Tone} • B${p.Base}
        </div>
      </div>`;
  };

  (data.gates?.des?.Planets || []).forEach(p => leftHTML += createRow(p));
  (data.gates?.prs?.Planets || []).forEach(p => rightHTML += createRow(p));

  document.getElementById("planetarySides").innerHTML = `
    <div style="display:flex; gap:40px; align-items:flex-start;">
      <div style="flex:1;">${leftHTML}</div>
      <div style="flex:2; text-align:center;">
        <img src="${imageUrl}" alt="BodyGraph" style="max-width:100%; border-radius:24px; background:#111; padding:20px; box-shadow:0 20px 40px rgba(0,0,0,0.7);">
      </div>
      <div style="flex:1;">${rightHTML}</div>
    </div>
  `;
}

function renderRichDashboard(data) {
  let html = "";

  if (data.channels?.Channels?.length) {
    html += `<h3>🔗 Channels</h3><ul>`;
    data.channels.Channels.forEach(ch => html += `<li>${ch.channel}</li>`);
    html += `</ul>`;
  }

  if (data.general) {
    html += `<h3>⚪ Centers</h3>
      <details open><summary>Defined Centers</summary><ul>`;
    (data.general.defined_centers || []).forEach(c => html += `<li>${c}</li>`);
    html += `</ul></details>
      <details open><summary>Undefined / Open Centers</summary><ul>`;
    (data.general.undefined_centers || []).forEach(c => html += `<li>${c}</li>`);
    html += `</ul></details>`;
  }

  if (data.general?.variables) {
    html += `<h3>➳ Variables & Arrows</h3><pre>${JSON.stringify(data.general.variables, null, 2)}</pre>`;
  }

  html += `<h3>📋 Full Raw JSON</h3><details><summary>View complete data</summary><pre>${JSON.stringify(data, null, 2)}</pre></details>`;

  document.getElementById("richDashboard").innerHTML = html;
}

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
