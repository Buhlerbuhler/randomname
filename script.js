// Default class list
let names = [
  "Eunice","Danikah","Japdeep","Katelyn","Emerson","Hayley","Benjamin","Dalia","Lena",
  "Maninder","Serena","Laila","Eron","Connor","Kiel","Noah","Beckett","Zlata",
  "Zakhar","Acacia","Zack","Eileen","Joshua","Steve","Jordyn","Danika"
];

// Gentle exclusion list
let gentleExclusions = ["Eron", "Emerson", "Acacia", "Maninder"];

let pool = [...names];
let gentleMode = false;

const nameDisplay = document.getElementById("name-display");
const pickBtn = document.getElementById("pick");
const editor = document.getElementById("editor");
const namesInput = document.getElementById("names-input");
const gentleInput = document.getElementById("gentle-input");
const saveBtn = document.getElementById("save");

function pick() {
  let source = pool;
  if (gentleMode) {
    source = source.filter(n => !gentleExclusions.includes(n));
  }
  if (!source.length) {
    nameDisplay.textContent = "Reset to start again";
    return;
  }
  const i = Math.floor(Math.random() * source.length);
  const chosen = source[i];
  nameDisplay.textContent = chosen;
  nameDisplay.classList.add("pop");
  setTimeout(() => nameDisplay.classList.remove("pop"), 150);
  pool.splice(pool.indexOf(chosen), 1);
}

function reset() {
  pool = [...names];
  nameDisplay.textContent = "Click or press SPACE";
}

function toggleGentle() {
  gentleMode = !gentleMode;
}

function saveLists() {
  names = namesInput.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  gentleExclusions = gentleInput.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  reset();
  editor.classList.add("hidden");
}

pickBtn.onclick = pick;
saveBtn.onclick = saveLists;

document.body.addEventListener("keydown", e => {
  if (e.key === " ") pick();
  if (e.key.toLowerCase() === "e") {
    editor.classList.toggle("hidden");
    namesInput.value = names.join("\\n");
    gentleInput.value = gentleExclusions.join("\\n");
  }
  if (e.key.toLowerCase() === "g") toggleGentle();
  if (e.key.toLowerCase() === "r") reset();
});

document.body.onclick = e => {
  if (!editor.contains(e.target) && e.target !== pickBtn) pick();
};
