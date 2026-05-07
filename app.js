// app.js - Design Control Dashboard (Multi-Entry Ready)
const BACKEND_URL = "https://humandesignapi-production-5a7b.up.railway.app";
const HD_API_TOKEN = "honey-lattice-2026-ubiquitous-memory-xyz789abc123";

let savedDesigns = JSON.parse(localStorage.getItem("hdDesigns")) || [];
let currentData = null;

const planetSymbols = { Sun: "☉", Earth: "⊕", Moon: "☽", North_Node: "☊", South_Node: "☋", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇" };

document.getElementById("generateBtn").onclick = async () => { /* ... same generation code as before ... */ };

function renderCompactPlanetarySides(data) { /* same as previous version */ }
function render6LevelDashboard(data) { /* same as previous version */ }

// Save to dashboard
document.getElementById("saveToDashboardBtn").onclick = () => {
  if (!currentData) return;
  const name = prompt("Give this design a name (e.g. 'Team Lead - Sarah')", currentData.general?.energy_type || "New Design");
  savedDesigns.push({ id: Date.now(), name: name || "Untitled", data: currentData });
  localStorage.setItem("hdDesigns", JSON.stringify(savedDesigns));
  renderLibrary();
  alert("✅ Saved to Design Control Dashboard");
};

function renderLibrary() {
  const panel = document.getElementById("libraryPanel");
  panel.innerHTML = savedDesigns.length ? 
    savedDesigns.map(d => `
      <div class="design-card">
        <strong>${d.name}</strong><br>
        ${d.data.general?.energy_type} • ${d.data.general?.profile} • ${d.data.general?.inner_authority}
        <button onclick="viewDesign(${d.id})">View Full Blueprint</button>
      </div>`).join('') : "<p>No designs saved yet. Generate and save one above.</p>";
}

function viewDesign(id) {
  const design = savedDesigns.find(d => d.id === id);
  if (!design) return;
  currentData = design.data;
  // Re-render the full single blueprint view
  document.getElementById("result").style.display = "block";
  // (You can expand this to show full view in modal if desired)
  renderCompactPlanetarySides(currentData);
  render6LevelDashboard(currentData);
}

function renderCompatibility() {
  // Simple group Penta example
  const panel = document.getElementById("compatibilityPanel");
  panel.innerHTML = `<p>Group Penta & Compatibility analysis coming in next refinement (based on all saved designs).</p>`;
}

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById("libraryPanel").style.display = tab.dataset.tab === "library" ? "block" : "none";
    document.getElementById("compatibilityPanel").style.display = tab.dataset.tab === "compatibility" ? "block" : "none";
    document.getElementById("categorizePanel").style.display = tab.dataset.tab === "categorize" ? "block" : "none";
  };
});

renderLibrary();
