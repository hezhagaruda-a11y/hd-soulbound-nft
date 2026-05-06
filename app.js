// app.js - Human Design Soulbound Blueprint dApp (Visual Planetary Sides - Fixed)
const BACKEND_URL = "https://humandesignapi-production-5a7b.up.railway.app";
const HD_API_TOKEN = "honey-lattice-2026-ubiquitous-memory-xyz789abc123";

const planetSymbols = {
  Sun: "☉", Moon: "☽", North_Node: "☊", South_Node: "☋",
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

    // Basic info table
    const tbody = document.querySelector("#hdTable tbody");
    tbody.innerHTML = `
      <tr><td><strong>Energy Type</strong></td><td>${data.general?.energy_type || "—"}</td></tr>
      <tr><td><strong>Strategy</strong></td><td>${data.general?.strategy || "—"}</td></tr>
      <tr><td><strong>Authority</strong></td><td>${data.general?.inner_authority || "—"}</td></tr>
      <tr><td><strong>Profile</strong></td><td>${data.general?.profile || "—"}</td></tr>
      <tr><td><strong>Incarnation Cross</strong></td><td>${data.general?.inc_cross || "—"}</td></tr>
    `;

    // Render the visual planetary sides layout (with BodyGraph in center)
    renderPlanetarySides(data, imageUrl);

    // Render the rich expandable sections below
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

function renderPlanetarySides(data, imageUrl) {
  let leftHTML = `<h3 style="color:#ff6666">Design Side (Red)</h3>`;
  let rightHTML = `<h3 style="color:#6666ff">Personality Side (Black)</h3>`;

  // Design side (left)
  (data.gates?.des?.Planets || []).forEach(p => {
    const sym = planetSymbols[p.Planet] || "⚪";
    leftHTML += `<div style="display:flex; align-items:center; gap:8px; margin:8px 0; font-size:15px;">
      <span style="font-size:22px;">${sym}</span>
      <strong>${p.Planet}</strong>
      <span>Gate ${p.Gate} • Line ${p.Line} • C${p.Color} T${p.Tone} B${p.Base}</span>
    </div>`;
  });

  // Personality side (right)
  (data.gates?.prs?.Planets || []).forEach(p => {
    const sym = planetSymbols[p.Planet] || "⚪";
    rightHTML += `<div style="display:flex; align-items:center; gap:8px; margin:8px 0; font-size:15px;">
      <span style="font-size:22px;">${sym}</span>
      <strong>${p.Planet}</strong>
      <span>Gate ${p.Gate} • Line ${p.Line} • C${p.Color} T${p.Tone} B${p.Base}</span>
    </div>`;
  });

  // Build the full side-by-side layout with BodyGraph in the center
  document.getElementById("planetarySides").innerHTML = `
    <div style="display:flex; gap:30px; align-items:flex-start; margin:30px 0;">
      <div style="flex:1;">${leftHTML}</div>
      <div style="flex:2; text-align:center;">
        <img src="${imageUrl}" alt="BodyGraph" style="max-width:100%; border-radius:16px; background:#111; padding:10px;">
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
