// api/index.js - Platform C Player
// CHANGE THIS to match Platform B's security string
const MASTER_SECURITY_STRING = '84418779257393762955868022673598';

export default function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Player Pro</title>
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
            margin-bottom: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
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
        .video-header { display: flex; justify-content: space-between; margin-bottom: 25px; }
        .video-title { font-size: 22px; font-weight: 700; }
        .close-btn {
            padding: 10px 20px;
            background: rgba(255,59,48,0.2);
            border: 1px solid rgba(255,59,48,0.3);
            color: #ff3b30;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
        }
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
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
        }
        .error {
            background: rgba(244, 67, 54, 0.2);
            padding: 16px;
            border-radius: 12px;
            margin-top: 20px;
            color: #f44336;
            border: 1px solid rgba(244, 67, 54, 0.3);
        }
        .loading { text-align: center; padding: 60px; color: rgba(255,255,255,0.6); }
        .spinner {
            border: 3px solid rgba(255,255,255,0.1);
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 50px;
            height: 50px;
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
            <input 
                type="url" 
                id="videoUrl" 
                placeholder="Paste your encrypted video URL..."
                onkeypress="if(event.key==='Enter')loadVideo()"
            >
            <button class="btn" onclick="loadVideo()" id="loadBtn">▶️ Load Video</button>
            <div class="security-badge">🛡️ Original URLs never exposed</div>
            <div id="error" class="error" style="display: none;"></div>
        </div>

        <div id="loadingSection" class="loading" style="display: none;">
            <div class="spinner"></div>
            <p>Loading secure stream...</p>
        </div>

        <div id="videoSection" class="video-section">
            <div class="video-header">
                <div class="video-title">Now Playing</div>
                <button class="close-btn" onclick="closeVideo()">✕ Close</button>
            </div>
            <div class="player-wrapper">
                <video id="videoPlayer" controls playsinline preload="auto"></video>
                <iframe id="iframePlayer" allowfullscreen allow="autoplay"></iframe>
            </div>
        </div>
    </div>

    <script>
        const SEC = '${MASTER_SECURITY_STRING}';
        let vid = null;
        let ifr = null;

        async function loadVideo() {
            const url = document.getElementById('videoUrl').value.trim();
            const err = document.getElementById('error');
            const load = document.getElementById('loadingSection');
            const sec = document.getElementById('videoSection');
            vid = document.getElementById('videoPlayer');
            ifr = document.getElementById('iframePlayer');
            const btn = document.getElementById('loadBtn');

            if (!url || !url.includes('/video/')) {
                err.textContent = '❌ Invalid URL';
                err.style.display = 'block';
                return;
            }

            err.style.display = 'none';
            sec.classList.remove('active');
            load.style.display = 'block';
            btn.disabled = true;

            try {
                const parts = url.split('/');
                const id = parts[parts.length - 1];
                const base = url.substring(0, url.lastIndexOf('/video/'));
                
                const res = await fetch(base + '/api/video/' + id, {
                    headers: { 'X-Security-String': SEC }
                });
                
                if (!res.ok) throw new Error('Failed to fetch: ' + res.status);
                
                const data = await res.json();
                if (!data.success) throw new Error(data.message || 'Failed');

                const proxyUrl = data.proxyUrl + '?key=' + encodeURIComponent(SEC);
                
                if (data.type === 'embed') {
                    ifr.src = proxyUrl;
                    ifr.style.display = 'block';
                    vid.style.display = 'none';
                } else {
                    vid.style.display = 'block';
                    ifr.style.display = 'none';
                    vid.src = proxyUrl;
                }

                load.style.display = 'none';
                sec.classList.add('active');
                btn.disabled = false;
            } catch (e) {
                load.style.display = 'none';
                err.textContent = '❌ ' + e.message;
                err.style.display = 'block';
                btn.disabled = false;
            }
        }

        function closeVideo() {
            document.getElementById('videoSection').classList.remove('active');
            if (vid) {
                vid.pause();
                vid.src = '';
            }
            if (ifr) ifr.src = '';
        }
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
