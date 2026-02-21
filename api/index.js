// api/index.js - Platform C Player (serverless handler for Vercel)
// IMPORTANT: MASTER_SECURITY_STRING must match Platform B exactly

const MASTER_SECURITY_STRING = '84418779257393762955868022673598';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // The entire Platform C UI is served as HTML from this handler.
  // The <script> block below implements the chunked MediaSource player.
  // There is no src URL visible to IDM — video data arrives via fetch()
  // into a MediaSource buffer, which is exposed to <video> as a blob:// URL.

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Platform C - Video Player Pro</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0a; color: white; min-height: 100vh;
        }
        .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; box-shadow: 0 2px 20px rgba(0,0,0,0.5); }
        .header-content { max-width: 1400px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; }
        .logo { font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .status { background: rgba(76,175,80,0.2); color: #4caf50; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .container { max-width: 1400px; margin: 0 auto; padding: 40px 20px; }
        .input-section { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; border-radius: 20px; margin-bottom: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
        .input-title { font-size: 24px; font-weight: 700; margin-bottom: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .instructions { background: rgba(102,126,234,0.1); border-left: 4px solid #667eea; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; line-height: 1.6; }
        .instructions strong { color: #667eea; }
        input[type="url"] { width: 100%; padding: 16px 20px; background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.1); border-radius: 12px; color: white; font-size: 15px; margin-bottom: 20px; }
        input:focus { outline: none; border-color: #667eea; }
        input::placeholder { color: rgba(255,255,255,0.4); }
        .btn { padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s; width: 100%; }
        .btn:hover:not(:disabled) { transform: translateY(-2px); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .video-section { display: none; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 20px; }
        .video-section.active { display: block; }
        .video-header { display: flex; justify-content: space-between; margin-bottom: 25px; align-items: center; flex-wrap: wrap; gap: 10px; }
        .video-title { font-size: 22px; font-weight: 700; }
        .close-btn { padding: 10px 20px; background: rgba(255,59,48,0.2); border: 1px solid rgba(255,59,48,0.3); color: #ff3b30; border-radius: 10px; cursor: pointer; font-weight: 600; border: none; }
        .close-btn:hover { background: rgba(255,59,48,0.3); }
        .player-wrapper { position: relative; padding-bottom: 56.25%; height: 0; background: #000; border-radius: 16px; overflow: hidden; }
        video, iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
        .buffer-bar-wrap { margin-top: 12px; background: rgba(255,255,255,0.08); border-radius: 6px; height: 6px; overflow: hidden; }
        .buffer-bar { height: 100%; width: 0%; background: linear-gradient(90deg, #667eea, #764ba2); border-radius: 6px; transition: width 0.3s; }
        .buffer-label { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 5px; text-align: right; }
        .error { background: rgba(244,67,54,0.2); padding: 16px; border-radius: 12px; margin-top: 20px; color: #f44336; border: 1px solid rgba(244,67,54,0.3); line-height: 1.8; }
        .error strong { color: #ff6b6b; }
        .error code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; display: inline-block; }
        .loading { text-align: center; padding: 60px; color: rgba(255,255,255,0.6); display: none; }
        .spinner { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #667eea; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .security-badge { background: rgba(76,175,80,0.2); color: #4caf50; padding: 8px 16px; border-radius: 8px; font-size: 12px; margin-top: 15px; border: 1px solid rgba(76,175,80,0.3); }
        * { -webkit-user-select: none; -moz-user-select: none; user-select: none; }
        input[type="url"] { -webkit-user-select: text; -moz-user-select: text; user-select: text; }
        video, img, iframe { -webkit-user-drag: none; user-drag: none; }
        .video-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; background: transparent; pointer-events: none; }
        @media (max-width: 768px) { .input-section { padding: 20px; } .logo { font-size: 24px; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <div class="logo">🎬 Video Player Pro</div>
            <div class="status">🔒 Fully Protected</div>
        </div>
    </div>
    <div class="container">
        <div class="input-section">
            <div class="input-title">Load Your Secure Video</div>
            <div class="instructions">
                <strong>📋 How to use:</strong><br>
                1️⃣ Go to <strong>Platform B</strong> first<br>
                2️⃣ Generate a video URL there<br>
                3️⃣ Copy the URL (looks like: <code>https://platform-b.../video/abc123</code>)<br>
                4️⃣ Paste it below and click Load Video
            </div>
            <input type="url" id="videoUrl" placeholder="Paste Platform B video URL here...">
            <button class="btn" id="loadBtn">▶️ Load Video</button>
            <div class="security-badge">🛡️ Original URLs never exposed</div>
            <div id="error" class="error" style="display: none;"></div>
        </div>
        <div id="loadingSection" class="loading">
            <div class="spinner"></div>
            <p>Loading secure stream...</p>
        </div>
        <div id="videoSection" class="video-section">
            <div class="video-header">
                <div class="video-title">Now Playing</div>
                <button class="close-btn" id="closeBtn">✕ Close</button>
            </div>
            <div class="player-wrapper">
                <video id="videoPlayer" controls playsinline
                       controlsList="nodownload nofullscreen noremoteplayback"
                       disablePictureInPicture oncontextmenu="return false;"></video>
                <iframe id="iframePlayer" allowfullscreen allow="autoplay" oncontextmenu="return false;"></iframe>
                <div class="video-overlay" oncontextmenu="return false;"></div>
            </div>
            <div class="buffer-bar-wrap" id="bufferWrap" style="display:none;">
                <div class="buffer-bar" id="bufferBar"></div>
            </div>
            <div class="buffer-label" id="bufferLabel"></div>
        </div>
    </div>

    <script>
        const SEC = '${MASTER_SECURITY_STRING}';
        let vid = null;
        let ifr = null;
        let _mediaSource = null;
        let _sourceBuffer = null;
        let _chunkState = null;

        function normalizeUrl(url) {
            return url.replace(/([^:])\\\/\\\/+/g, '$1/');
        }

        function isRawVideoUrl(url) {
            const rawDomains = ['dropbox.com','drive.google.com','youtube.com','youtu.be','vimeo.com','dailymotion.com'];
            try { const u = new URL(url); return rawDomains.some(d => u.hostname.includes(d)); }
            catch { return false; }
        }

        async function fetchChunk(chunkUrl, chunkIndex, chunkToken) {
            const url = chunkUrl + '?chunk=' + chunkIndex;
            const response = await fetch(url, {
                headers: { 'x-chunk-token': chunkToken, 'Origin': window.location.origin }
            });
            if (response.status === 204) return { done: true, nextToken: null, buffer: null };
            if (!response.ok && response.status !== 206)
                throw new Error('Chunk fetch failed: ' + response.status);
            const nextToken   = response.headers.get('x-next-chunk-token') || '';
            const isLastChunk = response.headers.get('x-is-last-chunk') === 'true';
            const buffer      = await response.arrayBuffer();
            return { done: isLastChunk || !nextToken, nextToken, buffer };
        }

        async function startChunkedStream(chunkUrl, firstChunkToken, streamToken, infoUrl) {
            let totalChunks = null;
            try {
                const infoRes = await fetch(infoUrl, {
                    headers: { 'x-stream-token': streamToken, 'Origin': window.location.origin }
                });
                if (infoRes.ok) {
                    const info = await infoRes.json();
                    if (info.totalChunks) totalChunks = info.totalChunks;
                }
            } catch (_) {}

            const bufWrap  = document.getElementById('bufferWrap');
            const bufBar   = document.getElementById('bufferBar');
            const bufLabel = document.getElementById('bufferLabel');
            if (totalChunks) { bufWrap.style.display = 'block'; bufLabel.textContent = 'Buffering...'; }

            if (_mediaSource) { try { _mediaSource.endOfStream(); } catch (_) {} }
            _mediaSource = new MediaSource();
            vid.src = URL.createObjectURL(_mediaSource);

            await new Promise((resolve, reject) => {
                _mediaSource.addEventListener('sourceopen', resolve, { once: true });
                _mediaSource.addEventListener('error', reject, { once: true });
            });

            let mimeType = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
            if (!MediaSource.isTypeSupported(mimeType)) mimeType = 'video/mp4';
            if (!MediaSource.isTypeSupported(mimeType)) throw new Error('MSE_UNSUPPORTED');

            _sourceBuffer = _mediaSource.addSourceBuffer(mimeType);
            _sourceBuffer.mode = 'sequence';

            _chunkState = { chunkUrl, currentToken: firstChunkToken, chunkIndex: 0, totalChunks, done: false };

            async function pumpChunks() {
                if (_chunkState.done) {
                    try { _mediaSource.endOfStream(); } catch (_) {}
                    bufLabel.textContent = 'Fully loaded';
                    return;
                }
                if (_sourceBuffer.updating) {
                    await new Promise(r => _sourceBuffer.addEventListener('updateend', r, { once: true }));
                }
                try {
                    const { done, nextToken, buffer } = await fetchChunk(
                        _chunkState.chunkUrl, _chunkState.chunkIndex, _chunkState.currentToken
                    );
                    if (buffer && buffer.byteLength > 0) {
                        await new Promise((resolve, reject) => {
                            _sourceBuffer.addEventListener('updateend', resolve, { once: true });
                            _sourceBuffer.addEventListener('error', reject, { once: true });
                            try { _sourceBuffer.appendBuffer(buffer); } catch (e) { reject(e); }
                        });
                    }
                    _chunkState.chunkIndex++;
                    _chunkState.currentToken = nextToken;
                    _chunkState.done = done;
                    if (totalChunks) {
                        const pct = Math.min(100, Math.round((_chunkState.chunkIndex / totalChunks) * 100));
                        bufBar.style.width = pct + '%';
                        bufLabel.textContent = 'Buffered: ' + pct + '%';
                    }
                    pumpChunks();
                } catch (e) {
                    if (!_chunkState.done) setTimeout(pumpChunks, 1000);
                }
            }
            pumpChunks();
        }

        async function loadVideo() {
            const url  = document.getElementById('videoUrl').value.trim();
            const err  = document.getElementById('error');
            const load = document.getElementById('loadingSection');
            const sec  = document.getElementById('videoSection');
            vid = document.getElementById('videoPlayer');
            ifr = document.getElementById('iframePlayer');
            const btn  = document.getElementById('loadBtn');

            if (!url) { err.innerHTML = '❌ <strong>Please enter a video URL</strong>'; err.style.display = 'block'; return; }
            if (isRawVideoUrl(url)) {
                err.innerHTML = '❌ <strong>Wrong URL Type!</strong><br><br>Go to <strong>Platform B</strong> first, generate a URL there, then paste it here.';
                err.style.display = 'block'; return;
            }
            if (!url.includes('/video/')) {
                err.innerHTML = '❌ <strong>Invalid URL</strong> — must contain <code>/video/</code>';
                err.style.display = 'block'; return;
            }

            err.style.display = 'none';
            sec.classList.remove('active');
            load.style.display = 'block';
            btn.disabled = true;

            try {
                const videoMatch = url.match(/\\/video\\/([^/?#]+)/);
                if (!videoMatch) throw new Error('Could not extract video ID from URL');
                const videoId = videoMatch[1];
                const baseUrl = url.substring(0, url.indexOf('/video/'));
                const apiUrl  = normalizeUrl(baseUrl + '/api/video/' + videoId);

                const res = await fetch(apiUrl, {
                    method: 'GET',
                    headers: { 'X-Security-String': SEC, 'Content-Type': 'application/json', 'Accept': 'application/json', 'Origin': window.location.origin }
                });

                if (!res.ok) {
                    if (res.status === 403) throw new Error('Access denied — security key mismatch');
                    if (res.status === 404) throw new Error('Video not found');
                    if (res.status === 500) throw new Error('Server error — check Platform B');
                    throw new Error('Failed to fetch video (Status: ' + res.status + ')');
                }

                const data = await res.json();
                if (!data.success) throw new Error(data.message || 'Failed to load video');

                load.style.display = 'none';
                sec.classList.add('active');
                btn.disabled = false;

                if (data.type === 'embed') {
                    ifr.src = normalizeUrl(data.proxyUrl) + '?key=' + encodeURIComponent(SEC);
                    ifr.style.display = 'block';
                    vid.style.display = 'none';
                    document.getElementById('bufferWrap').style.display = 'none';
                } else {
                    vid.style.display = 'block';
                    ifr.style.display = 'none';
                    const chunkUrl        = normalizeUrl(data.chunkUrl);
                    const firstChunkToken = data.firstChunkToken;
                    const streamToken     = data.streamToken;
                    const infoUrl         = normalizeUrl(baseUrl + '/api/info/' + videoId);

                    if (!firstChunkToken || !streamToken) throw new Error('Missing tokens — ensure Platform B is updated');

                    if (typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported('video/mp4')) {
                        try {
                            await startChunkedStream(chunkUrl, firstChunkToken, streamToken, infoUrl);
                        } catch (mseErr) {
                            // MSE not supported for this codec — fall back to direct token URL
                            vid.src = chunkUrl + '?chunk=0&chunkToken=' + encodeURIComponent(firstChunkToken);
                            vid.load();
                        }
                    } else {
                        vid.src = chunkUrl + '?chunk=0&chunkToken=' + encodeURIComponent(firstChunkToken);
                        vid.load();
                    }
                }
            } catch (e) {
                load.style.display = 'none';
                err.innerHTML = '❌ <strong>Error:</strong> ' + e.message;
                err.style.display = 'block';
                btn.disabled = false;
            }
        }

        function closeVideo() {
            document.getElementById('videoSection').classList.remove('active');
            document.getElementById('bufferWrap').style.display = 'none';
            document.getElementById('bufferLabel').textContent = '';
            if (_mediaSource) { try { _mediaSource.endOfStream(); } catch (_) {} _mediaSource = null; _sourceBuffer = null; }
            if (_chunkState) { _chunkState.done = true; _chunkState = null; }
            if (vid) { vid.pause(); vid.src = ''; }
            if (ifr) { ifr.src = ''; }
        }

        document.addEventListener('DOMContentLoaded', function () {
            document.getElementById('loadBtn').addEventListener('click', loadVideo);
            document.getElementById('closeBtn').addEventListener('click', closeVideo);
            document.getElementById('videoUrl').addEventListener('keypress', function (e) { if (e.key === 'Enter') loadVideo(); });
            const errorEl = document.getElementById('error');
            const observer = new MutationObserver(function () {
                if (errorEl.style.display === 'block') setTimeout(() => { errorEl.style.display = 'none'; }, 10000);
            });
            observer.observe(errorEl, { attributes: true, attributeFilter: ['style'] });
        });

        document.addEventListener('contextmenu', e => { e.preventDefault(); return false; });
        document.addEventListener('keydown', function (e) {
            const key = e.key.toLowerCase();
            if ((e.ctrlKey || e.metaKey) && ['s','u','p','i','j','c'].includes(key)) { e.preventDefault(); return false; }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i','j','c'].includes(key)) { e.preventDefault(); return false; }
            if (e.key === 'F12' || e.key === 'PrintScreen') { e.preventDefault(); return false; }
        });
        document.addEventListener('dragstart', e => { e.preventDefault(); return false; });

        (function detectDevTools() {
            const threshold = 160;
            function check() {
                const wDiff = window.outerWidth - window.innerWidth;
                const hDiff = window.outerHeight - window.innerHeight;
                const v = document.getElementById('videoPlayer');
                const f = document.getElementById('iframePlayer');
                if (wDiff > threshold || hDiff > threshold) {
                    if (v && !v.paused) v.pause();
                    if (v) v.style.visibility = 'hidden';
                    if (f) f.style.visibility = 'hidden';
                } else {
                    if (v) v.style.visibility = 'visible';
                    if (f) f.style.visibility = 'visible';
                }
            }
            setInterval(check, 1000);
        })();

        if (window.MediaRecorder) window.MediaRecorder = undefined;
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia = () =>
                Promise.reject(new DOMException('Screen capture is disabled.', 'NotAllowedError'));
        }
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const _orig = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
            navigator.mediaDevices.getUserMedia = function (c) {
                if (c && c.video) return Promise.reject(new DOMException('Video capture is disabled.', 'NotAllowedError'));
                return _orig(c);
            };
        }
    <\/script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
