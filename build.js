// Builds two outputs from the same source:
//   rescue-horse-search.html — body-only fragment for publishing as a Claude artifact
//   dist/index.html         — complete standalone page for static hosting (Vercel)
const fs = require("fs");
const path = require("path");
const { render } = require("./src/app.js");
const state = JSON.parse(fs.readFileSync(path.join(__dirname, "src/data.json"), "utf8"));

const css = fs.readFileSync(path.join(__dirname, "src/style.css"), "utf8");
const js = fs.readFileSync(path.join(__dirname, "src/app.js"), "utf8");
const fonts =
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@500&display=swap">\n';
const body =
  '<main id="app">' + render(state) + "</main>\n" +
  '<script id="state" type="application/json">' + JSON.stringify(state).replace(/<\//g, "<\\/") + "</script>\n" +
  '<script id="app-script">' + js.replace(/<\/script>/gi, "<\\/script>") + "</script>\n";

const fragment = "<title>Rescue Horse Search</title>\n" + fonts + '<style id="pageStyle">' + css + "</style>\n" + body;
fs.writeFileSync(path.join(__dirname, "rescue-horse-search.html"), fragment);

const full =
  "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n" +
  "<title>Rescue Horse Search</title>\n<meta name=\"description\" content=\"Rescue horses within driving range of Buna, TX — status, notes, contacts, and the Bluebonnet Expo deadlines.\">\n" +
  "<link rel=\"icon\" href=\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐎</text></svg>\">\n" +
  fonts +
  '<style id="pageStyle">' + css + "</style>\n</head>\n<body>\n" + body + "</body>\n</html>\n";
fs.mkdirSync(path.join(__dirname, "dist"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "dist/index.html"), full);
console.log("wrote dist/index.html (" + full.length + " bytes) and rescue-horse-search.html");
