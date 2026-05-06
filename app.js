// app.js - Human Design Soulbound Blueprint dApp (Rich Dashboard Version)
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
    // 1. Get full blueprint data
    const res = await fetch(`${BACKEND_URL}/calculate?${params}`, {
      headers: { "Authorization": `Bearer ${HD_API_TOKEN}` }
    });
    if (!res.ok) throw new Error("Failed to calculate chart");
    const data = await res.json();

    // 2. Get BodyGraph image
    const imgRes = await fetch(`${BACKEND_URL}/bodygraph?${params}`, {
      headers: { "Authorization": `Bearer ${HD_API_TOKEN}` }
    });
    if (!imgRes.ok) throw new Error("Failed to load BodyGraph");
    const imageBlob = await imgRes.blob();
    const imageUrl = URL.createObjectURL(imageBlob);

    // Populate basic table
    const tbody = document.querySelector("#hdTable tbody");
    tbody.innerHTML = `
      <tr><td><strong>Energy Type</strong></td><td>${data.general?.energy_type || "—"}</td></tr>
      <tr><td><strong>Strategy</strong></td><td>${data.general?.strategy || "—"}</td></tr>
      <tr><td><strong>Authority</strong></td><td>${data.general?.inner_authority || "—"}</td></tr>
      <tr><td><strong>Profile</strong></td><td>${data.general?.profile || "—"}</td></tr>
      <tr><td><strong>Incarnation Cross</strong></td><td>${data.general?.inc_cross || "—"}</td></tr>
    `;

    // Show BodyGraph
    document.getElementById("bodygraph").src = imageUrl;

    // === RICH DASHBOARD SECTIONS ===
    renderRichDashboard(data);

    document.getElementById("result").style.display = "block";
    window.currentData = data;
    window.currentImageUrl = imageUrl;

    console.log("✅ Full rich blueprint loaded");
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

  // 1. Planetary Activations
  if (data.planets) {
    html += `<h3>🌍 Planetary Activations</h3>`;
    html += `<details open><summary>Personality Side</summary><table><thead><tr><th>Planet</th><th>Gate</th><th>Line</th><th>Color</th><th>Tone</th><th>Base</th></tr></thead><tbody>`;
    Object.entries(data.planets.personality || {}).forEach(([planet, p]) => {
      html += `<tr><td>${planet}</td><td>${p.gate || "—"}</td><td>${p.line || "—"}</td><td>${p.color || "—"}</td><td>${p.tone || "—"}</td><td>${p.base || "—"}</td></tr>`;
    });
    html += `</tbody></table></details>`;

    html += `<details open><summary>Design Side</summary><table><thead><tr><th>Planet</th><th>Gate</th><th>Line</th><th>Color</th><th>Tone</th><th>Base</th></tr></thead><tbody>`;
    Object.entries(data.planets.design || {}).forEach(([planet, p]) => {
      html += `<tr><td>${planet}</td><td>${p.gate || "—"}</td><td>${p.line || "—"}</td><td>${p.color || "—"}</td><td>${p.tone || "—"}</td><td>${p.base || "—"}</td></tr>`;
    });
    html += `</tbody></table></details>`;
  }

  // 2. Channels
  if (data.channels && data.channels.length) {
    html += `<h3>🔗 Channels</h3><ul>`;
    data.channels.forEach(ch => html += `<li>${ch}</li>`);
    html += `</ul>`;
  }

  // 3. Centers
  if (data.centers) {
    html += `<h3>⚪ Centers</h3><details open><summary>Defined</summary><ul>`;
    (data.centers.defined || []).forEach(c => html += `<li>${c}</li>`);
    html += `</ul></details><details open><summary>Undefined / Open</summary><ul>`;
    (data.centers.undefined || []).forEach(c => html += `<li>${c}</li>`);
    html += `</ul></details>`;
  }

  // 4. Variables / Arrows
  if (data.variables) {
    html += `<h3>➳ Variables & Arrows</h3><pre>${JSON.stringify(data.variables, null, 2)}</pre>`;
  }

  // 5. Raw Full JSON (for power users)
  html += `<h3>📋 Full Raw JSON</h3><details><summary>View complete data</summary><pre>${JSON.stringify(data, null, 2)}</pre></details>`;

  document.getElementById("richDashboard").innerHTML = html;
}

// Downloads (unchanged)
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

// Mint placeholder
document.getElementById("mintBtn").onclick = () => {
  alert("✨ Soulbound NFT minting is ready for the next step — everything else is now fully working!");
};
