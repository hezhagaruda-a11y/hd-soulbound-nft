import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.7.0/+esm";

const BACKEND_URL = "https://humandesignapi-production-5a7b.up.railway.app";
const HD_API_TOKEN = "honey-lattice-2026-ubiquitous-memory-xyz789abc123";

document.getElementById("generateBtn").onclick = async () => {
  const dateInput = document.getElementById("date").value;
  const timeInput = document.getElementById("time").value;
  const place = document.getElementById("place").value;

  if (!dateInput || !timeInput || !place) return alert("Please fill all fields");

  const [year, month, day] = dateInput.split("-");
  const [hour, minute] = timeInput.split(":");

  const btn = document.getElementById("generateBtn");
  btn.disabled = true;
  btn.textContent = "Calculating with neutrinos...";

  try {
    const params = new URLSearchParams({ year, month, day, hour, minute, place: encodeURIComponent(place) });

    const response = await fetch(`${BACKEND_URL}/calculate?${params}`, {
      headers: { "Authorization": `Bearer ${HD_API_TOKEN}` }
    });

    if (!response.ok) throw new Error(await response.text());

    const data = await response.json();

    const imageUrl = `${BACKEND_URL}/bodygraph?${params}&fmt=png`;
    document.getElementById("bodygraph").src = imageUrl;

    const tbody = document.getElementById("hdTable").querySelector("tbody");
    tbody.innerHTML = `
      <tr><td><strong>Energy Type</strong></td><td>${data.general?.energy_type || "—"}</td></tr>
      <tr><td><strong>Strategy</strong></td><td>${data.general?.strategy || "—"}</td></tr>
      <tr><td><strong>Authority</strong></td><td>${data.general?.inner_authority || "—"}</td></tr>
      <tr><td><strong>Profile</strong></td><td>${data.general?.profile || "—"}</td></tr>
      <tr><td><strong>Incarnation Cross</strong></td><td>${data.general?.inc_cross || "—"}</td></tr>
    `;

    document.getElementById("result").style.display = "block";

    window.currentData = data;
    window.currentImageUrl = imageUrl;

  } catch (e) {
    alert("Error: " + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Generate Human Design Chart";
  }
};

// Download buttons
document.getElementById("downloadImageBtn").onclick = () => {
  const a = document.createElement("a");
  a.href = window.currentImageUrl;
  a.download = "human-design-bodygraph.png";
  a.click();
};

document.getElementById("downloadJsonBtn").onclick = () => {
  const dataStr = JSON.stringify(window.currentData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "human-design-blueprint.json";
  a.click();
  URL.revokeObjectURL(url);
};

document.getElementById("mintBtn").onclick = () => alert("✨ Mint as Soulbound NFT ready for next step");