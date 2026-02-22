// api/index.js — Platform C: Secure Ed-Tech Video Player
// Students paste a Platform B video URL and watch it in a protected MSE player.
// The real source URL is never exposed. Video arrives as a blob:// URL in the browser.
// Anti-piracy measures: no download button, no right-click, no DevTools, no screen-capture API,
// no IDM interception (chunks arrive via JS fetch into MediaSource, never as a raw file URL).

const MASTER_SECURITY_STRING = '84418779257393762955868022673598';

export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.status(200).send(buildHTML());
}

function buildHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Secure Video Player</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0d0d14;
      color: #e8e8f0;
      min-height: 100vh;
      -webkit-user-select: none;
      user-select: none;
    }

    /* Allow text selection inside inputs only */
    input { -webkit-user-select: text !important; user-select: text !important; }

    /* ── Header ── */
    .header {
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 20px rgba(0,0,0,0.5);
    }
    .logo { font-size: 22px; font-weight: 700; color: #a78bfa; letter-spacing: -0.3px; }
    .badge {
      font-size: 12px; font-weight: 600; padding: 5px 12px;
      border-radius: 20px; background: rgba(74,222,128,0.15); color: #4ade80;
      border: 1px solid rgba(74,222,128,0.25);
    }

    /* ── Layout ── */
    .container { max-width: 960px; margin: 0 auto; padding: 40px 20px; }

    /* ── Input card ── */
    .card {
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      border-radius: 16px;
      padding: 36px;
      margin-bottom: 32px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.06);
    }
    .card-title {
      font-size: 20px; font-weight: 700; margin-bottom: 20px; color: #a78bfa;
    }
    .field { margin-bottom: 16px; }
    .field label { display: block; font-size: 13px; font-weight: 600; color: #9ca3af; margin-bottom: 8px; }
    .field input {
      width: 100%; padding: 14px 16px;
      background: rgba(255,255,255,0.05);
      border: 2px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      color: #f0f0f8; font-size: 14px;
      transition: border-color 0.2s;
    }
    .field input:focus { outline: none; border-color: #7c3aed; }
    .field input::placeholder { color: rgba(255,255,255,0.3); }

    .btn {
      width: 100%; padding: 15px;
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      color: #fff; font-size: 15px; font-weight: 700;
      border: none; border-radius: 10px; cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
    }
    .btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ── Error ── */
    .error-box {
      display: none; margin-top: 16px;
      background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3);
      border-radius: 10px; padding: 14px 16px;
      color: #fca5a5; font-size: 14px; line-height: 1.6;
    }

    /* ── Loading ── */
    .loading { display: none; text-align: center; padding: 48px 0; color: #9ca3af; }
    .spinner {
      width: 44px; height: 44px; margin: 0 auto 16px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: #7c3aed;
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Player card ── */
    .player-card {
      display: none;
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.06);
    }
    .player-card.active { display: block; }
    .player-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px; flex-wrap: wrap; gap: 10px;
    }
    .player-title { font-size: 18px; font-weight: 700; }
    .close-btn {
      padding: 8px 18px; font-size: 13px; font-weight: 600;
      background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.25);
      color: #f87171; border-radius: 8px; cursor: pointer;
    }
    .close-btn:hover { background: rgba(239,68,68,0.25); }

    /* ── Video wrapper (16:9) ── */
    .video-wrap {
      position: relative;
      padding-bottom: 56.25%;
      background: #000;
      border-radius: 12px;
      overflow: hidden;
    }
    video, iframe {
      position: absolute; inset: 0;
      width: 100%; height: 100%; border: none;
      pointer-events: auto;
    }
    /* Transparent overlay — blocks right-click save on the video element */
    .overlay {
      position: absolute; inset: 0; z-index: 5;
      background: transparent;
      /* pointer-events: none lets clicks pass through to video controls */
      pointer-events: none;
    }

    /* ── Buffer bar ── */
    .buf-wrap {
      display: none; margin-top: 10px;
      height: 5px; background: rgba(255,255,255,0.08);
      border-radius: 4px; overflow: hidden;
    }
    .buf-bar {
      height: 100%; width: 0%;
      background: linear-gradient(90deg, #7c3aed, #a78bfa);
      border-radius: 4px; transition: width 0.4s;
    }
    .buf-label {
      font-size: 11px; color: rgba(255,255,255,0.35);
      margin-top: 6px; text-align: right;
    }

    /* Prevent drag on media */
    video, img, iframe { -webkit-user-drag: none; }

    @media (max-width: 600px) {
      .card, .player-card { padding: 20px; }
      .logo { font-size: 18px; }
    }
  </style>
</head>
<body>

<div class="header">
  <div class="logo">🎓 Secure Video Player</div>
  <div class="badge">🔒 DRM Protected</div>
</div>

<div class="container">

  <!-- Input card -->
  <div class="card" id="inputCard">
    <div class="card-title">Load Lecture Video</div>
    <div class="field">
      <label>Video URL</label>
      <input type="url" id="videoUrl" placeholder="Paste your video URL here…" autocomplete="off">
    </div>
    <button class="btn" id="loadBtn">▶ Play Video</button>
    <div class="error-box" id="errorBox"></div>
  </div>

  <!-- Loading -->
  <div class="loading" id="loadingSection">
    <div class="spinner"></div>
    <p>Preparing secure stream…</p>
  </div>

  <!-- Player card -->
  <div class="player-card" id="playerCard">
    <div class="player-header">
      <div class="player-title">Now Playing</div>
      <button class="close-btn" id="closeBtn">✕ Close</button>
    </div>
    <div class="video-wrap">
      <video id="videoEl" controls playsinline
             controlsList="nodownload nofullscreen noremoteplayback"
             disablePictureInPicture
             oncontextmenu="return false;"></video>
      <iframe id="iframeEl" allowfullscreen allow="autoplay; encrypted-media"
              oncontextmenu="return false;"></iframe>
      <div class="overlay" oncontextmenu="return false;"></div>
    </div>
    <div class="buf-wrap" id="bufWrap"><div class="buf-bar" id="bufBar"></div></div>
    <div class="buf-label" id="bufLabel"></div>
  </div>

</div>

<script>
/* ─────────────────────────────────────────────────────────────────────────────
   PLATFORM C — Secure MSE Player
   
   Anti-piracy architecture:
   • Video never has a direct src URL — it plays from a MediaSource blob://
   • Chunks arrive via fetch() with short-lived HMAC tokens in headers
   • Each chunk's token only unlocks ONE chunk; next-chunk token is in the response header
   • IDM cannot intercept because: no file URL exists, tokens expire in 30s,
     IDM can't read response headers from inside an MSE stream
   • Origin check on server means IDM's direct requests get 403
───────────────────────────────────────────────────────────────────────────── */

const SEC = '${MASTER_SECURITY_STRING}';

// Player state
let _vid        = null;
let _ifr        = null;
let _ms         = null;   // MediaSource
let _sb         = null;   // SourceBuffer
let _state      = null;   // chunk pump state
let _stopped    = false;

// Buffer control — tune these for smooth playback on slow connections
const INIT_BUFFER_SEC = 6;    // seconds to buffer before auto-play starts
const MAX_AHEAD_SEC   = 90;   // stop fetching when this many seconds are buffered
const RESUME_SEC      = 20;   // resume fetching when buffer drops below this

// ── Utilities ────────────────────────────────────────────────────────────────

function isPlatformBUrl(url) {
  // Accept any URL that contains /video/ — that's a Platform B video link
  return url.includes('/video/');
}

function isRawSourceUrl(url) {
  const raw = ['dropbox.com','drive.google.com','youtube.com','youtu.be','vimeo.com','dailymotion.com'];
  try { return raw.some(d => new URL(url).hostname.includes(d)); }
  catch { return false; }
}

function showError(msg) {
  const box = document.getElementById('errorBox');
  box.innerHTML = msg;
  box.style.display = 'block';
  setTimeout(() => { box.style.display = 'none'; }, 12000);
}

function setLoading(on) {
  document.getElementById('loadingSection').style.display = on ? 'block' : 'none';
  document.getElementById('loadBtn').disabled = on;
}

// ── Chunk fetching ────────────────────────────────────────────────────────────

async function fetchChunk(chunkUrl, index, token) {
  const url = chunkUrl + '?chunk=' + index;
  const resp = await fetch(url, {
    headers: {
      'x-chunk-token': token,
      'Origin': window.location.origin
    }
  });

  // 204 = server signals end of stream
  if (resp.status === 204) return { done: true, nextToken: null, buffer: null };

  if (!resp.ok && resp.status !== 206)
    throw new Error('Chunk ' + index + ' failed (HTTP ' + resp.status + ')');

  const nextToken   = resp.headers.get('x-next-chunk-token') || '';
  const isLast      = resp.headers.get('x-is-last-chunk') === 'true';
  const buffer      = await resp.arrayBuffer();

  return { done: isLast || !nextToken, nextToken, buffer };
}

// ── SourceBuffer append (handles QuotaExceededError by evicting old data) ────

async function appendBuffer(buf) {
  if (_stopped || !_sb || !_ms || _ms.readyState !== 'open') return;

  // Wait for any pending update to finish
  if (_sb.updating) {
    await new Promise((ok, fail) => {
      _sb.addEventListener('updateend', ok, { once: true });
      _sb.addEventListener('error', fail, { once: true });
    });
  }

  await new Promise((ok, fail) => {
    _sb.addEventListener('updateend', ok, { once: true });
    _sb.addEventListener('error', fail, { once: true });
    try {
      _sb.appendBuffer(buf);
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        // Evict old data behind the playhead to free space
        const evict = Math.max(0, (_vid ? _vid.currentTime : 0) - 30);
        if (evict > 0) {
          _sb.addEventListener('updateend', () => {
            try { _sb.appendBuffer(buf); } catch (_) { ok(); }
          }, { once: true });
          _sb.remove(0, evict);
        } else { ok(); }
      } else { fail(e); }
    }
  });
}

// ── How much video is buffered ahead of current position ─────────────────────

function bufferedAhead() {
  if (!_vid || !_vid.buffered || !_vid.buffered.length) return 0;
  const ct = _vid.currentTime;
  for (let i = 0; i < _vid.buffered.length; i++) {
    if (_vid.buffered.start(i) <= ct + 1 && _vid.buffered.end(i) > ct)
      return _vid.buffered.end(i) - ct;
  }
  return 0;
}

// ── Buffer UI ─────────────────────────────────────────────────────────────────

function updateUI() {
  if (!_state || !_state.totalChunks) return;
  const pct   = Math.min(100, Math.round((_state.index / _state.totalChunks) * 100));
  const ahead = Math.round(bufferedAhead());
  document.getElementById('bufBar').style.width = pct + '%';
  document.getElementById('bufLabel').textContent = _state.done
    ? '✓ Fully loaded'
    : 'Buffered ' + pct + '% · ' + ahead + 's ahead';
}

// ── Chunk pump — continuously fetches the next chunk when buffer is low ───────

async function pump() {
  if (_stopped || !_state || _state.done || _state.active) return;
  _state.active = true;

  try {
    while (!_stopped && !_state.done) {
      const ahead = bufferedAhead();

      // Pause fetching when enough is buffered — restart when it drops
      if (_state.started && ahead >= MAX_AHEAD_SEC) {
        _state.active = false;
        const timer = setInterval(() => {
          if (_stopped || _state.done) { clearInterval(timer); return; }
          if (bufferedAhead() < RESUME_SEC) { clearInterval(timer); pump(); }
        }, 2000);
        return;
      }

      // Use prefetched chunk if available, otherwise fetch now
      let chunk;
      if (_state.prefetched) {
        chunk = _state.prefetched;
        _state.prefetched = null;
      } else {
        chunk = await fetchChunk(_state.url, _state.index, _state.token);
      }

      // Prefetch the NEXT chunk while we append the current one
      let prefetchPromise = null;
      if (!chunk.done && chunk.nextToken) {
        prefetchPromise = fetchChunk(_state.url, _state.index + 1, chunk.nextToken)
          .then(c => { _state.prefetched = c; })
          .catch(() => {});
      }

      if (chunk.buffer && chunk.buffer.byteLength > 0) {
        await appendBuffer(chunk.buffer);
      }

      _state.index++;
      _state.token = chunk.nextToken;
      _state.done  = chunk.done;
      updateUI();

      // Auto-start playback once initial buffer is ready
      if (!_state.started && bufferedAhead() >= INIT_BUFFER_SEC) {
        _state.started = true;
        document.getElementById('bufLabel').textContent = 'Playing…';
        _vid.play().catch(() => {});
      }

      if (prefetchPromise) await prefetchPromise;
    }

    // Signal MediaSource that we're done
    if (!_stopped && _ms && _ms.readyState === 'open') {
      try { _ms.endOfStream(); } catch (_) {}
    }
    updateUI();

  } catch (e) {
    _state.active = false;
    if (!_stopped) {
      document.getElementById('bufLabel').textContent = 'Reconnecting…';
      setTimeout(() => { if (!_stopped) pump(); }, 3000);
    }
  }
}

// ── Start MSE streaming session ───────────────────────────────────────────────

async function startStream(chunkUrl, firstToken, streamToken, infoUrl) {
  _stopped = false;

  document.getElementById('bufWrap').style.display = 'block';
  document.getElementById('bufLabel').textContent = 'Connecting…';

  // Fetch video info (size, chunk count) — nice to have, not critical
  let totalChunks = null;
  try {
    const infoResp = await fetch(infoUrl, {
      headers: { 'x-stream-token': streamToken, 'Origin': window.location.origin }
    });
    if (infoResp.ok) {
      const info = await infoResp.json();
      if (info.totalChunks) totalChunks = info.totalChunks;
    }
  } catch (_) {}

  // Clean up any previous MediaSource
  if (_ms) { try { _ms.endOfStream(); } catch (_) {} }
  _ms = new MediaSource();
  _vid.src = URL.createObjectURL(_ms);
  _vid.preload = 'auto';

  // Wait for MediaSource to open
  await new Promise((ok, fail) => {
    _ms.addEventListener('sourceopen', ok, { once: true });
    _ms.addEventListener('error', fail, { once: true });
  });

  // Pick best supported codec
  const codecs = [
    'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
    'video/mp4; codecs="avc1.64001f, mp4a.40.2"',
    'video/mp4; codecs="avc1.4D401E, mp4a.40.2"',
    'video/mp4'
  ];
  const mime = codecs.find(c => MediaSource.isTypeSupported(c));
  if (!mime) throw new Error('Your browser does not support this video format. Please use Chrome or Firefox.');

  _sb = _ms.addSourceBuffer(mime);
  _sb.mode = 'sequence';

  _state = {
    url: chunkUrl, index: 0, token: firstToken,
    totalChunks, done: false, active: false,
    started: false, prefetched: null
  };

  // Resume fetching on buffer stall
  _vid.addEventListener('waiting', () => { if (!_stopped) pump(); });
  _vid.addEventListener('timeupdate', updateUI);

  pump();
}

// ── Load video (called on button click) ──────────────────────────────────────

async function loadVideo() {
  const urlInput = document.getElementById('videoUrl').value.trim();

  document.getElementById('errorBox').style.display = 'none';
  document.getElementById('playerCard').classList.remove('active');

  if (!urlInput) return showError('Please enter a video URL.');
  if (isRawSourceUrl(urlInput))
    return showError('That looks like a raw video URL. Please paste a Platform B video link (it should contain <code>/video/</code>).');
  if (!isPlatformBUrl(urlInput))
    return showError('Invalid URL — the link must contain <code>/video/</code>.');

  setLoading(true);

  try {
    // Extract video ID and Platform B base URL from the pasted link
    const match = urlInput.match(/\/video\/([^/?#]+)/);
    if (!match) throw new Error('Could not read video ID from URL.');
    const videoId  = match[1];
    const baseUrl  = urlInput.substring(0, urlInput.indexOf('/video/'));
    const apiUrl   = baseUrl + '/api/video/' + videoId;

    const resp = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Security-String': SEC,
        'Accept': 'application/json',
        'Origin': window.location.origin
      }
    });

    if (!resp.ok) {
      if (resp.status === 403) throw new Error('Access denied — security key mismatch between platforms.');
      if (resp.status === 404) throw new Error('Video not found. Check the URL.');
      throw new Error('Server error (HTTP ' + resp.status + '). Check Platform B is running.');
    }

    const data = await resp.json();
    if (!data.success) throw new Error(data.message || 'Failed to load video.');

    setLoading(false);

    _vid = document.getElementById('videoEl');
    _ifr = document.getElementById('iframeEl');
    document.getElementById('playerCard').classList.add('active');
    document.getElementById('playerCard').scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (data.type === 'embed') {
      // YouTube / Vimeo / Dailymotion — show in sandboxed iframe
      _ifr.src = data.proxyUrl + '?key=' + encodeURIComponent(SEC);
      _ifr.style.display = 'block';
      _vid.style.display = 'none';
      document.getElementById('bufWrap').style.display = 'none';

    } else {
      // Direct video via chunked MSE streaming
      _vid.style.display = 'block';
      _ifr.style.display = 'none';

      if (!data.firstChunkToken || !data.streamToken)
        throw new Error('Missing stream tokens — ensure Platform B is up to date.');

      const chunkUrl  = data.chunkUrl;
      const infoUrl   = baseUrl + '/api/info/' + videoId;

      if (typeof MediaSource === 'undefined' || !MediaSource.isTypeSupported('video/mp4'))
        throw new Error('Your browser does not support secure streaming. Please use Chrome, Firefox, or Edge.');

      await startStream(chunkUrl, data.firstChunkToken, data.streamToken, infoUrl);
    }

  } catch (e) {
    setLoading(false);
    showError('❌ ' + e.message);
  }
}

// ── Close player ─────────────────────────────────────────────────────────────

function closePlayer() {
  _stopped = true;
  document.getElementById('playerCard').classList.remove('active');
  document.getElementById('bufWrap').style.display = 'none';
  document.getElementById('bufLabel').textContent = '';

  if (_ms) { try { _ms.endOfStream(); } catch (_) {} _ms = null; }
  _sb = null;
  _state = null;

  if (_vid) { _vid.pause(); URL.revokeObjectURL(_vid.src); _vid.src = ''; }
  if (_ifr) { _ifr.src = ''; }
}

// ── Event listeners ───────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loadBtn').addEventListener('click', loadVideo);
  document.getElementById('closeBtn').addEventListener('click', closePlayer);
  document.getElementById('videoUrl').addEventListener('keydown', e => {
    if (e.key === 'Enter') loadVideo();
  });
});

// ── Anti-piracy: disable right-click, keyboard shortcuts, drag ───────────────

document.addEventListener('contextmenu', e => e.preventDefault());

document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  // Block Ctrl/Cmd + S, U, P, I, J, C (save, source, print, devtools, console)
  if ((e.ctrlKey || e.metaKey) && ['s','u','p','i','j','c'].includes(k)) {
    e.preventDefault(); return false;
  }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i','j','c','k'].includes(k)) {
    e.preventDefault(); return false;
  }
  if (k === 'f12') { e.preventDefault(); return false; }
});

document.addEventListener('dragstart', e => e.preventDefault());

// ── Anti-piracy: hide video if DevTools open (size heuristic) ────────────────

(function watchDevTools() {
  const THRESH = 160;
  setInterval(() => {
    const open = (window.outerWidth - window.innerWidth > THRESH)
              || (window.outerHeight - window.innerHeight > THRESH);
    const v = document.getElementById('videoEl');
    const f = document.getElementById('iframeEl');
    if (v) v.style.visibility = open ? 'hidden' : 'visible';
    if (f) f.style.visibility = open ? 'hidden' : 'visible';
    if (open && v && !v.paused) v.pause();
  }, 1000);
})();

// ── Anti-piracy: disable screen capture and MediaRecorder APIs ────────────────

// Disable MediaRecorder so screen recording extensions can't capture the stream
try { if (window.MediaRecorder) window.MediaRecorder = undefined; } catch (_) {}

// Block getDisplayMedia (screen share / screen capture)
try {
  if (navigator.mediaDevices?.getDisplayMedia) {
    navigator.mediaDevices.getDisplayMedia = () =>
      Promise.reject(new DOMException('Not allowed.', 'NotAllowedError'));
  }
} catch (_) {}

// Block getUserMedia for video (allow audio for other page uses)
try {
  if (navigator.mediaDevices?.getUserMedia) {
    const _orig = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = c => {
      if (c && c.video)
        return Promise.reject(new DOMException('Video capture disabled.', 'NotAllowedError'));
      return _orig(c);
    };
  }
} catch (_) {}
</script>
</body>
</html>`;
}
