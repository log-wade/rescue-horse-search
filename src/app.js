// Shared render + behaviour for the Rescue Horse Search tracker.
// Runs in the page (browser) and in the build script (node) — render() is DOM-free.
var STATUSES = ["Interested", "Top pick", "Contacted", "Visited", "Passed"];
var ESC = function (s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
};
function daysUntil(iso, now) {
  var d = new Date(iso + "T12:00:00");
  var n = now || new Date();
  return Math.ceil((d - n) / 86400000);
}
function statusClass(s) {
  return "st-" + String(s).toLowerCase().replace(/[^a-z]+/g, "-");
}
function renderHorse(h, i) {
  var opts = STATUSES.map(function (s) {
    return '<option' + (s === h.status ? " selected" : "") + ">" + s + "</option>";
  }).join("");
  return (
    '<article class="horse ' + statusClass(h.status) + '" data-i="' + i + '">' +
      '<div class="h-head">' +
        '<div class="h-name"><h3>' + ESC(h.name) + '</h3><span class="h-rescue">' + ESC(h.rescue) + '</span></div>' +
        '<label class="h-status"><span class="lbl">Status</span><select data-f="status">' + opts + '</select></label>' +
      '</div>' +
      '<dl class="h-facts">' +
        '<div><dt>Horse</dt><dd>' + ESC(h.desc) + '</dd></div>' +
        '<div><dt>Where</dt><dd>' + ESC(h.where) + '</dd></div>' +
        '<div><dt>Drive from Buna</dt><dd class="num">' + ESC(h.drive) + '</dd></div>' +
        '<div><dt>Rider level</dt><dd>' + ESC(h.rider) + '</dd></div>' +
        '<div><dt>Fee</dt><dd class="num">' + ESC(h.fee) + '</dd></div>' +
        '<div><dt>Available</dt><dd>' + ESC(h.avail) + '</dd></div>' +
      '</dl>' +
      '<p class="h-blurb">' + ESC(h.blurb) + '</p>' +
      '<div class="h-foot">' +
        '<label class="h-notes"><span class="lbl">My notes</span><textarea data-f="notes" rows="2" placeholder="Who you talked to, what they said, what you saw…">' + ESC(h.notes) + '</textarea></label>' +
        '<div class="h-links">' + (h.url ? '<a href="' + ESC(h.url) + '" target="_blank" rel="noopener">Listing ↗</a>' : "") +
          '<button type="button" class="del" data-del="' + i + '" title="Remove from list">Remove</button></div>' +
      '</div>' +
    '</article>'
  );
}
function renderRescue(r) {
  return (
    '<div class="rescue">' +
      '<div class="r-head"><h3>' + ESC(r.name) + '</h3><span class="r-drive num">' + ESC(r.drive) + '</span></div>' +
      '<p class="r-where">' + ESC(r.where) + '</p>' +
      '<p class="r-proc">' + ESC(r.process) + '</p>' +
      '<p class="r-contact">' + ESC(r.contact) + (r.url ? ' · <a href="' + ESC(r.url) + '" target="_blank" rel="noopener">site ↗</a>' : "") + '</p>' +
    '</div>'
  );
}
function render(state, now) {
  var d1 = daysUntil(state.deadlines[0].date, now);
  var d2 = daysUntil(state.deadlines[1].date, now);
  var counts = {};
  state.horses.forEach(function (h) { counts[h.status] = (counts[h.status] || 0) + 1; });
  var summary = STATUSES.map(function (s) {
    return '<span class="chip ' + statusClass(s) + '"><b class="num">' + (counts[s] || 0) + '</b> ' + s + '</span>';
  }).join("");
  var steps = state.checklist.map(function (c, i) {
    return '<li><label><input type="checkbox" data-c="' + i + '"' + (c.done ? " checked" : "") + '><span>' + ESC(c.text) + '</span></label></li>';
  }).join("");
  function dl(n) { return n > 1 ? n + " days" : n === 1 ? "tomorrow" : n === 0 ? "today" : "passed"; }
  return (
    '<header class="top">' +
      '<div class="brand"><span class="eyebrow">Buna, Texas · trail horse · rescue adoption</span><h1>Rescue Horse Search</h1></div>' +
      '<div class="dates">' +
        '<div class="date' + (d1 <= 7 ? " urgent" : "") + '"><span class="lbl">' + ESC(state.deadlines[0].label) + '</span><b class="num">' + dl(d1) + '</b><span class="when">' + ESC(state.deadlines[0].when) + '</span></div>' +
        '<div class="date"><span class="lbl">' + ESC(state.deadlines[1].label) + '</span><b class="num">' + dl(d2) + '</b><span class="when">' + ESC(state.deadlines[1].when) + '</span></div>' +
      '</div>' +
    '</header>' +
    '<section class="plan">' +
      '<div class="plan-text"><h2>Bluebonnet Expo plan</h2><p>Every Bluebonnet riding horse is being adopted at the Expo in Taylor, TX. Pre-approval must be done before you can send top choices, and fees are half price on Expo day only.</p></div>' +
      '<ol class="checklist">' + steps + '</ol>' +
    '</section>' +
    '<section class="list">' +
      '<div class="list-head"><h2>Horses</h2><div class="summary">' + summary + '</div></div>' +
      '<div class="horses">' + state.horses.map(renderHorse).join("") + '</div>' +
      '<details class="add"><summary>Add a horse</summary>' +
        '<form id="addForm" class="add-form">' +
          '<label>Name<input name="name" required></label>' +
          '<label>Rescue<input name="rescue" required></label>' +
          '<label>Horse (breed, age, sex, height)<input name="desc"></label>' +
          '<label>Where<input name="where"></label>' +
          '<label>Drive from Buna<input name="drive" placeholder="~2 h"></label>' +
          '<label>Rider level<input name="rider"></label>' +
          '<label>Fee<input name="fee"></label>' +
          '<label>Available<input name="avail"></label>' +
          '<label class="wide">Notes<input name="blurb"></label>' +
          '<label class="wide">Listing URL<input name="url" type="url"></label>' +
          '<button type="submit" class="btn">Add to list</button>' +
        '</form></details>' +
    '</section>' +
    '<section class="rescues"><h2>Rescues &amp; how each one works</h2><div class="rescue-grid">' + state.rescues.map(renderRescue).join("") + '</div></section>' +
    '<footer class="foot"><p>Drive times are rough estimates from Buna. Fees marked “posts in Sept” come from Bluebonnet’s listing pages; check the site before the Expo.</p></footer>' +
    '<div class="savebar" id="savebar" hidden><span id="saveMsg">Unsaved changes</span><button type="button" class="btn" id="saveBtn">Save changes</button></div>'
  );
}
if (typeof module !== "undefined") { module.exports = { render: render, STATUSES: STATUSES }; }

// ---------- browser only ----------
if (typeof document !== "undefined") {
  (function () {
    var STATE = JSON.parse(document.getElementById("state").textContent);
    var LS_KEY = "rescue-horse-search:v1";
    var usingLocal = false;
    // Outside the Claude artifact runtime (e.g. the Vercel build) the page keeps changes in this browser.
    try {
      var saved = localStorage.getItem(LS_KEY);
      if (saved) { var s = JSON.parse(saved); if (s && s.horses && s.checklist) { STATE.horses = s.horses; STATE.checklist = s.checklist; } }
    } catch (e) {}
    var STYLE = document.getElementById("pageStyle").textContent;
    var SCRIPT = document.getElementById("app-script").textContent;
    var TITLE = document.title;
    var app = document.getElementById("app");
    var dirty = false;
    var artifact = null;
    var readOnly = false;

    function paint() { app.innerHTML = render(STATE); }
    function markDirty() {
      dirty = true;
      var bar = document.getElementById("savebar");
      bar.hidden = false;
      document.getElementById("saveMsg").textContent = readOnly ? "This view is read-only — changes will not be kept." : "Unsaved changes";
    }
    function fullDoc(state) {
      return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>' + ESC(TITLE) + '</title>' +
        '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@500&display=swap">' +
        '<style id="pageStyle">' + STYLE + '</style></head><body>' +
        '<main id="app">' + render(state) + '</main>' +
        '<script id="state" type="application/json">' + JSON.stringify(state).replace(/<\//g, "<\\/") + '<\/script>' +
        '<script id="app-script">' + SCRIPT.replace(/<\/script>/gi, "<\\/script>") + '<\/script>' +
        '</body></html>';
    }
    function collect() {
      app.querySelectorAll(".horse").forEach(function (el) {
        var h = STATE.horses[+el.dataset.i];
        if (!h) return;
        h.status = el.querySelector('[data-f="status"]').value;
        h.notes = el.querySelector('[data-f="notes"]').value;
      });
      app.querySelectorAll("[data-c]").forEach(function (cb) { STATE.checklist[+cb.dataset.c].done = cb.checked; });
    }
    async function save() {
      collect();
      var btn = document.getElementById("saveBtn");
      var msg = document.getElementById("saveMsg");
      if (!artifact) {
        try {
          localStorage.setItem(LS_KEY, JSON.stringify({ horses: STATE.horses, checklist: STATE.checklist }));
          dirty = false; usingLocal = true;
          msg.textContent = "Saved on this device";
          setTimeout(function () { if (!dirty) document.getElementById("savebar").hidden = true; }, 1600);
        } catch (e) { msg.textContent = "Couldn't save in this browser (storage blocked)."; }
        return;
      }
      btn.disabled = true; msg.textContent = "Saving…";
      try {
        await artifact.publish(fullDoc(STATE));
        msg.textContent = "Saved — reloading";
      } catch (e) {
        var code = e && e.code;
        if (code === "conflict") { msg.textContent = "Someone saved a newer version; reloading to it."; }
        else if (code === "not_writer" || code === "not_granted" || code === "not_declared") { readOnly = true; msg.textContent = "This view is read-only — changes will not be kept."; }
        else { msg.textContent = "Couldn't save (" + (code || "error") + "). Try again in a moment."; btn.disabled = false; }
      }
    }
    function wire() {
      app.addEventListener("change", function (e) {
        var t = e.target;
        if (t.matches('[data-f="status"]')) {
          var card = t.closest(".horse");
          STATUSES.forEach(function (s) { card.classList.remove(statusClass(s)); });
          card.classList.add(statusClass(t.value));
          markDirty();
        } else if (t.matches("[data-c]") || t.matches('[data-f="notes"]')) { markDirty(); }
      });
      app.addEventListener("input", function (e) { if (e.target.matches('[data-f="notes"]')) markDirty(); });
      app.addEventListener("click", function (e) {
        var b = e.target.closest("[data-del]");
        if (b) { collect(); STATE.horses.splice(+b.dataset.del, 1); paint(); markDirty(); return; }
        if (e.target.closest("#saveBtn")) save();
      });
      app.addEventListener("submit", function (e) {
        var form = e.target;
        if (form.id !== "addForm") return;
        e.preventDefault();
        collect();
        var fd = new FormData(form);
        var h = { status: "Interested", notes: "" };
        ["name", "rescue", "desc", "where", "drive", "rider", "fee", "avail", "blurb", "url"].forEach(function (k) { h[k] = (fd.get(k) || "").toString().trim(); });
        STATE.horses.push(h);
        paint(); markDirty();
        document.querySelector(".horses").lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
    // The served markup is already rendered; repaint only to refresh the countdowns, then wire once.
    paint();
    wire();
    if (window.claude && typeof window.claude.use === "function") {
      window.claude.use("artifact").then(function (ns) { artifact = ns; if (!ns && dirty) markDirty(); });
    }
    void usingLocal;
    window.addEventListener("beforeunload", function (e) { if (dirty && !document.getElementById("saveBtn").disabled) { e.preventDefault(); e.returnValue = ""; } });
  })();
}
