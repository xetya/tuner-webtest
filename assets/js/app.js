(() => {
  "use strict";

  /* ==========================================================================
     TUNER — standalone browser build
     - Multiple playlists are saved permanently in localStorage (URL or file).
     - Channel zapping works with the on-screen list closed (remote-friendly):
       Arrow Up/Down, Page Up/Down, mouse-wheel and touch swipe up/down.
     - A small handful of common Smart TV remote keyCodes (LG webOS "channel
       up/down", legacy Page Up/Down 33/34, etc.) are recognised too — see
       assets/js/pm3u-control-vidaa.js, loaded before this file, which fills
       window.aButtons with the platform-specific overrides used below.
     ========================================================================== */

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  const t = (key, fallback) => {
    try {
      if (window.i18n && window.i18n[key] && window.i18n[key].en) return window.i18n[key].en;
    } catch (_) {}
    return fallback;
  };

  /* -------------------------------------------------------------------- */
  /* storage                                                               */
  /* -------------------------------------------------------------------- */

  const LS_PLAYLISTS = "tuner.playlists.v1";
  const LS_ACTIVE = "tuner.activePlaylistId.v1";
  const LS_CHANNEL_PREFIX = "tuner.lastChannel.";

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  function loadPlaylists() {
    try {
      return JSON.parse(localStorage.getItem(LS_PLAYLISTS) || "{}");
    } catch (_) {
      return {};
    }
  }

  function savePlaylists(playlists) {
    try {
      localStorage.setItem(LS_PLAYLISTS, JSON.stringify(playlists));
      return true;
    } catch (e) {
      setStatus("Could not save the playlist locally (storage full). It will still play, but won't be cached offline.", true);
      return false;
    }
  }

  function getActiveId() {
    return localStorage.getItem(LS_ACTIVE) || "";
  }

  function setActiveId(id) {
    localStorage.setItem(LS_ACTIVE, id || "");
  }

  function getLastChannel(playlistId) {
    const raw = localStorage.getItem(LS_CHANNEL_PREFIX + playlistId);
    const n = raw == null ? NaN : parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  }

  function setLastChannel(playlistId, index) {
    if (!playlistId) return;
    try { localStorage.setItem(LS_CHANNEL_PREFIX + playlistId, String(index)); } catch (_) {}
  }

  /* -------------------------------------------------------------------- */
  /* state                                                                 */
  /* -------------------------------------------------------------------- */

  const state = {
    channels: [],
    current: -1,
    hls: null,
    playlists: loadPlaylists(),
    activeId: "",
    drawerOpen: false,
    focusIndex: -1,     // keyboard focus inside the drawer list
    numberBuffer: "",
    numberTimer: null,
    idleTimer: null,
    osdTimer: null,
  };

  /* -------------------------------------------------------------------- */
  /* m3u parsing                                                           */
  /* -------------------------------------------------------------------- */

  function parseAttrs(line) {
    const attrs = {};
    const re = /([\w-]+)="([^"]*)"/g;
    let m;
    while ((m = re.exec(line))) attrs[m[1]] = m[2];
    return attrs;
  }

  function parseM3U(text) {
    const lines = String(text || "").replace(/\r/g, "").split("\n").map(x => x.trim()).filter(Boolean);
    const result = [];
    let pending = null;

    for (const line of lines) {
      if (line.startsWith("#EXTINF:")) {
        const comma = line.indexOf(",");
        const title = comma >= 0 ? line.slice(comma + 1).trim() : "Untitled";
        const meta = line.slice(8, comma >= 0 ? comma : undefined);
        const attrs = parseAttrs(meta);
        pending = {
          name: title || attrs["tvg-name"] || "Untitled",
          logo: attrs["tvg-logo"] || "",
          group: attrs["group-title"] || "",
          url: ""
        };
      } else if (!line.startsWith("#") && pending) {
        pending.url = line;
        result.push(pending);
        pending = null;
      }
    }
    return result;
  }

  /* -------------------------------------------------------------------- */
  /* playback                                                              */
  /* -------------------------------------------------------------------- */

  function destroyHls() {
    if (state.hls) {
      try { state.hls.destroy(); } catch (_) {}
      state.hls = null;
    }
  }

  function setStatus(text, isError) {
    const el = $("#status");
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("err", !!isError);
  }

  async function play(index, opts = {}) {
    const ch = state.channels[index];
    if (!ch) return;

    state.current = index;
    state.focusIndex = index;
    updateHighlight();
    setLastChannel(state.activeId, index);
    if (!opts.silentOsd) showOsd(ch, index);

    const video = $("#player");
    setStatus(`${t("channel-loading", "Loading")}: ${ch.name}`);

    destroyHls();
    video.pause();
    video.removeAttribute("src");
    video.load();

    const url = ch.url;
    const lower = url.split("?")[0].toLowerCase();

    try {
      if (window.Hls && Hls.isSupported() && lower.includes(".m3u8")) {
        state.hls = new Hls({ maxBufferLength: 15, maxBufferSize: 15 * 2000000 });
        state.hls.loadSource(url);
        state.hls.attachMedia(video);
        state.hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
          setStatus(ch.name);
        });
        state.hls.on(Hls.Events.ERROR, (_, data) => {
          if (data && data.fatal) setStatus(`Stream error: ${data.details || "unknown"}`, true);
        });
      } else if (window.dashjs && lower.includes(".mpd")) {
        const dp = dashjs.MediaPlayer().create();
        dp.initialize(video, url, true);
        state.hls = { destroy: () => dp.reset() }; // reuse the same cleanup slot
        setStatus(ch.name);
      } else {
        video.src = url;
        video.addEventListener("loadedmetadata", () => {
          video.play().catch(() => {});
          setStatus(ch.name);
        }, { once: true });
        video.addEventListener("error", () => {
          setStatus("Channel could not be played in this browser.", true);
        }, { once: true });
      }
    } catch (e) {
      setStatus(`Playback error: ${e.message}`, true);
    }
  }

  function channelCount() { return state.channels.length; }

  function changeChannel(delta) {
    if (!channelCount()) return;
    const next = ((state.current + delta) % channelCount() + channelCount()) % channelCount();
    play(next);
  }

  /* -------------------------------------------------------------------- */
  /* on-screen "now playing" card (10-foot friendly)                       */
  /* -------------------------------------------------------------------- */

  function showOsd(ch, index) {
    const osd = $("#osd");
    const logoBox = $("#osdLogo");
    const num = $("#osdNum");
    const name = $("#osdName");
    const group = $("#osdGroup");

    num.textContent = `${index + 1}/${channelCount()}`;
    name.textContent = ch.name;
    group.textContent = ch.group || "";
    group.hidden = !ch.group;

    const initial = (ch.name || "?").trim()[0] || "?";
    logoBox.innerHTML = "";
    if (ch.logo) {
      const img = document.createElement("img");
      img.src = ch.logo;
      img.alt = "";
      img.onerror = () => { logoBox.innerHTML = `<span class="fallback">${esc(initial.toUpperCase())}</span>`; };
      logoBox.appendChild(img);
    } else {
      logoBox.innerHTML = `<span class="fallback">${esc(initial.toUpperCase())}</span>`;
    }

    osd.classList.add("show");
    clearTimeout(state.osdTimer);
    state.osdTimer = setTimeout(() => osd.classList.remove("show"), 3800);

    wake();
  }

  /* -------------------------------------------------------------------- */
  /* channel drawer (searchable list)                                     */
  /* -------------------------------------------------------------------- */

  function renderList() {
    const list = $("#channels");
    if (!state.channels.length) {
      list.innerHTML = `<div class="empty-hint">${esc(t("noChannelsHere", "No channels yet. Tap the gear icon to add a playlist."))}</div>`;
      $("#count").textContent = `0 ${t("channels", "channels")}`;
      return;
    }

    list.innerHTML = state.channels.map((ch, i) => `
      <button class="channel ${i === state.current ? "active" : ""} ${i === state.focusIndex ? "focused" : ""}" data-i="${i}">
        <span class="no">${i + 1}</span>
        ${ch.logo ? `<img src="${esc(ch.logo)}" alt="" loading="lazy" onerror="this.remove()">` : ""}
        <span><b>${esc(ch.name)}</b><small>${esc(ch.group || "")}</small></span>
      </button>
    `).join("");

    $$(".channel", list).forEach(btn => {
      btn.addEventListener("click", () => { play(Number(btn.dataset.i)); closeDrawer(); });
    });

    $("#count").textContent = `${state.channels.length} ${t("channels", "channels")}`;
    applySearchFilter();
  }

  // Lightweight update used on every channel zap: avoids rebuilding the
  // whole (possibly huge, thousands-of-channels) list HTML just to move a
  // highlight — keeps zapping smooth ("lancar") even on big playlists.
  function updateHighlight() {
    $$(".channel").forEach(el => {
      const i = Number(el.dataset.i);
      el.classList.toggle("active", i === state.current);
      el.classList.toggle("focused", i === state.focusIndex);
    });
  }

  function applySearchFilter() {
    const q = ($("#search").value || "").toLowerCase();
    $$(".channel").forEach((el, i) => {
      const ch = state.channels[i];
      el.hidden = !!q && !`${ch.name} ${ch.group}`.toLowerCase().includes(q);
    });
  }

  function openDrawer() {
    state.drawerOpen = true;
    state.focusIndex = state.current >= 0 ? state.current : 0;
    $("#drawer").classList.add("open");
    renderList();
    setTimeout(() => $("#search").focus(), 50);
  }

  function closeDrawer() {
    state.drawerOpen = false;
    $("#drawer").classList.remove("open");
  }

  function toggleDrawer() { state.drawerOpen ? closeDrawer() : openDrawer(); }

  function moveFocus(delta) {
    const visible = $$(".channel").filter(el => !el.hidden);
    if (!visible.length) return;
    const currentEl = $(`.channel[data-i="${state.focusIndex}"]`);
    let pos = visible.indexOf(currentEl);
    pos = (pos < 0 ? 0 : pos + delta + visible.length) % visible.length;
    state.focusIndex = Number(visible[pos].dataset.i);
    $$(".channel").forEach(el => el.classList.remove("focused"));
    visible[pos].classList.add("focused");
    visible[pos].scrollIntoView({ block: "nearest" });
  }

  function selectFocused() {
    if (state.focusIndex >= 0) { play(state.focusIndex); closeDrawer(); }
  }

  /* -------------------------------------------------------------------- */
  /* playlist manager (persistent, multi-playlist, gear icon)             */
  /* -------------------------------------------------------------------- */

  function playlistArray() {
    return Object.values(state.playlists).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  async function fetchPlaylistText(url) {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.text();
  }

  function upsertPlaylist(entry) {
    entry.updatedAt = Date.now();
    state.playlists[entry.id] = entry;
    savePlaylists(state.playlists);
  }

  function deletePlaylist(id) {
    delete state.playlists[id];
    savePlaylists(state.playlists);
    localStorage.removeItem(LS_CHANNEL_PREFIX + id);
    if (state.activeId === id) {
      const remaining = playlistArray();
      if (remaining.length) activatePlaylist(remaining[0].id);
      else { state.activeId = ""; setActiveId(""); state.channels = []; state.current = -1; renderList(); }
    }
    renderPlaylistManager();
  }

  async function activatePlaylist(id, opts = {}) {
    const entry = state.playlists[id];
    if (!entry) return;
    state.activeId = id;
    setActiveId(id);

    let text = entry.content || "";
    if (entry.sourceType === "url") {
      setStatus(`${t("downloading", "Downloading playlist")}…`);
      try {
        text = await fetchPlaylistText(entry.url);
        entry.content = text; // refresh the permanent offline cache
        upsertPlaylist(entry);
      } catch (e) {
        if (entry.content) {
          setStatus(`Live refresh failed (${e.message}). Showing the last saved copy of "${entry.name}".`, true);
          text = entry.content;
        } else {
          setStatus(`Playlist download failed: ${e.message}. If CORS blocks it, download the M3U and add it as a file instead.`, true);
          return;
        }
      }
    }

    state.channels = parseM3U(text);
    state.current = -1;
    renderList();
    renderPlaylistManager();

    if (!state.channels.length) {
      setStatus(t("filterNoResults", "No valid channels found in this playlist."), true);
      return;
    }
    if (!opts.silentStatus) setStatus(`Loaded ${state.channels.length} channels — "${entry.name}"`);

    const wanted = getLastChannel(id);
    play(Math.min(wanted, state.channels.length - 1), { silentOsd: true });
  }

  function addPlaylistFromUrl(url, name) {
    const entry = {
      id: uid(),
      name: name || (() => { try { return new URL(url).hostname; } catch (_) { return "Playlist"; } })(),
      sourceType: "url",
      url,
      content: "",
      addedAt: Date.now()
    };
    upsertPlaylist(entry);
    return activatePlaylist(entry.id);
  }

  async function addPlaylistFromFile(file) {
    const text = await file.text();
    const entry = {
      id: uid(),
      name: file.name.replace(/\.(m3u8?|txt)$/i, ""),
      sourceType: "file",
      content: text,
      addedAt: Date.now()
    };
    upsertPlaylist(entry);
    return activatePlaylist(entry.id);
  }

  function renderPlaylistManager() {
    const wrap = $("#savedPlaylists");
    const items = playlistArray();
    if (!items.length) {
      wrap.innerHTML = `<div class="empty-hint">No saved playlists yet.</div>`;
      return;
    }
    wrap.innerHTML = items.map(p => `
      <div class="saved-item ${p.id === state.activeId ? "active" : ""}" data-id="${p.id}">
        <div class="meta">
          <b>${esc(p.name)}</b>
          <small>${p.sourceType === "url" ? esc(p.url) : "Local file (saved offline)"}</small>
        </div>
        <div class="actions">
          <button type="button" class="use" title="Use this playlist" aria-label="Use">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <button type="button" class="del" title="Delete" aria-label="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </div>
    `).join("");

    $$(".saved-item .use", wrap).forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.closest(".saved-item").dataset.id;
        activatePlaylist(id).then(closeSettings);
      });
    });
    $$(".saved-item .del", wrap).forEach(btn => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".saved-item");
        const id = item.dataset.id;
        const name = state.playlists[id] ? state.playlists[id].name : "this playlist";
        if (confirm(`Remove "${name}" from your saved playlists?`)) deletePlaylist(id);
      });
    });
  }

  function openSettings() { $("#settingsModal").classList.add("open"); renderPlaylistManager(); }
  function closeSettings() { $("#settingsModal").classList.remove("open"); }

  /* -------------------------------------------------------------------- */
  /* idle chrome (auto-hide topbar/status like a real TV, wakes on input) */
  /* -------------------------------------------------------------------- */

  function wake() {
    $(".tuner").classList.remove("idle");
    clearTimeout(state.idleTimer);
    state.idleTimer = setTimeout(() => $(".tuner").classList.add("idle"), 5000);
  }

  /* -------------------------------------------------------------------- */
  /* remote / keyboard navigation                                         */
  /* -------------------------------------------------------------------- */

  // Standard-ish Smart TV remote keyCodes not covered by KeyboardEvent.key.
  // window.aButtons is populated by assets/js/pm3u-control-vidaa.js (VIDAA/
  // Hisense overrides); we merge in a few more common ones as a fallback.
  const keyCodeMap = Object.assign({
    33: "up",    // legacy Page Up
    34: "down",  // legacy Page Down
    427: "up",   // LG webOS Channel Up
    428: "down", // LG webOS Channel Down
    10009: "back", // LG webOS Back
    461: "back",   // Tizen Back
  }, (() => {
    const map = {};
    const ab = window.aButtons || {};
    if (ab.ChannelUp != null) map[ab.ChannelUp] = "up";
    if (ab.ChannelDown != null) map[ab.ChannelDown] = "down";
    if (ab.BackButton != null) map[ab.BackButton] = "back";
    return map;
  })());

  function handleNumberKey(digit) {
    state.numberBuffer += digit;
    setStatus(`${t("channel", "Channel")} ${state.numberBuffer}_`);
    clearTimeout(state.numberTimer);
    state.numberTimer = setTimeout(() => {
      const n = parseInt(state.numberBuffer, 10);
      state.numberBuffer = "";
      if (n >= 1 && n <= channelCount()) play(n - 1);
      else setStatus(`No channel ${n}`, true);
    }, 1100);
  }

  function isTyping() {
    const el = document.activeElement;
    return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");
  }

  document.addEventListener("keydown", e => {
    wake();
    const settingsOpen = $("#settingsModal").classList.contains("open");
    if (settingsOpen) {
      if (e.key === "Escape") closeSettings();
      return;
    }

    const mapped = keyCodeMap[e.keyCode];
    const key = e.key;

    // Drawer open: arrows browse the list, Enter selects, Back/Escape closes.
    if (state.drawerOpen) {
      if (key === "ArrowUp" || mapped === "up") { e.preventDefault(); moveFocus(-1); }
      else if (key === "ArrowDown" || mapped === "down") { e.preventDefault(); moveFocus(1); }
      else if (key === "Enter") { e.preventDefault(); selectFocused(); }
      else if (key === "Escape" || (!isTyping() && (key === "Backspace" || mapped === "back"))) { e.preventDefault(); closeDrawer(); }
      return;
    }

    // Drawer closed: this is the "zap without opening the list" mode.
    if (key === "ArrowUp" || key === "PageUp" || mapped === "up") { e.preventDefault(); changeChannel(1); }
    else if (key === "ArrowDown" || key === "PageDown" || mapped === "down") { e.preventDefault(); changeChannel(-1); }
    else if (key === "ArrowRight") { adjustVolume(0.05); }
    else if (key === "ArrowLeft") { adjustVolume(-0.05); }
    else if (key === "Enter") { openDrawer(); }
    else if (key === "Escape" || mapped === "back") {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }
    else if (key.toLowerCase() === "f") { toggleFullscreen(); }
    else if (key === " ") { e.preventDefault(); togglePlayPause(); }
    else if (/^[0-9]$/.test(key)) { handleNumberKey(key); }
  });

  function adjustVolume(delta) {
    const v = $("#player");
    v.volume = Math.min(1, Math.max(0, v.volume + delta));
    setStatus(`${t("volume", "Volume")}: ${Math.round(v.volume * 100)}%`);
  }

  function togglePlayPause() {
    const v = $("#player");
    if (v.paused) v.play().catch(() => {}); else v.pause();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  }

  // Mouse wheel = the desktop-browser equivalent of Channel Up/Down, matching
  // the original app's own guide text ("mouse-scroll UP - next channel").
  let wheelLock = 0;
  $(".stage").addEventListener("wheel", e => {
    if (state.drawerOpen) return;
    const now = Date.now();
    if (now - wheelLock < 350) return;
    wheelLock = now;
    changeChannel(e.deltaY < 0 ? 1 : -1);
  }, { passive: true });

  /* -------------------------------------------------------------------- */
  /* touch: swipe up/down to zap, tap to wake chrome                      */
  /* -------------------------------------------------------------------- */

  (() => {
    const stage = $(".stage");
    let startY = null, startX = null, startT = 0, moved = false;

    stage.addEventListener("touchstart", e => {
      $(".tuner").classList.add("touch");
      const touch = e.touches[0];
      startY = touch.clientY; startX = touch.clientX; startT = Date.now(); moved = false;
    }, { passive: true });

    stage.addEventListener("touchmove", () => { moved = true; }, { passive: true });

    stage.addEventListener("touchend", e => {
      if (startY == null) return;
      const touch = e.changedTouches[0];
      const dy = touch.clientY - startY;
      const dx = touch.clientX - startX;
      const dt = Date.now() - startT;
      startY = null;

      if (Math.abs(dy) > 55 && Math.abs(dy) > Math.abs(dx) * 1.3 && dt < 700) {
        $(".tuner").classList.add("hint-dismissed");
        changeChannel(dy < 0 ? 1 : -1); // swipe up = next, swipe down = previous
      } else if (!moved) {
        wake();
      }
    }, { passive: true });
  })();

  document.addEventListener("mousemove", wake);
  document.addEventListener("click", wake);

  /* -------------------------------------------------------------------- */
  /* wiring: buttons, search, settings modal                              */
  /* -------------------------------------------------------------------- */

  $("#channelsBtn").addEventListener("click", toggleDrawer);
  $("#drawerClose").addEventListener("click", closeDrawer);
  $("#settingsBtn").addEventListener("click", openSettings);
  $("#settingsClose").addEventListener("click", closeSettings);
  $("#settingsModal").addEventListener("click", e => { if (e.target === $("#settingsModal")) closeSettings(); });
  $("#fullscreen").addEventListener("click", toggleFullscreen);
  $("#search").addEventListener("input", applySearchFilter);

  $("#addUrlBtn").addEventListener("click", async () => {
    const input = $("#playlistUrl");
    const url = input.value.trim();
    if (!url) return;
    $("#addUrlBtn").disabled = true;
    try { await addPlaylistFromUrl(url); input.value = ""; closeSettings(); }
    finally { $("#addUrlBtn").disabled = false; }
  });
  $("#playlistUrl").addEventListener("keydown", e => { if (e.key === "Enter") $("#addUrlBtn").click(); });

  $("#playlistFile").addEventListener("change", async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    await addPlaylistFromFile(file);
    e.target.value = "";
    closeSettings();
  });

  /* -------------------------------------------------------------------- */
  /* boot: restore the last active playlist automatically                 */
  /* -------------------------------------------------------------------- */

  (function boot() {
    renderList();
    renderPlaylistManager();
    wake();

    const activeId = getActiveId();
    if (activeId && state.playlists[activeId]) {
      activatePlaylist(activeId);
    } else if (playlistArray().length) {
      activatePlaylist(playlistArray()[0].id);
    } else {
      setStatus("Add a playlist to get started — tap the gear icon (URL or file).");
      openSettings();
    }
  })();
})();
