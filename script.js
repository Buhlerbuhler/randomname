const defaultNames = [
  "Aiden", "Bella", "Carlos", "Dina", "Eli", "Farah",
  "Gabe", "Hannah", "Isaac", "Jasmin", "Kai", "Leah", "Maya", "Noah"
];
let names = [...defaultNames];
let pool = [...names];
let gentleList = [];
let gentleMode = false;

const nameDisplay = document.getElementById("name-display");
const pickBtn = document.getElementById("pick");
const editBtn = document.getElementById("edit");
const gentleBtn = document.getElementById("gentle");
const resetBtn = document.getElementById("reset");
const editor = document.getElementById("editor");
const namesInput = document.getElementById("names-input");
const gentleInput = document.getElementById("gentle-input");
const saveBtn = document.getElementById("save");

function pick() {
  let source = pool;
  if (gentleMode) {
    const filtered = source.filter(n => !gentleList.includes(n));
    if (filtered.length) source = filtered;
  }
  if (!source.length) {
    nameDisplay.textContent = "Reset needed!";
    return;
  }
  const index = Math.floor(Math.random() * source.length);
  const chosen = source[index];
  nameDisplay.textContent = chosen;
  pool.splice(index, 1);
}

function reset() {
  pool = [...names];
  nameDisplay.textContent = "Click anywhere";
}

function toggleGentle() {
  gentleMode = !gentleMode;
  gentleBtn.textContent = `Gentle: ${gentleMode ? "ON" : "OFF"}`;
}

function saveLists() {
  names = namesInput.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  gentleList = gentleInput.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  reset();
  editor.classList.add("hidden");
}

pickBtn.onclick = pick;
resetBtn.onclick = reset;
gentleBtn.onclick = toggleGentle;
editBtn.onclick = () => editor.classList.toggle("hidden");
saveBtn.onclick = saveLists;
document.body.onclick = (e) => {
  if (!editor.contains(e.target) && e.target !== editBtn && e.target !== pickBtn) pick();
};
