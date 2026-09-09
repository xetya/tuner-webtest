(() => {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const state = { channels: [], current: -1, hls: null };

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));

  function parseAttrs(line) {
    const attrs = {};
    const re = /([\w-]+)="([^"]*)"/g;
    let m;
    while ((m = re.exec(line))) attrs[m[1]] = m[2];
    return attrs;
  }

  function parseM3U(text) {
    const lines = text.replace(/\r/g, "").split("\n").map(x => x.trim()).filter(Boolean);
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

  function destroyHls() {
    if (state.hls) {
      try { state.hls.destroy(); } catch (_) {}
      state.hls = null;
    }
  }

  async function play(index) {
    const ch = state.channels[index];
    if (!ch) return;

    state.current = index;
    renderList();

    const video = $("#player");
    const status = $("#status");
    status.textContent = `Loading: ${ch.name}`;

    destroyHls();
    video.pause();
    video.removeAttribute("src");
    video.load();

    const url = ch.url;
    const lower = url.split("?")[0].toLowerCase();

    try {
      if (window.Hls && Hls.isSupported() && (lower.endsWith(".m3u8") || lower.includes(".m3u8"))) {
        state.hls = new Hls({
          maxBufferLength: 15,
          maxBufferSize: 15 * 2000000
        });
        state.hls.loadSource(url);
        state.hls.attachMedia(video);
        state.hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
          status.textContent = ch.name;
        });
        state.hls.on(Hls.Events.ERROR, (_, data) => {
          if (data?.fatal) status.textContent = `Stream error: ${data.details || "unknown"}`;
        });
      } else {
        video.src = url;
        video.addEventListener("loadedmetadata", () => {
          video.play().catch(() => {});
          status.textContent = ch.name;
        }, { once: true });
        video.addEventListener("error", () => {
          status.textContent = "Channel could not be played in this browser.";
        }, { once: true });
      }
    } catch (e) {
      status.textContent = `Playback error: ${e.message}`;
    }
  }

  function renderList() {
    const list = $("#channels");
    list.innerHTML = state.channels.map((ch, i) => `
      <button class="channel ${i === state.current ? "active" : ""}" data-i="${i}">
        ${ch.logo ? `<img src="${esc(ch.logo)}" alt="">` : ""}
        <span><b>${esc(ch.name)}</b><small>${esc(ch.group || "")}</small></span>
      </button>
    `).join("");

    list.querySelectorAll(".channel").forEach(btn => {
      btn.addEventListener("click", () => play(Number(btn.dataset.i)));
    });

    $("#count").textContent = `${state.channels.length} channels`;
  }

  function loadText(text) {
    const channels = parseM3U(text);
    state.channels = channels;
    state.current = -1;
    renderList();
    $("#status").textContent = channels.length
      ? `Loaded ${channels.length} channels`
      : "No valid EXTINF channels found";
    if (channels.length) play(0);
  }

  $("#load-url").addEventListener("click", async () => {
    const url = $("#playlist-url").value.trim();
    if (!url) return;
    $("#status").textContent = "Downloading playlist…";
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      loadText(await r.text());
    } catch (e) {
      $("#status").textContent =
        `Playlist download failed: ${e.message}. If CORS blocks it, download the M3U and use the file picker.`;
    }
  });

  $("#playlist-file").addEventListener("change", async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadText(await file.text());
  });

  $("#search").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll(".channel").forEach((el, i) => {
      const ch = state.channels[i];
      el.hidden = !(`${ch.name} ${ch.group}`.toLowerCase().includes(q));
    });
  });

  $("#fullscreen").addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) {}
  });

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && state.channels.length) {
      play((state.current - 1 + state.channels.length) % state.channels.length);
    }
    if (e.key === "ArrowDown" && state.channels.length) {
      play((state.current + 1) % state.channels.length);
    }
  });
})();
