# TUNER — web build

Static, deployable IPTV/M3U player. Entry point: `index.html`.

## Deploy
Push this folder to a GitHub Pages repo (or Netlify/Vercel/Cloudflare Pages).
All paths are relative, so it works both at `username.github.io` and
`username.github.io/repo-name/`. No build step needed.

## What's new in this build
- **Remote/keyboard channel zapping without opening the list**: Arrow
  Up/Down, Page Up/Page Down, mouse-wheel (desktop), and several common
  Smart TV remote key codes (LG webOS Channel Up/Down, legacy PageUp/Down
  33/34, VIDAA/Hisense via `pm3u-control-vidaa.js`) all change the channel
  directly. Press **Enter/OK** to open the channel list when you actually
  want to browse; **Escape/Back** closes it again.
- **Touch swipe up/down** on the video area zaps channels on phones/tablets
  (swipe up = next, swipe down = previous — a short hint animates on first
  touch and disappears after the first swipe).
- **On-screen channel card**: large logo/number/name shown briefly on every
  change, sized to read comfortably from a couch/TV distance, then fades out.
- **Playlists are saved permanently** in the browser (`localStorage`) —
  add a playlist once (URL or `.m3u`/`.m3u8` file) and it reloads
  automatically next time, no re-entering a URL every visit. The **gear
  icon** opens the playlist manager: add more playlists, switch the active
  one, or delete one. URL playlists are refreshed live on load and fall
  back to the last saved copy if the network/CORS blocks the request.
- Visual refresh: cleaner topbar/list/OSD, auto-hiding chrome when idle,
  focus rings sized for remote navigation.

## Keys / gestures
| Input | Action |
|---|---|
| ↑ / Page Up / mouse-wheel up | Next channel |
| ↓ / Page Down / mouse-wheel down | Previous channel |
| Enter | Open channel list |
| Esc / Back | Close list / exit fullscreen |
| ↑ / ↓ (list open) | Move highlight in list |
| ← / → | Volume down / up |
| 0–9 | Type a channel number, jumps after a short pause |
| Space | Play/Pause |
| F | Fullscreen |
| Swipe up / down (touch) | Next / previous channel |

## About the other files under `assets/js` / `assets/css`
This repo was originally a source dump from the PlayM3U-PRO Android app's
WebView UI layer, not a standalone web app. Digging into it for this build:

- **`pm3u-control-vidaa.js`** — now actually wired in (`index.html` seeds
  `window.aButtons` before loading it) and its VIDAA/Hisense channel-up/down
  key codes feed directly into the new zap handler above.
- **`pm3u-lang.js`** — was entirely disabled (wrapped in one giant unclosed
  `/* … */` comment, so the `i18n` object never existed at runtime). That
  wrapper is removed here so it loads for real; a few `i18n.*.en` strings
  are now used for UI hints/messages. Only the English entries are wired
  in — the file has other languages but the app has no language switcher
  yet.
- **`pm3u-control.js`, `pm3u-epg.js`, `pm3u-player.js`, `pm3u-playlist.js`**
  — these are not usable standalone even after removing their own disabled
  preambles: the "live" code in them calls hundreds of functions/DOM ids
  that only exist in the original app's full runtime (a `getEl()` helper,
  an EPG/XMLTV worker pipeline, an Xtream-Codes API layer, a bootstrap that
  never shipped with this dump). Getting them running would mean
  rebuilding most of that missing app, not patching this package. They're
  left in the repo untouched as reference source, but `index.html` doesn't
  load them — the equivalent day-to-day features (channel list, zapping,
  channel-info OSD, persistent playlists) are reimplemented natively in
  `assets/js/app.js` instead.
- **`pm3u-setting.js`** — intentionally left out. It redirects to a
  `../settings/index.html` page that isn't part of this package, depends on
  the native Android bridge (`m3uConnector`) and Tizen's `webapis`, and
  contains a remote license check that `eval()`s a server response — not
  something to ship in a public static site. Kept only as reference.
- **`pm3u-player.css`, `pm3u-epg.css`, `pm3u-control.css`** — styled for
  the elements/ids used by the files above, which aren't in this page, so
  they're not linked from `index.html` (they were being loaded before but
  doing nothing). The new `assets/css/app.css` reuses the same brand colors
  (`--theme-*` / `--bg-*` tokens) so the look stays consistent.

## Known limitations
- A browser can't set restricted request headers (`Referer`, `User-Agent`)
  from `fetch()`/HLS requests. If a stream needs a specific one, the stream
  server needs to allow the plain browser request (CORS), or you need a
  small server-side proxy.
- Very large playlists (many thousands of channels) are cached in
  `localStorage`, which has a small quota (usually a few MB per origin). If
  saving fails you'll still be able to watch, it just won't be cached
  offline — keep the original URL as a fallback.
- `hls.js` / `dash.js` load from public CDNs. For a fully offline/self-hosted
  build, download them and point the `<script>` tags in `index.html` at a
  local copy.
