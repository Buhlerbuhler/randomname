// Default class list (ALL CAPS)
let names = [
  "EUNICE","DANIKAH","JAPDEEP","KATELYN","EMERSON","HAYLEY","BENJAMIN","DALIA","LENA",
  "MANINDER","SERENA","LAILA","ERON","CONNOR","KIEL","NOAH","BECKETT","ZLATA",
  "ZAKHAR","ACACIA","ZACK","EILEEN","JOSHUA","STEVE","JORDYN","DANIKA"
];

// Gentle exclusion list
let gentleExclusions = ["ERON","EMERSON","ACACIA","MANINDER"];

// State
let pool = [...names];
let gentleMode = false;
let noRepeats = true;

// Elements
const stage = document.getElementById("main");
const nameDisplay = document.getElementById("name-display");
const resetBtn = document.getElementById("reset");
const editor = document.getElementById("editor");
const namesInput = document.getElementById("names-input");
const gentleInput = document.getElementById("gentle-input");
const saveBtn = document.getElementById("save");
const gentleIndicator = document.getElementById("gentle-indicator");

// Animation
function animateFlip() {
  nameDisplay.classList.remove("flip");
  void nameDisplay.offsetWidth;
  nameDisplay.classList.add("flip");
}

// Pick name
function pick() {
  let base = noRepeats ? pool : names.slice();
  if (gentleMode) base = base.filter(n => !gentleExclusions.includes(n));
  if (!base.length) { nameDisplay.textContent = "Reset to start again"; return; }

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

function toggleNoRepeats() {
  noRepeats = !noRepeats;
}

function saveLists() {
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

// Init
reset();

// Events
stage.addEventListener("click", pick);
resetBtn.addEventListener("click", e => { e.stopPropagation(); reset(); });
saveBtn.addEventListener("click", e => { e.stopPropagation(); saveLists(); });
editor.addEventListener("click", e => e.stopPropagation());

document.addEventListener("keydown", e => {
  const isTyping = ["TEXTAREA","INPUT"].includes(e.target.tagName);
  if (e.key === " " && !isTyping) { e.preventDefault(); pick(); }
  if (e.key.toLowerCase() === "e") {
    editor.classList.toggle("hidden");
    if (!editor.classList.contains("hidden")) {
      namesInput.value = names.join("\n");
      gentleInput.value = gentleExclusions.join("\n");
    }
  }
  if (e.key.toLowerCase() === "g" && !isTyping) toggleGentle();
  if (e.key.toLowerCase() === "n" && !isTyping) toggleNoRepeats();
  if (e.key.toLowerCase() === "r" && !isTyping) reset();
});
