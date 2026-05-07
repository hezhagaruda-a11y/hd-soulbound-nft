// app.js - Complete Design Control Dashboard + Soulbound NFT Mint
const BACKEND_URL = "https://humandesignapi-production-5a7b.up.railway.app";
const HD_API_TOKEN = "honey-lattice-2026-ubiquitous-memory-xyz789abc123";
const CONTRACT_ADDRESS = "0xB22Ae982F93482bE75691b7A9d98dc236A709E69";

let savedDesigns = JSON.parse(localStorage.getItem("hdDesigns")) || [];
let currentData = null;

const planetSymbols = {
  Sun: "☉", Earth: "⊕", Moon: "☽", North_Node: "☊", South_Node: "☋",
  Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄",
  Uranus: "♅", Neptune: "♆", Pluto: "♇"
};

// ====================== GENERATE CHART ======================
document.getElementById("generateBtn").onclick = async () => {
  const btn = document.getElementById("generateBtn");
  btn.disabled = true;
  btn.textContent = "Generating...";

  const [year, month, day] = document.getElementById("birthDate").value.split("-");
  const [hour, minute] = document.getElementById("birthTime").value.split(":");
  const place = document.getElementById("birthPlace").value || "Sulaymaniyah";

  const params = new URLSearchParams({ year, month, day, hour, minute, place });

  try {
    const calcRes = await fetch(`${BACKEND_URL}/calculate?${params}`, {
      headers: { "Authorization": `Bearer ${HD_API_TOKEN}` }
    });
    const data = await calcRes.json();

    const imgRes = await fetch(`${BACKEND_URL}/bodygraph?${params}`, {
      headers: { "Authorization": `Bearer ${HD_API_TOKEN}` }
    });
    const blob = await imgRes.blob();
    document.getElementById("bodygraph").src = URL.createObjectURL(blob);

    // Summary table
    const tbody = document.querySelector("#hdTable tbody");
    tbody.innerHTML = `
      <tr><td><strong>Energy Type</strong></td><td>${data.general?.energy_type || "—"}</td></tr>
      <tr><td><strong>Strategy</strong></td><td>${data.general?.strategy || "—"}</td></tr>
      <tr><td><strong>Authority</strong></td><td>${data.general?.inner_authority || "—"}</td></tr>
      <tr><td><strong>Profile</strong></td><td>${data.general?.profile || "—"}</td></tr>
      <tr><td><strong>Incarnation Cross</strong></td><td>${data.general?.inc_cross || "—"}</td></tr>
    `;

    currentData = data;
    document.getElementById("result").style.display = "block";

    // Render planetary sides + dashboard (you can expand these later)
    renderCompactPlanetarySides(data);
    render6LevelDashboard(data);

  } catch (e) {
    alert("Error: " + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Generate Human Design Chart";
  }
};

// ====================== MINT SOULBOUND NFT ======================
document.getElementById("mintSoulboundBtn").onclick = async () => {
  if (!currentData) return alert("Generate a chart first!");

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(CONTRACT_ADDRESS, [
      "function mint(address to, string uri) public"
    ], signer);

    const metadata = {
      name: "Soulbound Human Design Blueprint",
      description: "Permanent, non-transferable Human Design chart",
      image: "https://via.placeholder.com/600x600/111111/00ffaa?text=HD+Blueprint",
      attributes: currentData.general
    };
    const uri = "data:application/json;base64," + btoa(JSON.stringify(metadata));

    const tx = await contract.mint(await signer.getAddress(), uri);
    await tx.wait();

    alert(`✅ Soulbound NFT minted successfully!\n\nTx hash: ${tx.hash}\n\nYour Human Design Blueprint is now permanently on-chain and soulbound to your wallet.`);
  } catch (e) {
    console.error(e);
    alert("Mint failed: " + (e.message || e));
  }
};

// ====================== SAVE + LIBRARY ======================
document.getElementById("saveToDashboardBtn").onclick = () => {
  if (!currentData) return;
  const name = prompt("Give this design a name", currentData.general?.energy_type || "New Design");
  savedDesigns.push({ id: Date.now(), name: name || "Untitled", data: currentData });
  localStorage.setItem("hdDesigns", JSON.stringify(savedDesigns));
  renderLibrary();
  alert("✅ Saved to Design Control Dashboard");
};

function renderLibrary() {
  const panel = document.getElementById("libraryPanel");
  panel.innerHTML = savedDesigns.length 
    ? savedDesigns.map(d => `
      <div class="design-card">
        <strong>${d.name}</strong><br>
        ${d.data.general?.energy_type} • ${d.data.general?.profile}
        <button onclick="viewDesign(${d.id})">View Full Blueprint</button>
      </div>`).join('')
    : "<p>No designs saved yet. Generate one above and save it.</p>";
}

window.viewDesign = function(id) {
  const design = savedDesigns.find(d => d.id === id);
  if (!design) return;
  currentData = design.data;
  document.getElementById("result").style.display = "block";
  renderCompactPlanetarySides(currentData);
  render6LevelDashboard(currentData);
};

function renderCompactPlanetarySides(data) { /* add your previous planetary rendering code here if you want it */ }
function render6LevelDashboard(data) { /* add your previous 6-level dashboard code here if you want it */ }

// Tab switching (already in your code)
document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById("libraryPanel").style.display = tab.dataset.tab === "library" ? "block" : "none";
    document.getElementById("compatibilityPanel").style.display = tab.dataset.tab === "compatibility" ? "block" : "none";
  };
});

renderLibrary();
