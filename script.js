// ---------- Data ----------
let names = [
  "EUNICE","DANIKAH","JAPDEEP","KATELYN","EMERSON","HAYLEY","BENJAMIN","DALIA","LENA",
  "MANINDER","SERENA","LAILA","ERON","CONNOR","KIEL","NOAH","BECKETT","ZLATA",
  "ZAKHAR","ACACIA","ZACK","EILEEN","JOSHUA","STEVE","JORDYN","DANIKA"
];
// Gentle exclusion list
let gentleExclusions = ["ERON","EMERSON","ACACIA","MANINDER"];

// ---------- State ----------
let pool = [...names];        // bag when no-repeats is ON
let gentleMode = false;       // toggled with G
let noRepeats = true;         // toggled with button & N

// ---------- DOM ----------
const stage = document.getElementById("main");
const nameDisplay = document.getElementById("name-display");
const resetBtn = document.getElementById("reset");
const toggleRepeatsBtn = document.getElementById("toggle-repeats");
const editor = document.getElementById("editor");
const namesInput = document.getElementById("names-input");
const gentleInput = document.getElementById("gentle-input");
const saveBtn = document.getElementById("save");
const gentleIndicator = document.getElementById("gentle-indicator");

// ---------- Animation ----------
function animateFlip() {
  nameDisplay.classList.remove("flip");
  void nameDisplay.offsetWidth; // restart CSS animation
  nameDisplay.classList.add("flip");
}

// ---------- Core logic ----------
function pick() {
  // Choose pool depending on repeat mode
  let base = noRepeats ? pool : names.slice();
  // Apply gentle filter
  if (gentleMode) base = base.filter(n => !gentleExclusions.includes(n));

  if (!base.length) {
    nameDisplay.textContent = "Reset to start again";
    return;
  }

  const i = Math.floor(Math.random() * base.length);
  const chosen = base[i];
  nameDisplay.textContent = chosen;
  animateFlip();

  if (noRepeats) {
    const idx = pool.indexOf(chosen);
    if (idx !== -1) pool.splice(idx, 1);
  }
}

function reset() {
  pool = [...names];
  nameDisplay.textContent = "Click or press SPACE";
}

function toggleGentle() {
  gentleMode = !gentleMode;
  gentleIndicator.classList.toggle("on", gentleMode);
}

function applyNoRepeatsUI() {
  toggleRepeatsBtn.setAttribute("aria-pressed", String(noRepeats));
  toggleRepeatsBtn.textContent = noRepeats ? "NO REPEATS" : "REPEATS ALLOWED";
  // tiny tactile feedback
  toggleRepeatsBtn.style.transform = "scale(0.96)";
  setTimeout(() => (toggleRepeatsBtn.style.transform = ""), 90);
}

function toggleNoRepeats() {
  noRepeats = !noRepeats;
  applyNoRepeatsUI();
}

function saveLists() {
  // Store as ALL CAPS to match display & filters
  names = namesInput.value
    .split(/[\n,]/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.toUpperCase());

  gentleExclusions = gentleInput.value
    .split(/[\n,]/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.toUpperCase());

  reset();
  editor.classList.add("hidden");
}

// ---------- Init ----------
applyNoRepeatsUI();
reset(); // ensures initial prompt text

// ---------- Events ----------

// Click-to-pick only on the stage (safe zones: header/footer/editor)
stage.addEventListener("click", () => pick());

// Buttons (don’t bubble into stage)
resetBtn.addEventListener("click", e => { e.stopPropagation(); reset(); });
toggleRepeatsBtn.addEventListener("click", e => { e.stopPropagation(); toggleNoRepeats(); });
saveBtn.addEventListener("click", e => { e.stopPropagation(); saveLists(); });

// Editor clicks don’t pick
editor.addEventListener("click", e => e.stopPropagation());

// Keyboard
document.addEventListener("keydown", e => {
  const isTyping = ["TEXTAREA", "INPUT"].includes(e.target.tagName);
  if (e.key === " " && !isTyping) { e.preventDefault(); pick(); }
  if (e.key.toLowerCase() === "e") {
    editor.classList.toggle("hidden");
    if (!editor.classList.contains("hidden")) {
      // load editable lists (as entered, not forced caps)
      namesInput.value = names.join("\n");
      gentleInput.value = gentleExclusions.join("\n");
    }
  }
  if (e.key.toLowerCase() === "g" && !isTyping) toggleGentle();
  if (e.key.toLowerCase() === "n" && !isTyping) toggleNoRepeats();
  if (e.key.toLowerCase() === "r" && !isTyping) reset();
});
