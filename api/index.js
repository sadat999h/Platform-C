// api/index.js - Platform C Player - COMPLETE FINAL VERSION
// This is the serverless function version for Platform C

// IMPORTANT: This MUST match Platform B's MASTER_SECURITY_STRING
const MASTER_SECURITY_STRING = '06942188162472527188672293629719';

export default function handler(req, res) {
  // Set CORS headers for the API route
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
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
            
            <input 
                type="url" 
                id="videoUrl" 
                placeholder="Paste Platform B video URL here..."
            >
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
                <video id="videoPlayer" controls playsinline preload="auto"></video>
                <iframe id="iframePlayer" allowfullscreen allow="autoplay"></iframe>
            </div>
        </div>
    </div>

    <script>
        // ⚠️ CRITICAL: This MUST match Platform B's MASTER_SECURITY_STRING
        const SEC = '${MASTER_SECURITY_STRING}';
        
        let vid = null;
        let ifr = null;

        // Normalize URL - remove double slashes
        function normalizeUrl(url) {
            return url.replace(/([^:]\/)\/+/g, '$1');
        }

        // Detect raw video URLs
        function isRawVideoUrl(url) {
            const rawDomains = ['dropbox.com', 'drive.google.com', 'youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com'];
            try {
                const urlObj = new URL(url);
                return rawDomains.some(domain => urlObj.hostname.includes(domain));
            } catch {
                return false;
            }
        }

        async function loadVideo() {
            const url = document.getElementById('videoUrl').value.trim();
            const err = document.getElementById('error');
            const load = document.getElementById('loadingSection');
            const sec = document.getElementById('videoSection');
            vid = document.getElementById('videoPlayer');
            ifr = document.getElementById('iframePlayer');
            const btn = document.getElementById('loadBtn');

            if (!url) {
                err.innerHTML = '❌ <strong>Please enter a video URL</strong>';
                err.style.display = 'block';
                return;
            }

            // Check if user pasted raw video URL
            if (isRawVideoUrl(url)) {
                err.innerHTML = \`
                    ❌ <strong>Wrong URL Type!</strong><br><br>
                    You pasted a <strong>direct video URL</strong> (Dropbox, YouTube, etc.)<br><br>
                    <strong>Correct Process:</strong><br>
                    1️⃣ Go to <strong>Platform B</strong><br>
                    2️⃣ Paste your video URL there<br>
                    3️⃣ Click "Generate URL"<br>
                    4️⃣ Copy the generated Platform B URL<br>
                    5️⃣ Come back here and paste it<br><br>
                    <strong>Platform B URL example:</strong><br>
                    <code>https://platform-b.vercel.app/video/abc123def456...</code>
                \`;
                err.style.display = 'block';
                return;
            }

            if (!url.includes('/video/')) {
                err.innerHTML = \`
                    ❌ <strong>Invalid URL Format</strong><br><br>
                    The URL must be from Platform B and contain <code>/video/</code><br><br>
                    <strong>Example:</strong> <code>https://platform-b.vercel.app/video/abc123</code>
                \`;
                err.style.display = 'block';
                return;
            }

            err.style.display = 'none';
            sec.classList.remove('active');
            load.style.display = 'block';
            btn.disabled = true;

            try {
                const videoMatch = url.match(/\\/video\\/([^/?#]+)/);
                if (!videoMatch) {
                    throw new Error('Could not extract video ID from URL');
                }
                
                const videoId = videoMatch[1];
                const baseUrl = url.substring(0, url.indexOf('/video/'));
                const apiUrl = normalizeUrl(baseUrl + '/api/video/' + videoId);
                
                console.log('🎬 Fetching:', apiUrl);
                console.log('🆔 Video ID:', videoId);
                
                const res = await fetch(apiUrl, {
                    method: 'GET',
                    headers: { 
                        'X-Security-String': SEC,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Origin': window.location.origin
                    }
                });
                
                console.log('📡 Response status:', res.status);
                
                if (!res.ok) {
                    if (res.status === 403) {
                        throw new Error('Security key mismatch - Check your configuration');
                    } else if (res.status === 404) {
                        throw new Error('Video not found - The video ID may be incorrect');
                    } else if (res.status === 500) {
                        throw new Error('Server error - Check Platform B logs');
                    }
                    throw new Error('Failed to fetch video (Status: ' + res.status + ')');
                }
                
                const data = await res.json();
                console.log('📦 Response data:', data);
                
                if (!data.success) {
                    throw new Error(data.message || 'Failed to load video');
                }

                const proxyUrl = normalizeUrl(data.proxyUrl) + '?key=' + encodeURIComponent(SEC);
                
                console.log('🔗 Proxy URL:', proxyUrl);
                console.log('📺 Type:', data.type);
                console.log('🎯 Platform:', data.platform);
                
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
                
                console.log('✅ Video loaded successfully!');
                
            } catch (e) {
                console.error('❌ Error:', e);
                load.style.display = 'none';
                err.innerHTML = '❌ <strong>Error:</strong> ' + e.message;
                err.style.display = 'block';
                btn.disabled = false;
            }
        }

        function closeVideo() {
            console.log('🛑 Closing video');
            document.getElementById('videoSection').classList.remove('active');
            if (vid) {
                vid.pause();
                vid.src = '';
            }
            if (ifr) ifr.src = '';
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 Platform C Video Player initialized');
            console.log('🔑 Security string configured:', SEC);
            
            document.getElementById('loadBtn').addEventListener('click', loadVideo);
            document.getElementById('closeBtn').addEventListener('click', closeVideo);
            
            document.getElementById('videoUrl').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    loadVideo();
                }
            });

            // Auto-hide errors after 10 seconds
            const errorEl = document.getElementById('error');
            const observer = new MutationObserver(function() {
                if (errorEl.style.display === 'block') {
                    setTimeout(() => {
                        errorEl.style.display = 'none';
                    }, 10000);
                }
            });
            observer.observe(errorEl, { attributes: true, attributeFilter: ['style'] });
        });
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
