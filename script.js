// Default class list (from your project)
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
let noRepeats = true; // <-- N toggles this

// Elements
const nameDisplay = document.getElementById("name-display");
const resetBtn = document.getElementById("reset");
const editor = document.getElementById("editor");
const namesInput = document.getElementById("names-input");
const gentleInput = document.getElementById("gentle-input");
const saveBtn = document.getElementById("save");
const gentleIndicator = document.getElementById("gentle-indicator");

// Core logic
function pick() {
  // Choose base source by repeats mode
  let base = noRepeats ? pool : names.slice();

  // Apply Gentle filter if needed
  if (gentleMode) base = base.filter(n => !gentleExclusions.includes(n));

  // Guard: if empty, message
  if (!base.length) {
    nameDisplay.textContent = "Reset to start again";
    return;
  }

  // Choose and display
  const i = Math.floor(Math.random() * base.length);
  const chosen = base[i];
  nameDisplay.textContent = chosen;
  nameDisplay.classList.add("pop");
  setTimeout(() => nameDisplay.classList.remove("pop"), 150);

  // Remove from bag only in no-repeats mode
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

function toggleNoRepeats() {
  noRepeats = !noRepeats;
  // When switching back to no-repeats, rebuild the bag from remaining names
  if (noRepeats) {
    // keep the current pool as-is (already shrunk)
  } else {
    // repeats mode: nothing to maintain
  }
}

function saveLists() {
  names = namesInput.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  gentleExclusions = gentleInput.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  reset();
  editor.classList.add("hidden");
}

// Events
resetBtn.onclick = reset;
saveBtn.onclick = saveLists;

document.body.addEventListener("keydown", e => {
  // Avoid typing inside textareas triggering picks
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
  if (e.key.toLowerCase() === "n" && !isTyping) toggleNoRepeats();  // <-- repeats toggle
  if (e.key.toLowerCase() === "r" && !isTyping) reset();
});

// Click anywhere to pick (except editor/reset)
document.body.addEventListener("click", e => {
  const clickInsideEditor = editor.contains(e.target);
  const isReset = e.target === resetBtn;
  if (!clickInsideEditor && !isReset) pick();
});
