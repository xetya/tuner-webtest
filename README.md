# TUNER deploy package

## Deploy
Upload the contents of this folder to a GitHub Pages repository, Cloudflare Pages, Netlify, Vercel, or another static host.

Entry point:

`index.html`

## Included source
The supplied PM3U JavaScript/CSS files are preserved under:

- `assets/js/`
- `assets/css/`

A standalone browser layer is provided as `assets/js/app.js`.

## Important limitation
The supplied PM3U files are not a complete standalone web application. They reference additional runtime code/APIs that were not included in the uploaded files, including the original database/bootstrap/runtime layer, workers, settings UI, device connectors, and platform-specific APIs.

Therefore the package does **not** pretend to reproduce the original PM3U application 1:1. The `index.html` uses a small standalone browser implementation so the package can actually be deployed and used for M3U/HLS playback.

## Browser header limitation
A normal browser page cannot freely set restricted HTTP request headers such as `Referer` or `User-Agent` from JavaScript `fetch()`/HLS requests. If a stream requires a specific Referer/User-Agent, the stream server must allow the browser request (CORS), or a permitted server-side/proxy/native integration is needed.

## External libraries
The browser build loads HLS.js and dash.js from their public CDNs. For a completely self-contained/offline build, download and vendor those libraries locally and change the `<script>` tags in `index.html`.
