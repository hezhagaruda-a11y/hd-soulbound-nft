// app.js - DEBUG VERSION - Human Design Soulbound Blueprint
console.log("✅ app.js loaded successfully - version 2026-05-06 debug");

const BACKEND_URL = "https://humandesignapi-production-5a7b.up.railway.app";
const HD_API_TOKEN = "honey-lattice-2026-ubiquitous-memory-xyz789abc123";

const planetSymbols = {
  Sun: "☉", Earth: "⊕", Moon: "☽", North_Node: "☊", South_Node: "☋",
  Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃",
  Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇"
};

console.log("✅ Planet symbols and constants ready");

document.getElementById("generateBtn").onclick = async () => {
  console.log("🟢 Button clicked - starting generation");

  const btn = document.getElementById("generateBtn");
  btn.disabled = true;
  btn.textContent = "Generating... 🌌";

  const dateInput = document.getElementById("birthDate").value;
  const timeInput = document.getElementById("birthTime").value;
  const place = document.getElementById("birthPlace").value.trim() || "Sulaymaniyah";

  const [year, month, day] = dateInput.split("-");
  const [hour, minute] = timeInput.split(":");

  const params = new URLSearchParams({ year, month, day, hour, minute, place });
  console.log("📡 Fetching with params:", params.toString());

  try {
    console.log("📡 Calling /calculate...");
    const res = await fetch(`${BACKEND_URL}/calculate?${params}`, {
      headers: { "Authorization": `Bearer ${HD_API_TOKEN}` }
    });
    console.log("📡 /calculate response status:", res.status);

    if (!res.ok) throw new Error(`Calculate failed: ${res.status}`);
    const data = await res.json();
    console.log("✅ Full chart data received");

    console.log("📡 Calling /bodygraph...");
    const imgRes = await fetch(`${BACKEND_URL}/bodygraph?${params}`, {
      headers: { "Authorization": `Bearer ${HD_API_TOKEN}` }
    });
    console.log("📡 /bodygraph response status:", imgRes.status);

    if (!imgRes.ok) throw new Error(`Bodygraph failed: ${imgRes.status}`);
    const imageBlob = await imgRes.blob();
    const imageUrl = URL.createObjectURL(imageBlob);
    console.log("✅ BodyGraph image ready");

    // Fill table
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
    console.error("🚨 CRITICAL ERROR:", e);
    alert("Error: " + e.message + "\n\nCheck console (F12) for details.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Generate Human Design Chart";
  }
};

function renderCompactPlanetarySides(data) { /* same as before */ }
function render6LevelDashboard(data) { /* same as before */ }

// Download buttons (same as before)
document.getElementById("downloadImageBtn").onclick = () => { /* ... */ };
document.getElementById("downloadJsonBtn").onclick = () => { /* ... */ };
document.getElementById("mintBtn").onclick = () => { alert("✨ Soulbound NFT minting is ready for the next step!"); };
