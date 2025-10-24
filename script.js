// Default class list
let names = [
  "Eunice","Danikah","Japdeep","Katelyn","Emerson","Hayley","Benjamin","Dalia","Lena",
  "Maninder","Serena","Laila","Eron","Connor","Kiel","Noah","Beckett","Zlata",
  "Zakhar","Acacia","Zack","Eileen","Joshua","Steve","Jordyn","Danika"
];

// Gentle exclusion list
let gentleExclusions = ["Eron", "Emerson", "Acacia", "Maninder"];

// State
let pool = [...names];
let gentleMode = false;
let noRepeats = true;  // toggled by button (and N key)

const nameDisplay = document.getElementById("name-display");
const resetBtn = document.getElementById("reset");
const toggleRepeatsBtn = document.getElementById("toggle-repeats");
const editor = document.getElementById("editor");
const namesInput = document.getElementById("names-input");
const gentleInput = document.getElementById("gentle-input");
const saveBtn = document.getElementById("save");
const gentleIndicator = document.getElementById("gentle-indicator");

function animateFlip() {
  nameDisplay.classList.remove("flip");
  // Force reflow so the animation can restart
  // eslint-disable-next-line no-unused-expressions
  nameDisplay.offsetWidth;
  nameDisplay.classList.add("flip");
}

function pick() {
  // Base source (repeats vs bag)
  let base = noRepeats ? pool : names.slice();
  // Apply gentle filter if needed
  if (gentleMode) base = base.filter(n => !gentleExclusions.includes(n));

  if (!base.length) {
    nameDisplay.textContent = "Reset to start again";
    return;
  }

  const i = Math.floor(Math.random() * base.length);
  const chosen = base[i];
  nameDisplay.textContent = chosen;
  animateFlip();

  // Remove from bag only if no-repeats
  if (noRepeats) {
    const realIndex = pool.indexOf(chosen);
    if (realIndex !== -1) pool.splice(realIndex, 1);
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
}

function toggleNoRepeats() {
  noRepeats = !noRepeats;
  applyNoRepeatsUI();
}

function saveLists() {
  names = namesInput.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  gentleExclusions = gentleInput.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  reset();
  editor.classList.add("hidden");
}

// Init UI
applyNoRepeatsUI();

// Events
resetBtn.onclick = (e) => { e.stopPropagation(); reset(); };
toggleRepeatsBtn.onclick = (e) => { e.stopPropagation(); toggleNoRepeats(); };
saveBtn.onclick = (e) => { e.stopPropagation(); saveLists(); };

document.body.addEventListener("keydown", e => {
  const isTyping = e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT";
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

// Click anywhere to pick (ignore clicks on UI)
document.body.addEventListener("click", e => {
  const blocked =
    editor.contains(e.target) ||
    e.target === resetBtn ||
    e.target === toggleRepeatsBtn ||
    e.target === saveBtn;
  if (!blocked) pick();
});
