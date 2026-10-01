const defaults = {
  html: `<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
</head>
<body>
  <main class="card">
    <h1>Hello, Warish!</h1>
    <p>Edit the code and press Run.</p>
    <button id="helloBtn">Click me</button>
  </main>
</body>
</html>`,
  css: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #101522;
  color: white;
  font-family: system-ui, sans-serif;
}
.card {
  padding: 32px;
  text-align: center;
  border: 1px solid #2b3850;
  border-radius: 18px;
  background: #151c2a;
}
button {
  padding: 10px 16px;
  border: 0;
  border-radius: 8px;
  background: #62f5a7;
  color: #06100b;
  font-weight: 800;
  cursor: pointer;
}`,
  js: `document.getElementById("helloBtn")?.addEventListener("click", () => {
  alert("Hello from Warish Code Lab!");
});`
};

const state = {
  activeTab: localStorage.getItem("wcl-active-tab") || "html",
  code: JSON.parse(localStorage.getItem("wcl-code") || "null") || {...defaults}
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const editor = $("#codeEditor");
const preview = $("#preview");

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 1800);
}

function save() {
  localStorage.setItem("wcl-code", JSON.stringify(state.code));
  localStorage.setItem("wcl-active-tab", state.activeTab);
}

function setEditor(tab) {
  state.activeTab = tab;
  editor.value = state.code[tab];
  $("#activeFile").textContent = tab === "html" ? "index.html" : tab === "css" ? "style.css" : "script.js";
  $("#languageBadge").textContent = tab.toUpperCase();
  $$(".file-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  save();
  updateLineInfo();
}

function buildDocument() {
  let html = state.code.html;
  const css = state.code.css;
  const js = state.code.js;
  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `<style>${css}</style></head>`);
  } else {
    html += `<style>${css}</style>`;
  }
  if (/<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, `<script>${js.replace(/<\/script>/gi, "<\\\\/script>")}<\\/body>`);
  } else {
    html += `<script>${js.replace(/<\/script>/gi, "<\\\\/script>")}</script>`;
  }
  return html;
}

function run() {
  preview.srcdoc = buildDocument();
  toast("Preview updated");
}

function updateLineInfo() {
  const pos = editor.selectionStart || 0;
  const before = editor.value.slice(0, pos);
  const line = before.split("\n").length;
  const col = pos - before.lastIndexOf("\n");
  $("#lineInfo").textContent = `Ln ${line}, Col ${col}`;
}

editor.addEventListener("input", () => {
  state.code[state.activeTab] = editor.value;
  save();
  updateLineInfo();
});
editor.addEventListener("keyup", updateLineInfo);
editor.addEventListener("click", updateLineInfo);

$$(".file-tab").forEach(btn => btn.addEventListener("click", () => setEditor(btn.dataset.tab)));
$("#runBtn").addEventListener("click", run);
$("#runTopBtn").addEventListener("click", run);

$("#resetBtn").addEventListener("click", () => {
  if (!confirm("Reset all code to the starter project?")) return;
  state.code = {...defaults};
  setEditor(state.activeTab);
  run();
  toast("Starter code restored");
});

$("#copyBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(editor.value);
    toast("Code copied");
  } catch {
    editor.select();
    document.execCommand("copy");
    toast("Code copied");
  }
});

$("#downloadBtn").addEventListener("click", () => {
  const blob = new Blob([buildDocument()], {type:"text/html"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "warish-code-lab-project.html";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("Project downloaded");
});

$("#newProjectBtn").addEventListener("click", () => {
  if (!confirm("Start a new project? Current code will be replaced.")) return;
  state.code = {...defaults, html: `<!doctype html>
<html>
<head><meta charset="UTF-8"><title>New Project</title></head>
<body><h1>My New Project</h1></body>
</html>`, css: `body{font-family:system-ui;padding:30px}`, js: `// Start coding here`};
  setEditor("html");
  run();
  toast("New project created");
});

$("#openPreviewBtn").addEventListener("click", () => {
  const win = window.open();
  if (!win) return toast("Allow pop-ups to open preview");
  win.document.write(buildDocument());
  win.document.close();
});

$("#themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem("wcl-theme", document.body.classList.contains("light") ? "light" : "dark");
});

if (localStorage.getItem("wcl-theme") === "light") document.body.classList.add("light");

$("#menuBtn").addEventListener("click", () => $("#sidebar").classList.toggle("open"));

function showSection(id) {
  $$(".page-section").forEach(s => s.classList.toggle("active-section", s.id === id));
  $$(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.section === id));
  $("#sidebar").classList.remove("open");
  window.scrollTo({top:0, behavior:"smooth"});
}

$$(".nav-item").forEach(btn => btn.addEventListener("click", () => showSection(btn.dataset.section)));

const challenges = [
  ["01", "Profile Card", "Build a responsive profile card with an avatar, name and button.", "html"],
  ["02", "Neon Button", "Create a glowing button using CSS hover and box-shadow.", "css"],
  ["03", "Counter", "Make a counter with + and − buttons using JavaScript.", "js"],
  ["04", "Dark Navbar", "Create a responsive navigation bar for a dark website.", "css"],
  ["05", "Todo List", "Add tasks dynamically and remove them with JavaScript.", "js"],
  ["06", "Landing Hero", "Build a hero section with a heading, text and CTA button.", "html"]
];

$("#challengeGrid").innerHTML = challenges.map(([num,title,desc,tab]) => `
  <article class="challenge">
    <span class="num">CHALLENGE ${num}</span>
    <h3>${title}</h3>
    <p>${desc}</p>
    <button class="text-btn" data-challenge="${tab}">Open Lab →</button>
  </article>
`).join("");

$$("[data-challenge]").forEach(btn => btn.addEventListener("click", () => {
  showSection("lab");
  setEditor(btn.dataset.challenge);
}));

$$("[data-load]").forEach(btn => btn.addEventListener("click", () => {
  showSection("lab");
  setEditor(btn.dataset.load);
}));

setEditor(state.activeTab);
run();
