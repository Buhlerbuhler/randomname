import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Big, bold, vibrant random name picker inspired by the feel of Dave Birss' This & That
// • Click anywhere or press SPACE to pick the next name
// • One word/name per pick (centered, huge type)
// • No repeats mode by default; Reset repopulates the bag
// • Quick editor to paste your class list (one per line or comma-separated)
// • Clean, single-file React component with Tailwind CSS

const DEFAULT_NAMES = [
  "Eunice",
  "Danikah",
  "Japdeep",
  "Katelyn",
  "Emerson",
  "Hayley",
  "Benjamin",
  "Dalia",
  "Lena",
  "Maninder",
  "Serena",
  "Laila",
  "Eron",
  "Connor",
  "Kiel",
  "Noah",
  "Beckett",
  "Zlata",
  "Zakhar",
  "Acacia",
  "Zack",
  "Eileen",
  "Joshua",
  "Steve",
  "Jordyn",
  "Danika",
];

const GENTLE_EXCLUSIONS = new Set([
  "Eron",
  "Emerson",
  "Acacia",
  "Maninder",
]);

const buildGentleSeed = (source: string[], limit = 5) => {
  if (!source.length) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const name of source) {
    if (seen.has(name)) continue;
    seen.add(name);
    if (GENTLE_EXCLUSIONS.has(name)) continue;
    result.push(name);
    if (limit && result.length >= limit) break;
  }
  return result;
};

export default function RandomNamePicker() {
  const [names, setNames] = useState<string[]>(DEFAULT_NAMES);
  const [pool, setPool] = useState<string[]>(DEFAULT_NAMES);
  const [current, setCurrent] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [noRepeats, setNoRepeats] = useState(true);
  const [gentleMode, setGentleMode] = useState(false);
  const [gentleNames, setGentleNames] = useState<string[]>(
    buildGentleSeed(DEFAULT_NAMES)
  );
  const [flashMsg, setFlashMsg] = useState<string>("");
  const clickLock = useRef(false);

  // Gradient palette for vibrant backgrounds
  const gradients = useMemo(
    () => [
      "from-fuchsia-500 via-pink-500 to-rose-500",
      "from-indigo-500 via-sky-500 to-cyan-400",
      "from-amber-400 via-orange-500 to-red-500",
      "from-lime-400 via-emerald-500 to-teal-500",
      "from-purple-500 via-violet-500 to-indigo-500",
      "from-sky-400 via-blue-500 to-indigo-600",
    ],
    []
  );
  const [gIx, setGIx] = useState(0);

  // Pick a new gradient each pick for some fun
  const nextGradient = () => setGIx((i) => (i + 1) % gradients.length);

  // Handle keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") { e.preventDefault(); pick(); }
      if (e.key.toLowerCase() === "r") reset();
      if (e.key.toLowerCase() === "e") setEditing((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pool, names, noRepeats]);

  const parseNames = (text: string) => {
    return text
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const reset = (newNames?: string[]) => {
    const list = newNames && newNames.length ? newNames : names;
    setPool([...list]);
    setCurrent("");
    setFlashMsg("");
  };

  useEffect(() => { reset(names); }, []);

  const pick = () => {
    if (clickLock.current) return; // prevent spamming during animation
    clickLock.current = true;

    if (!names.length) {
      pulseMsg("Add some names first (press E)");
      clickLock.current = false;
      return;
    }

    const available = noRepeats ? pool : names;

    if (!available.length) {
      pulseMsg("Bag empty — Reset to start again (R)");
      clickLock.current = false;
      return;
    }

    const gentleSet = gentleMode ? new Set(gentleNames) : null;
    const source = gentleSet
      ? available.filter((name) => gentleSet.has(name))
      : available;

    if (!source.length) {
      pulseMsg(
        gentleNames.length
          ? "Gentle list empty — Edit it or reset"
          : "Add names to the gentle list first"
      );
      clickLock.current = false;
      return;
    }

    const ix = Math.floor(Math.random() * source.length);
    const chosen = source[ix];

    setCurrent(chosen);
    nextGradient();

    if (noRepeats) {
      setPool((prevPool) => {
        const nextPool = [...prevPool];
        const removeIx = nextPool.indexOf(chosen);
        if (removeIx >= 0) nextPool.splice(removeIx, 1);
        return nextPool;
      });
    }

    // release the lock shortly after the pop animation starts
    setTimeout(() => (clickLock.current = false), 250);
  };

  const pulseMsg = (msg: string) => {
    setFlashMsg(msg);
    setTimeout(() => setFlashMsg(""), 1400);
  };

  const onEditorSave = (text: string) => {
    const list = parseNames(text);
    setNames(list);
    setGentleNames((prev) => {
      const seen = new Set<string>();
      const filtered: string[] = [];
      list.forEach((name) => {
        if (!prev.includes(name) || seen.has(name)) return;
        seen.add(name);
        if (GENTLE_EXCLUSIONS.has(name)) return;
        filtered.push(name);
      });
      if (filtered.length) return filtered;
      return buildGentleSeed(list);
    });
    setEditing(false);
    reset(list);
  };

  const onGentleSave = (text: string) => {
    const list = parseNames(text);
    const filtered: string[] = [];
    const seen = new Set<string>();
    let skipped = false;
    list.forEach((name) => {
      if (!names.includes(name)) {
        skipped = true;
        return;
      }
      if (GENTLE_EXCLUSIONS.has(name)) {
        skipped = true;
        return;
      }
      if (seen.has(name)) {
        skipped = true;
        return;
      }
      seen.add(name);
      filtered.push(name);
    });
    if (!filtered.length) {
      setGentleNames([]);
      pulseMsg("Gentle list cleared — add allowed names from the class list");
      return;
    }
    if (skipped) {
      pulseMsg("Some names skipped (not in class list or excluded)");
    } else {
      pulseMsg(`Gentle list updated (${filtered.length})`);
    }
    setGentleNames(filtered);
  };

  const exampleText = DEFAULT_NAMES.join("\n");
  const gentleExampleBase = names.length ? names : DEFAULT_NAMES;
  const gentleExampleText = buildGentleSeed(gentleExampleBase).join("\n");

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500" />
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Random Name Picker</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="hidden sm:inline-flex px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm"
            onClick={() => setEditing((v) => !v)}
            aria-label="Edit names"
          >
            {editing ? "Close Editor (E)" : "Edit Names (E)"}
          </button>
          <button
            className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm"
            onClick={() => {
              setGentleMode((v) => !v);
              pulseMsg(!gentleMode ? "Gentle mode ON" : "Gentle mode OFF");
            }}
            aria-pressed={gentleMode}
          >
            {gentleMode ? "Gentle Mode: ON" : "Gentle Mode: OFF"}
          </button>
          <button
            className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm"
            onClick={() => { setNoRepeats((v) => !v); pulseMsg(!noRepeats ? "No repeats ON" : "No repeats OFF"); }}
            aria-pressed={noRepeats}
          >
            {noRepeats ? "No Repeats: ON" : "No Repeats: OFF"}
          </button>
          <button
            className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm"
            onClick={() => reset()}
            aria-label="Reset bag"
          >
            Reset (R)
          </button>
        </div>
      </header>

      {/* Main stage */}
      <main
        className="relative flex-1 flex items-center justify-center cursor-pointer select-none overflow-hidden"
        onClick={pick}
        aria-label="Pick next name"
        role="button"
      >
        <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${gradients[gIx]} opacity-80`} />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(255,255,255,0.18)_0%,rgba(0,0,0,0.0)_70%)]" />

        <div className="text-center px-6">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={current || "placeholder"}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="font-black tracking-tight leading-none"
              style={{
                // Clamp font sizes nicely across screen sizes
                fontSize: current ? "clamp(3rem, 14vw, 12rem)" : "clamp(1.5rem, 6vw, 4rem)",
                textShadow: "0 8px 30px rgba(0,0,0,0.35)",
              }}
            >
              {current || "Click or press SPACE"}
            </motion.div>
          </AnimatePresence>

          {/* Subtle status */}
          <div className="mt-4 text-sm/relaxed opacity-90">
            <div>
              {noRepeats ? (
                <span>
                  {pool.length} in the bag • {names.length - pool.length} picked
                </span>
              ) : (
                <span>Repeats allowed</span>
              )}
            </div>
            {gentleMode && (
              <div className="mt-1 opacity-80">
                Gentle focus on {gentleNames.length} name{gentleNames.length === 1 ? "" : "s"}
              </div>
            )}
          </div>

          {/* Flash message */}
          <AnimatePresence>
            {flashMsg && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="mt-3 inline-block rounded-full bg-black/35 backdrop-blur px-3 py-1 text-xs"
              >
                {flashMsg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Big floating Pick button for accessibility (bottom-center) */}
        <div className="pointer-events-none absolute bottom-6 left-0 right-0 flex justify-center">
          <button
            onClick={pick}
            className="pointer-events-auto rounded-2xl px-6 py-3 text-lg font-bold bg-white/95 text-neutral-900 hover:bg-white focus:outline-none focus:ring-4 focus:ring-white/50 shadow-xl"
          >
            PICK
          </button>
        </div>
      </main>

      {/* Editor panel */}
      <AnimatePresence initial={false}>
        {editing && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="bg-neutral-900/70 border-t border-neutral-800"
          >
            <div className="max-w-4xl mx-auto px-6 py-6 grid gap-4 md:grid-cols-2">
              <div>
                <h2 className="text-lg font-bold mb-2">Class List</h2>
                <p className="text-sm opacity-80 mb-3">Paste names (one per line or comma-separated). Click <em>Save</em> to update the bag.</p>
                <NameEditor
                  initialText={names.join("\n")}
                  onSave={onEditorSave}
                  example={exampleText}
                />
              </div>
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold mb-2">Gentle Mode List</h2>
                  <p className="text-sm opacity-80 mb-3">
                    Pick from a smaller, calmer list when Gentle Mode is on. Names must already exist in the class list.
                  </p>
                  <NameEditor
                    initialText={gentleNames.join("\n")}
                    onSave={onGentleSave}
                    example={gentleExampleText}
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold mb-2">Tips</h2>
                  <ul className="text-sm list-disc pl-5 space-y-2 opacity-90">
                    <li>Click anywhere or press <kbd className="px-1 py-0.5 bg-neutral-800 rounded">SPACE</kbd> to pick.</li>
                    <li>Press <kbd className="px-1 py-0.5 bg-neutral-800 rounded">R</kbd> to reset the bag.</li>
                    <li>Press <kbd className="px-1 py-0.5 bg-neutral-800 rounded">E</kbd> to toggle this editor.</li>
                    <li>Toggle <strong>No Repeats</strong> to keep everyone getting a turn.</li>
                    <li>Try <strong>Gentle Mode</strong> for easing into participation with a focused list.</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="px-6 py-4 text-xs text-neutral-400 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-neutral-900">
        <span>Built for quick classroom picking • Bold, vibrant, one name per click</span>
        <span className="opacity-60">Shortcuts: Space = Pick • R = Reset • E = Editor</span>
      </footer>
    </div>
  );
}

function NameEditor({ initialText, onSave, example }: { initialText: string; onSave: (text: string) => void; example: string; }) {
  const [text, setText] = useState(initialText);

  useEffect(() => { setText(initialText); }, [initialText]);

  return (
    <div className="grid gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={example}
        className="w-full min-h-[180px] rounded-xl bg-neutral-800/70 border border-neutral-700 focus:border-neutral-500 outline-none p-3 font-mono text-sm"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSave(text)}
          className="rounded-xl bg-white text-neutral-900 font-bold px-4 py-2 hover:bg-white/90"
        >
          Save
        </button>
        <button
          onClick={() => setText(example)}
          className="rounded-xl bg-neutral-800 text-white px-4 py-2 border border-neutral-700 hover:bg-neutral-800/80"
        >
          Example
        </button>
        <button
          onClick={() => setText("")}
          className="rounded-xl bg-neutral-800 text-white px-4 py-2 border border-neutral-700 hover:bg-neutral-800/80"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
