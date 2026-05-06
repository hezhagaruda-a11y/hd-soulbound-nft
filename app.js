// app.js - Human Design Soulbound Blueprint dApp (Rich Dashboard v2)
const BACKEND_URL = "https://humandesignapi-production-5a7b.up.railway.app";
const HD_API_TOKEN = "honey-lattice-2026-ubiquitous-memory-xyz789abc123";

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

    document.getElementById("bodygraph").src = imageUrl;

    // RICH DASHBOARD (adapted to real JSON structure)
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

function renderRichDashboard(data) {
  let html = "";

  // 1. Planetary Activations (Personality + Design)
  if (data.gates) {
    html += `<h3>🌍 Planetary Activations</h3>`;

    // Personality Side
    html += `<details open><summary>Personality Side (Black)</summary><table><thead><tr><th>Planet</th><th>Gate</th><th>Line</th><th>Color</th><th>Tone</th><th>Base</th></tr></thead><tbody>`;
    (data.gates.prs?.Planets || []).forEach(p => {
      html += `<tr><td>${p.Planet}</td><td>${p.Gate}</td><td>${p.Line}</td><td>${p.Color}</td><td>${p.Tone}</td><td>${p.Base}</td></tr>`;
    });
    html += `</tbody></table></details>`;

    // Design Side
    html += `<details open><summary>Design Side (Red)</summary><table><thead><tr><th>Planet</th><th>Gate</th><th>Line</th><th>Color</th><th>Tone</th><th>Base</th></tr></thead><tbody>`;
    (data.gates.des?.Planets || []).forEach(p => {
      html += `<tr><td>${p.Planet}</td><td>${p.Gate}</td><td>${p.Line}</td><td>${p.Color}</td><td>${p.Tone}</td><td>${p.Base}</td></tr>`;
    });
    html += `</tbody></table></details>`;
  }

  // 2. Channels
  if (data.channels?.Channels?.length) {
    html += `<h3>🔗 Channels</h3><ul>`;
    data.channels.Channels.forEach(ch => {
      html += `<li>${ch.channel}</li>`;
    });
    html += `</ul>`;
  }

  // 3. Centers
  if (data.general) {
    html += `<h3>⚪ Centers</h3>`;
    html += `<details open><summary>Defined Centers</summary><ul>`;
    (data.general.defined_centers || []).forEach(c => html += `<li>${c}</li>`);
    html += `</ul></details>`;
    html += `<details open><summary>Undefined / Open Centers</summary><ul>`;
    (data.general.undefined_centers || []).forEach(c => html += `<li>${c}</li>`);
    html += `</ul></details>`;
  }

  // 4. Variables & Arrows
  if (data.general?.variables) {
    html += `<h3>➳ Variables & Arrows</h3><pre>${JSON.stringify(data.general.variables, null, 2)}</pre>`;
  }

  // 5. Full Raw JSON (already working)
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

// Mint button (still placeholder)
document.getElementById("mintBtn").onclick = () => {
  alert("✨ Soulbound NFT minting is ready for the next step!");
};
