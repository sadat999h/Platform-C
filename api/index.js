// api/index.js — Platform C serverless handler
// Serves the entire player UI as HTML.
// Player uses native <video src> — browser handles byte-range requests,
// giving instant seeking with zero JavaScript buffering code.

const MASTER_SECURITY_STRING = '84418779257393762955868022673598';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Platform C - Video Player Pro</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fff; min-height: 100vh; }
        .header { background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 20px; box-shadow: 0 2px 20px rgba(0,0,0,.5); }
        .header-content { max-width: 1400px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
        .logo { font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .badge { background: rgba(76,175,80,.2); color: #4caf50; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .container { max-width: 1400px; margin: 0 auto; padding: 40px 20px; }
        .card { background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 20px; padding: 40px; margin-bottom: 32px; box-shadow: 0 10px 40px rgba(0,0,0,.3); }
        .card-title { font-size: 24px; font-weight: 700; margin-bottom: 10px; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .instructions { background: rgba(102,126,234,.1); border-left: 4px solid #667eea; padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; line-height: 1.7; }
        .instructions strong { color: #667eea; }
        .instructions code { background: rgba(255,255,255,.1); padding: 1px 5px; border-radius: 4px; font-family: monospace; font-size: 13px; }
        input[type="url"] { width: 100%; padding: 16px 20px; background: rgba(255,255,255,.05); border: 2px solid rgba(255,255,255,.1); border-radius: 12px; color: #fff; font-size: 15px; margin-bottom: 20px; transition: border-color .2s; }
        input:focus { outline: none; border-color: #667eea; }
        input::placeholder { color: rgba(255,255,255,.35); }
        .btn { padding: 16px 40px; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform .2s, opacity .2s; width: 100%; }
        .btn:hover:not(:disabled) { transform: translateY(-2px); }
        .btn:disabled { opacity: .55; cursor: not-allowed; }
        .sec-badge { display: inline-block; background: rgba(76,175,80,.15); color: #4caf50; border: 1px solid rgba(76,175,80,.3); padding: 7px 16px; border-radius: 8px; font-size: 12px; margin-top: 14px; }
        .error { background: rgba(244,67,54,.15); border: 1px solid rgba(244,67,54,.3); color: #f44336; padding: 14px 18px; border-radius: 12px; margin-top: 16px; display: none; line-height: 1.6; }
        #videoSection { display: none; }
        #videoSection.active { display: block; }
        .player-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; flex-wrap: wrap; gap: 10px; }
        .player-title { font-size: 22px; font-weight: 700; }
        .close-btn { padding: 9px 20px; background: rgba(255,59,48,.18); color: #ff3b30; border: 1px solid rgba(255,59,48,.25); border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; }
        .close-btn:hover { background: rgba(255,59,48,.3); }
        .player-wrap { position: relative; padding-bottom: 56.25%; height: 0; background: #000; border-radius: 16px; overflow: hidden; }
        video, iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }
        .overlay { position: absolute; inset: 0; z-index: 10; background: transparent; pointer-events: none; }
        .token-bar-wrap { margin-top: 10px; background: rgba(255,255,255,.06); border-radius: 6px; height: 4px; overflow: hidden; }
        .token-bar { height: 100%; background: linear-gradient(90deg, #4caf50, #8bc34a); border-radius: 6px; transition: width 1s linear; }
        .token-label { font-size: 11px; color: rgba(255,255,255,.35); margin-top: 5px; text-align: right; }
        #loadingSection { display: none; text-align: center; padding: 60px; color: rgba(255,255,255,.55); }
        .spinner { width: 50px; height: 50px; border: 3px solid rgba(255,255,255,.1); border-top-color: #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 18px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { -webkit-user-select: none; -moz-user-select: none; user-select: none; }
        input[type="url"] { -webkit-user-select: text; -moz-user-select: text; user-select: text; }
        video, img, iframe { -webkit-user-drag: none; user-drag: none; }
        @media (max-width: 768px) { .card { padding: 20px; } .logo { font-size: 22px; } }
    </style>
</head>
<body>
<div class="header">
    <div class="header-content">
        <div class="logo">🎬 Video Player Pro</div>
        <div class="badge">🔒 Fully Protected</div>
    </div>
</div>
<div class="container">
    <div class="card">
        <div class="card-title">Load Your Secure Video</div>
        <div class="instructions">
            <strong>📋 How to use:</strong><br>
            1️⃣ Go to <strong>Platform B</strong> and generate a video URL<br>
            2️⃣ Copy the URL — looks like <code>https://platform-b…/video/abc123</code><br>
            3️⃣ Paste it below and click Load Video
        </div>
        <input type="url" id="videoUrl" placeholder="Paste Platform B video URL here…">
        <button class="btn" id="loadBtn">▶️ Load Video</button>
        <div class="sec-badge">🛡️ Original URLs never exposed · Stream tokens expire in 2h</div>
        <div class="error" id="error"></div>
    </div>
    <div id="loadingSection">
        <div class="spinner"></div>
        <p>Connecting to secure stream…</p>
    </div>
    <div id="videoSection" class="card">
        <div class="player-header">
            <div class="player-title">Now Playing</div>
            <button class="close-btn" id="closeBtn">✕ Close</button>
        </div>
        <div class="player-wrap">
            <video id="videoPlayer" controls playsinline preload="metadata"
                   controlsList="nodownload nofullscreen noremoteplayback"
                   disablePictureInPicture oncontextmenu="return false;"></video>
            <iframe id="iframePlayer" allowfullscreen allow="autoplay" oncontextmenu="return false;"></iframe>
            <div class="overlay" oncontextmenu="return false;"></div>
        </div>
        <div class="token-bar-wrap" id="tokenBarWrap" style="display:none">
            <div class="token-bar" id="tokenBar" style="width:100%"></div>
        </div>
        <div class="token-label" id="tokenLabel"></div>
    </div>
</div>
<script>
    const SEC = '${MASTER_SECURITY_STRING}';
    let _tokenTimer = null, _videoId = null, _baseUrl = null;

    function norm(u) { return u.replace(/([^:])\\\/\\\/+/g, '$1/'); }
    function isRaw(u) {
        try { const h = new URL(u).hostname; return ['dropbox','drive.google','youtube','youtu.be','vimeo','dailymotion'].some(d => h.includes(d)); }
        catch { return false; }
    }
    function showErr(m) {
        const e = document.getElementById('error');
        e.innerHTML = '❌ ' + m;
        e.style.display = 'block';
        setTimeout(() => { e.style.display = 'none'; }, 9000);
    }

    function startTokenBar(sec) {
        const end = Date.now() + sec * 1000;
        const bar = document.getElementById('tokenBar');
        const lbl = document.getElementById('tokenLabel');
        document.getElementById('tokenBarWrap').style.display = 'block';
        bar.style.width = '100%';
        clearInterval(_tokenTimer);
        _tokenTimer = setInterval(async () => {
            const rem = Math.max(0, end - Date.now());
            bar.style.width = (rem / (sec * 1000) * 100) + '%';
            const m = Math.floor(rem / 60000), s = Math.floor((rem % 60000) / 1000);
            lbl.textContent = rem > 0 ? 'Token valid: ' + (m > 0 ? m + 'm ' : '') + s + 's' : 'Token expired';
            if (rem < 5 * 60 * 1000 && rem > 0) await refreshToken();
            if (rem <= 0) clearInterval(_tokenTimer);
        }, 1000);
    }

    async function refreshToken() {
        if (!_videoId || !_baseUrl) return;
        const vid = document.getElementById('videoPlayer');
        try {
            const r = await fetch(norm(_baseUrl + '/api/video/' + _videoId), { headers: { 'X-Security-String': SEC } });
            if (!r.ok) return;
            const d = await r.json();
            if (!d.success || d.type !== 'video') return;
            const t = vid.currentTime, playing = !vid.paused;
            vid.src = d.streamUrl;
            vid.load();
            vid.currentTime = t;
            if (playing) vid.play().catch(() => {});
        } catch (_) {}
    }

    async function loadVideo() {
        const url = document.getElementById('videoUrl').value.trim();
        const btn = document.getElementById('loadBtn');
        const load = document.getElementById('loadingSection');
        const sec  = document.getElementById('videoSection');
        const vid  = document.getElementById('videoPlayer');
        const ifr  = document.getElementById('iframePlayer');

        document.getElementById('error').style.display = 'none';

        if (!url) { showErr('Please enter a URL'); return; }
        if (isRaw(url)) { showErr('Wrong URL — paste the Platform B /video/ URL, not a direct source URL'); return; }
        if (!url.includes('/video/')) { showErr('Invalid URL — must contain <code>/video/</code>'); return; }

        sec.classList.remove('active');
        load.style.display = 'block';
        btn.disabled = true;
        clearInterval(_tokenTimer);

        try {
            const m = url.match(/\\/video\\/([^/?#]+)/);
            if (!m) throw new Error('Could not extract video ID');
            _videoId = m[1];
            _baseUrl = url.substring(0, url.indexOf('/video/'));

            const r = await fetch(norm(_baseUrl + '/api/video/' + _videoId), {
                headers: { 'X-Security-String': SEC, 'Accept': 'application/json' }
            });
            if (r.status === 403) throw new Error('Access denied — check security key');
            if (r.status === 404) throw new Error('Video not found');
            if (!r.ok)            throw new Error('Server error ' + r.status);
            const data = await r.json();
            if (!data.success)    throw new Error(data.message || 'Failed to load');

            load.style.display = 'none';
            sec.classList.add('active');
            btn.disabled = false;

            if (data.type === 'embed') {
                ifr.src = norm(data.proxyUrl) + '?key=' + encodeURIComponent(SEC);
                ifr.style.display = 'block';
                vid.style.display = 'none';
                document.getElementById('tokenBarWrap').style.display = 'none';
                document.getElementById('tokenLabel').textContent = '';
            } else {
                vid.style.display = 'block';
                ifr.style.display = 'none';
                vid.src = data.streamUrl;
                vid.load();
                startTokenBar(data.tokenExpiresIn || 7200);
            }
        } catch (e) {
            load.style.display = 'none';
            btn.disabled = false;
            showErr(e.message);
        }
    }

    function closeVideo() {
        clearInterval(_tokenTimer);
        const vid = document.getElementById('videoPlayer');
        const ifr = document.getElementById('iframePlayer');
        document.getElementById('videoSection').classList.remove('active');
        document.getElementById('tokenBarWrap').style.display = 'none';
        document.getElementById('tokenLabel').textContent = '';
        if (vid) { vid.pause(); vid.removeAttribute('src'); vid.load(); }
        if (ifr) ifr.src = '';
        _videoId = _baseUrl = null;
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('loadBtn') .addEventListener('click',   loadVideo);
        document.getElementById('closeBtn').addEventListener('click',   closeVideo);
        document.getElementById('videoUrl').addEventListener('keypress', e => { if (e.key === 'Enter') loadVideo(); });
    });

    document.addEventListener('contextmenu', e => { e.preventDefault(); return false; });
    document.addEventListener('keydown', e => {
        const k = e.key.toLowerCase();
        if ((e.ctrlKey || e.metaKey) && ['s','u','p','i','j','c'].includes(k)) { e.preventDefault(); return false; }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i','j','c'].includes(k)) { e.preventDefault(); return false; }
        if (['f12','printscreen'].includes(k)) { e.preventDefault(); return false; }
        if (e.metaKey && k === 'g') { e.preventDefault(); return false; }
    });
    document.addEventListener('dragstart', e => { e.preventDefault(); return false; });
    document.addEventListener('visibilitychange', () => {
        const v = document.getElementById('videoPlayer');
        if (v && document.hidden) v.pause();
    });
    if (navigator.mediaDevices) {
        try { Object.defineProperty(navigator.mediaDevices, 'getDisplayMedia', { configurable: false, writable: false, value: () => Promise.reject(new DOMException('Not allowed', 'NotAllowedError')) }); } catch (_) {}
        try {
            const _g = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
            Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable: false, writable: false, value: c => c?.video ? Promise.reject(new DOMException('Not allowed', 'NotAllowedError')) : _g(c) });
        } catch (_) {}
    }
    try { Object.defineProperty(window, 'MediaRecorder', { configurable: false, writable: false, value: function() { throw new DOMException('Disabled', 'NotSupportedError'); } }); } catch (_) {}
    (function() {
        let open = false;
        setInterval(() => {
            const isOpen = window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160;
            const v = document.getElementById('videoPlayer'), f = document.getElementById('iframePlayer');
            if (isOpen && !open) { open = true; if (v) { v.pause(); v.style.visibility = 'hidden'; } if (f) f.style.visibility = 'hidden'; }
            else if (!isOpen && open) { open = false; if (v) v.style.visibility = 'visible'; if (f) f.style.visibility = 'visible'; }
        }, 800);
    })();
<\/script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}
