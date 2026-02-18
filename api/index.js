// api/index.js - Platform C Player
// This is the serverless function version for Platform C

// IMPORTANT: This MUST match Platform B's MASTER_SECURITY_STRING
const MASTER_SECURITY_STRING = '84418779257393762955868022673598';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Platform C - Video Player Pro</title>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js"><\/script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0a;
            color: white;
            min-height: 100vh;
        }
        .header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 20px;
            box-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }
        .header-content {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
        }
        .logo {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .status {
            background: rgba(76, 175, 80, 0.2);
            color: #4caf50;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .container { max-width: 1400px; margin: 0 auto; padding: 40px 20px; }
        .input-section {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 40px;
            border-radius: 20px;
            margin-bottom: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .input-title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .instructions {
            background: rgba(102, 126, 234, 0.1);
            border-left: 4px solid #667eea;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            line-height: 1.6;
        }
        .instructions strong { color: #667eea; }
        input[type="url"] {
            width: 100%;
            padding: 16px 20px;
            background: rgba(255,255,255,0.05);
            border: 2px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            color: white;
            font-size: 15px;
            margin-bottom: 20px;
        }
        input:focus { outline: none; border-color: #667eea; }
        input::placeholder { color: rgba(255,255,255,0.4); }
        .btn {
            padding: 16px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
            width: 100%;
        }
        .btn:hover:not(:disabled) { transform: translateY(-2px); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .video-section {
            display: none;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 30px;
            border-radius: 20px;
        }
        .video-section.active { display: block; }
        .video-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            flex-wrap: wrap;
            gap: 10px;
        }
        .video-title { font-size: 22px; font-weight: 700; }
        .close-btn {
            padding: 10px 20px;
            background: rgba(255,59,48,0.2);
            border: 1px solid rgba(255,59,48,0.3);
            color: #ff3b30;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            border: none;
        }
        .close-btn:hover { background: rgba(255,59,48,0.3); }
        .player-wrapper {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            background: #000;
            border-radius: 16px;
            overflow: hidden;
        }
        video, iframe {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            border: none;
        }
        .error {
            background: rgba(244, 67, 54, 0.2);
            padding: 16px;
            border-radius: 12px;
            margin-top: 20px;
            color: #f44336;
            border: 1px solid rgba(244, 67, 54, 0.3);
            line-height: 1.8;
        }
        .error strong { color: #ff6b6b; }
        .error code {
            background: rgba(255,255,255,0.1);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            display: inline-block;
        }
        .loading {
            text-align: center;
            padding: 60px;
            color: rgba(255,255,255,0.6);
            display: none;
        }
        .spinner {
            border: 3px solid rgba(255,255,255,0.1);
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 50px; height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .security-badge {
            background: rgba(76, 175, 80, 0.2);
            color: #4caf50;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 12px;
            margin-top: 15px;
            border: 1px solid rgba(76, 175, 80, 0.3);
        }
        /* DRM protections */
        * {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        input[type="url"] {
            -webkit-user-select: text;
            -moz-user-select: text;
            user-select: text;
        }
        video, img, iframe {
            -webkit-user-drag: none;
            user-drag: none;
        }
        .video-overlay {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            z-index: 10;
            background: transparent;
            pointer-events: none;
        }
        @media (max-width: 768px) {
            .input-section { padding: 20px; }
            .logo { font-size: 24px; }
        }
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
                <video id="videoPlayer" controls playsinline preload="auto"
                       controlsList="nodownload nofullscreen noremoteplayback"
                       disablePictureInPicture
                       oncontextmenu="return false;"></video>
                <iframe id="iframePlayer" allowfullscreen allow="autoplay"
                        oncontextmenu="return false;"></iframe>
                <div class="video-overlay" oncontextmenu="return false;"></div>
            </div>
        </div>
    </div>

    <script>
        const SEC = '${MASTER_SECURITY_STRING}';
        let vid = null;
        let ifr = null;

        function normalizeUrl(url) {
            return url.replace(/([^:]\/\/+)/g, m => m[0] + m.slice(1).replace(/\\/+/g, '/'));
        }

        function isRawVideoUrl(url) {
            const rawDomains = ['dropbox.com', 'drive.google.com', 'youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com'];
            try {
                const urlObj = new URL(url);
                return rawDomains.some(domain => urlObj.hostname.includes(domain));
            } catch { return false; }
        }

        async function loadVideo() {
            const url  = document.getElementById('videoUrl').value.trim();
            const err  = document.getElementById('error');
            const load = document.getElementById('loadingSection');
            const sec  = document.getElementById('videoSection');
            vid = document.getElementById('videoPlayer');
            ifr = document.getElementById('iframePlayer');
            const btn  = document.getElementById('loadBtn');

            if (!url) {
                err.innerHTML = '❌ <strong>Please enter a video URL</strong>';
                err.style.display = 'block';
                return;
            }

            if (isRawVideoUrl(url)) {
                err.innerHTML = \`❌ <strong>Wrong URL Type!</strong><br><br>
                    You pasted a direct video URL. Please go to <strong>Platform B</strong> first,
                    generate a URL there, then paste that URL here.\`;
                err.style.display = 'block';
                return;
            }

            if (!url.includes('/video/')) {
                err.innerHTML = \`❌ <strong>Invalid URL Format</strong><br><br>
                    The URL must be from Platform B and contain <code>/video/</code>\`;
                err.style.display = 'block';
                return;
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
                    headers: {
                        'X-Security-String': SEC,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Origin': window.location.origin
                    }
                });

                if (!res.ok) {
                    if (res.status === 403) throw new Error('Security key mismatch - Check your configuration');
                    if (res.status === 404) throw new Error('Video not found - The video ID may be incorrect');
                    if (res.status === 500) throw new Error('Server error - Check Platform B logs');
                    throw new Error('Failed to fetch video (Status: ' + res.status + ')');
                }

                const data = await res.json();
                if (!data.success) throw new Error(data.message || 'Failed to load video');

                const proxyUrl = normalizeUrl(data.proxyUrl);

                if (data.type === 'embed') {
                    ifr.src = proxyUrl + '?key=' + encodeURIComponent(SEC);
                    ifr.style.display = 'block';
                    vid.style.display = 'none';
                } else {
                    vid.style.display = 'block';
                    ifr.style.display = 'none';

                    const streamToken = data.streamToken;

                    if (window._hlsInstance) {
                        window._hlsInstance.destroy();
                        window._hlsInstance = null;
                    }

                    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                        const hls = new Hls({
                            xhrSetup: function (xhr) {
                                xhr.setRequestHeader('x-stream-token', streamToken);
                            },
                            enableWorker: true,
                            lowLatencyMode: false
                        });
                        hls.loadSource(proxyUrl);
                        hls.attachMedia(vid);
                        window._hlsInstance = hls;
                    } else if (vid.canPlayType('application/vnd.apple.mpegurl')) {
                        vid.src = proxyUrl + '?token=' + encodeURIComponent(streamToken);
                    } else {
                        vid.src = proxyUrl + '?token=' + encodeURIComponent(streamToken);
                    }
                }

                load.style.display = 'none';
                sec.classList.add('active');
                btn.disabled = false;

            } catch (e) {
                load.style.display = 'none';
                err.innerHTML = '❌ <strong>Error:</strong> ' + e.message;
                err.style.display = 'block';
                btn.disabled = false;
            }
        }

        function closeVideo() {
            document.getElementById('videoSection').classList.remove('active');
            if (window._hlsInstance) {
                window._hlsInstance.destroy();
                window._hlsInstance = null;
            }
            if (vid) { vid.pause(); vid.src = ''; }
            if (ifr) { ifr.src = ''; }
        }

        document.addEventListener('DOMContentLoaded', function () {
            document.getElementById('loadBtn').addEventListener('click', loadVideo);
            document.getElementById('closeBtn').addEventListener('click', closeVideo);
            document.getElementById('videoUrl').addEventListener('keypress', function (e) {
                if (e.key === 'Enter') loadVideo();
            });

            const errorEl = document.getElementById('error');
            const observer = new MutationObserver(function () {
                if (errorEl.style.display === 'block') {
                    setTimeout(() => { errorEl.style.display = 'none'; }, 10000);
                }
            });
            observer.observe(errorEl, { attributes: true, attributeFilter: ['style'] });
        });

        // ── DRM Protections ──

        document.addEventListener('contextmenu', function (e) {
            e.preventDefault(); return false;
        });

        document.addEventListener('keydown', function (e) {
            const key = e.key.toLowerCase();
            const blockedWithCtrl = ['s', 'u', 'p', 'i', 'j', 'c'];
            if ((e.ctrlKey || e.metaKey) && blockedWithCtrl.includes(key)) {
                e.preventDefault(); return false;
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i','j','c'].includes(key)) {
                e.preventDefault(); return false;
            }
            if (e.key === 'F12' || e.key === 'PrintScreen') {
                e.preventDefault(); return false;
            }
        });

        document.addEventListener('dragstart', function (e) {
            e.preventDefault(); return false;
        });

        (function detectDevTools() {
            const threshold = 160;
            function check() {
                const wDiff = window.outerWidth  - window.innerWidth;
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
            navigator.mediaDevices.getDisplayMedia = function () {
                return Promise.reject(new DOMException('Screen capture is disabled.', 'NotAllowedError'));
            };
        }

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const _orig = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
            navigator.mediaDevices.getUserMedia = function (constraints) {
                if (constraints && constraints.video) {
                    return Promise.reject(new DOMException('Video capture is disabled.', 'NotAllowedError'));
                }
                return _orig(constraints);
            };
        }
    <\/script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
