//api/index.js Platform C - FULLY SECURE (Zero URL Exposure)

export default function handler(req, res) {
  const securityString = process.env.MASTER_SECURITY_STRING || '__SECURITY_STRING__';
  
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
            user-select: none;
            -webkit-user-select: none;
        }
        .header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 20px 0;
            box-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }
        .header-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 20px;
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
        .status-badge {
            background: rgba(76, 175, 80, 0.2);
            color: #4caf50;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            border: 1px solid rgba(76, 175, 80, 0.3);
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
        input[type="url"]:focus { outline: none; border-color: #667eea; background: rgba(255,255,255,0.08); }
        input[type="url"]::placeholder { color: rgba(255,255,255,0.4); }
        .btn {
            padding: 16px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
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
        .video-section.active { display: block; animation: fadeIn 0.5s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .video-header { display: flex; justify-content: space-between; margin-bottom: 25px; align-items: center; }
        .video-title { font-size: 22px; font-weight: 700; }
        .close-btn {
            padding: 10px 20px;
            background: rgba(255,59,48,0.2);
            border: 1px solid rgba(255,59,48,0.3);
            color: #ff3b30;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
        }
        .close-btn:hover { background: rgba(255,59,48,0.3); }
        .player-wrapper {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            background: #000;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        }
        video, iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
        }
        video { 
            object-fit: contain;
        }
        video::-webkit-media-controls-panel {
            display: none !important;
        }
        .custom-controls {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 50%, transparent 100%);
            padding: 60px 20px 20px;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 10;
        }
        .player-wrapper:hover .custom-controls,
        .custom-controls.show { opacity: 1; }
        .progress-container {
            width: 100%;
            height: 6px;
            background: rgba(255,255,255,0.2);
            border-radius: 3px;
            margin-bottom: 15px;
            cursor: pointer;
            position: relative;
        }
        .progress-container:hover { height: 8px; }
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 3px;
            width: 0%;
            position: relative;
        }
        .progress-bar::after {
            content: '';
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 14px;
            height: 14px;
            background: white;
            border-radius: 50%;
            opacity: 0;
            transition: opacity 0.2s;
        }
        .progress-container:hover .progress-bar::after { opacity: 1; }
        .controls-row { 
            display: flex; 
            align-items: center; 
            gap: 15px;
            flex-wrap: wrap;
        }
        .control-btn {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            transition: transform 0.2s, opacity 0.2s;
            padding: 5px;
        }
        .control-btn:hover { transform: scale(1.1); opacity: 0.8; }
        .time { 
            color: white; 
            font-size: 14px; 
            min-width: 110px;
            font-weight: 500;
        }
        .volume-group { 
            display: flex; 
            gap: 10px; 
            align-items: center;
        }
        .controls-right {
            margin-left: auto;
            display: flex;
            gap: 15px;
            align-items: center;
        }
        input[type="range"] {
            width: 100px;
            margin: 0;
            height: 4px;
            background: rgba(255,255,255,0.2);
            border-radius: 2px;
            outline: none;
            -webkit-appearance: none;
        }
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            background: white;
            cursor: pointer;
            border-radius: 50%;
        }
        input[type="range"]::-moz-range-thumb {
            width: 14px;
            height: 14px;
            background: white;
            cursor: pointer;
            border-radius: 50%;
            border: none;
        }
        .settings-menu {
            position: absolute;
            bottom: 70px;
            right: 20px;
            background: rgba(20, 20, 30, 0.98);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 10px 0;
            min-width: 180px;
            display: none;
            z-index: 20;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        .settings-menu.show { display: block; animation: slideUp 0.2s; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .menu-section {
            padding: 8px 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .menu-section:last-child { border-bottom: none; }
        .menu-title {
            padding: 8px 16px;
            font-size: 11px;
            font-weight: 700;
            color: rgba(255,255,255,0.5);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .menu-item {
            padding: 10px 16px;
            cursor: pointer;
            transition: background 0.2s;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
        }
        .menu-item:hover { background: rgba(255,255,255,0.1); }
        .menu-item.active {
            background: rgba(102, 126, 234, 0.2);
            color: #667eea;
        }
        .menu-item .check {
            opacity: 0;
            font-size: 16px;
        }
        .menu-item.active .check { opacity: 1; }
        .error {
            background: rgba(244, 67, 54, 0.2);
            padding: 16px;
            border-radius: 12px;
            margin-top: 20px;
            color: #f44336;
            border: 1px solid rgba(244, 67, 54, 0.3);
        }
        .loading { 
            text-align: center; 
            padding: 60px; 
            color: rgba(255,255,255,0.6); 
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
        video::-webkit-media-controls { display: none !important; }
        video::-webkit-media-controls-enclosure { display: none !important; }
        .buffer-indicator {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: none;
        }
        .buffer-indicator.show { display: block; }
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
<body oncontextmenu="return false;">
    <div class="header">
        <div class="header-content">
            <div class="logo">🎬 Video Player Pro</div>
            <div class="status-badge">🔒 Fully Protected</div>
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
            <div class="security-badge">🛡️ Original URLs are never exposed to your browser</div>
            <div id="error" class="error" style="display: none;"></div>
        </div>

        <div id="loadingSection" class="loading" style="display: none;">
            <div class="spinner"></div>
            <p>Loading secure stream...</p>
        </div>

        <div id="videoSection" class="video-section">
            <div class="video-header">
                <div class="video-title">Now Playing (Secured)</div>
                <button class="close-btn" onclick="closeVideo()">✕ Close</button>
            </div>
            <div class="player-wrapper" id="playerWrapper">
                <video 
                    id="videoPlayer" 
                    playsinline 
                    preload="auto"
                    oncontextmenu="return false;"
                    controlsList="nodownload nofullscreen noremoteplayback"
                    disablePictureInPicture
                    crossorigin="anonymous"
                ></video>
                <iframe id="iframePlayer" allowfullscreen allow="autoplay; encrypted-media" sandbox="allow-scripts allow-same-origin"></iframe>
                
                <div class="buffer-indicator" id="bufferIndicator">
                    <div class="spinner"></div>
                </div>
                
                <div class="custom-controls" id="customControls">
                    <div class="progress-container" id="progressContainer">
                        <div class="progress-bar" id="progressBar"></div>
                    </div>
                    <div class="controls-row">
                        <button class="control-btn" id="playBtn" title="Play/Pause">▶️</button>
                        <button class="control-btn" id="skipBackBtn" title="Skip 10s back">⏪</button>
                        <button class="control-btn" id="skipForwardBtn" title="Skip 10s forward">⏩</button>
                        <span class="time" id="timeDisplay">0:00 / 0:00</span>
                        <div class="controls-right">
                            <div class="volume-group">
                                <button class="control-btn" id="volumeBtn" title="Mute/Unmute">🔊</button>
                                <input type="range" id="volumeSlider" min="0" max="100" value="100" title="Volume">
                            </div>
                            <button class="control-btn" id="settingsBtn" title="Settings">⚙️</button>
                            <button class="control-btn" id="fullscreenBtn" title="Fullscreen">⛶</button>
                        </div>
                    </div>
                </div>

                <div class="settings-menu" id="settingsMenu">
                    <div class="menu-section">
                        <div class="menu-title">Playback Speed</div>
                        <div class="menu-item" onclick="setSpeed(0.25)" data-speed="0.25">
                            <span>0.25x</span>
                            <span class="check">✓</span>
                        </div>
                        <div class="menu-item" onclick="setSpeed(0.5)" data-speed="0.5">
                            <span>0.5x</span>
                            <span class="check">✓</span>
                        </div>
                        <div class="menu-item" onclick="setSpeed(0.75)" data-speed="0.75">
                            <span>0.75x</span>
                            <span class="check">✓</span>
                        </div>
                        <div class="menu-item active" onclick="setSpeed(1)" data-speed="1">
                            <span>Normal</span>
                            <span class="check">✓</span>
                        </div>
                        <div class="menu-item" onclick="setSpeed(1.25)" data-speed="1.25">
                            <span>1.25x</span>
                            <span class="check">✓</span>
                        </div>
                        <div class="menu-item" onclick="setSpeed(1.5)" data-speed="1.5">
                            <span>1.5x</span>
                            <span class="check">✓</span>
                        </div>
                        <div class="menu-item" onclick="setSpeed(1.75)" data-speed="1.75">
                            <span>1.75x</span>
                            <span class="check">✓</span>
                        </div>
                        <div class="menu-item" onclick="setSpeed(2)" data-speed="2">
                            <span>2x</span>
                            <span class="check">✓</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Disable developer tools
        (function() {
            document.addEventListener('keydown', (e) => {
                // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
                if (e.keyCode === 123 || 
                    (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
                    (e.ctrlKey && e.keyCode === 85)) {
                    e.preventDefault();
                    return false;
                }
            });
        })();

        const SEC = '${securityString}';
        let vid = null;
        let ifr = null;
        let controlsTimeout = null;

        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('selectstart', e => e.preventDefault());
        document.addEventListener('copy', e => e.preventDefault());

        async function loadVideo() {
            const url = document.getElementById('videoUrl').value.trim();
            const err = document.getElementById('error');
            const load = document.getElementById('loadingSection');
            const sec = document.getElementById('videoSection');
            vid = document.getElementById('videoPlayer');
            ifr = document.getElementById('iframePlayer');
            const btn = document.getElementById('loadBtn');

            if (!url || !url.includes('/video/')) {
                err.textContent = '❌ Invalid URL - Please enter a valid video URL';
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
                
                if (!res.ok) {
                    throw new Error('Failed to fetch video metadata');
                }
                
                const data = await res.json();

                if (!data.success) throw new Error(data.message || 'Failed to load video');

                // CRITICAL: We only get a proxy URL, NEVER the original URL
                const proxyUrl = data.proxyUrl + '?key=' + encodeURIComponent(SEC);

                if (data.type === 'embed') {
                    // For embeds (YouTube, Vimeo, Dailymotion) - load through our proxy
                    ifr.src = proxyUrl;
                    ifr.style.display = 'block';
                    vid.style.display = 'none';
                    document.getElementById('customControls').style.display = 'none';
                } else {
                    // For videos (Dropbox, GDrive) - stream through our proxy
                    vid.style.display = 'block';
                    ifr.style.display = 'none';
                    document.getElementById('customControls').style.display = 'block';
                    
                    // Set preload to auto for smooth playback
                    vid.preload = 'auto';
                    vid.src = proxyUrl;
                    
                    initControls();
                }

                load.style.display = 'none';
                sec.classList.add('active');
                btn.disabled = false;
            } catch (e) {
                load.style.display = 'none';
                err.textContent = '❌ Error: ' + e.message;
                err.style.display = 'block';
                btn.disabled = false;
            }
        }

        function initControls() {
            const play = document.getElementById('playBtn');
            const skipBack = document.getElementById('skipBackBtn');
            const skipForward = document.getElementById('skipForwardBtn');
            const prog = document.getElementById('progressContainer');
            const bar = document.getElementById('progressBar');
            const time = document.getElementById('timeDisplay');
            const vbtn = document.getElementById('volumeBtn');
            const vslider = document.getElementById('volumeSlider');
            const full = document.getElementById('fullscreenBtn');
            const settings = document.getElementById('settingsBtn');
            const settingsMenu = document.getElementById('settingsMenu');
            const controls = document.getElementById('customControls');
            const buffer = document.getElementById('bufferIndicator');

            // Optimize video for smooth playback
            vid.volume = 1.0;
            
            // Add progressive enhancement for smoother playback
            vid.addEventListener('loadstart', () => {
                buffer.classList.add('show');
            });
            
            vid.addEventListener('loadedmetadata', () => {
                console.log('Metadata loaded, duration:', vid.duration);
            });
            
            vid.addEventListener('progress', () => {
                // Show buffering progress
                if (vid.buffered.length > 0) {
                    const bufferedEnd = vid.buffered.end(vid.buffered.length - 1);
                    const duration = vid.duration;
                    if (duration > 0) {
                        const bufferedPercent = (bufferedEnd / duration) * 100;
                        // Video is buffering well
                        if (bufferedPercent > 10) {
                            buffer.classList.remove('show');
                        }
                    }
                }
            });
            
            function toggle() {
                if (vid.paused) {
                    const playPromise = vid.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            play.textContent = '⏸️';
                        }).catch(err => {
                            console.log('Autoplay prevented:', err);
                        });
                    }
                } else {
                    vid.pause();
                    play.textContent = '▶️';
                }
            }

            play.onclick = toggle;
            vid.onclick = toggle;

            skipBack.onclick = () => {
                vid.currentTime = Math.max(0, vid.currentTime - 10);
            };

            skipForward.onclick = () => {
                vid.currentTime = Math.min(vid.duration, vid.currentTime + 10);
            };

            vid.ontimeupdate = () => {
                if (vid.duration && isFinite(vid.duration)) {
                    bar.style.width = (vid.currentTime / vid.duration * 100) + '%';
                    time.textContent = fmt(vid.currentTime) + ' / ' + fmt(vid.duration);
                }
            };

            vid.onwaiting = () => {
                buffer.classList.add('show');
                console.log('Buffering...');
            };
            vid.oncanplay = () => {
                buffer.classList.remove('show');
                console.log('Can play');
            };
            vid.oncanplaythrough = () => {
                buffer.classList.remove('show');
                console.log('Can play through');
            };
            
            // Better buffering detection
            vid.onstalled = () => {
                buffer.classList.add('show');
                console.log('Stalled');
            };
            vid.onsuspend = () => {
                buffer.classList.remove('show');
            };
            vid.onplaying = () => {
                buffer.classList.remove('show');
                console.log('Playing');
            };
            vid.onloadeddata = () => {
                buffer.classList.remove('show');
                console.log('Data loaded');
            };
            
            // Handle seeking
            vid.onseeking = () => {
                buffer.classList.add('show');
            };
            vid.onseeked = () => {
                buffer.classList.remove('show');
            };

            prog.onclick = e => {
                if (vid.duration && isFinite(vid.duration)) {
                    const rect = prog.getBoundingClientRect();
                    const clickPos = (e.clientX - rect.left) / rect.width;
                    vid.currentTime = clickPos * vid.duration;
                }
            };

            vslider.oninput = e => {
                vid.volume = e.target.value / 100;
                vbtn.textContent = e.target.value == 0 ? '🔇' : e.target.value < 50 ? '🔉' : '🔊';
            };

            vbtn.onclick = () => {
                if (vid.volume > 0) {
                    vid.volume = 0;
                    vslider.value = 0;
                    vbtn.textContent = '🔇';
                } else {
                    vid.volume = 1;
                    vslider.value = 100;
                    vbtn.textContent = '🔊';
                }
            };

            settings.onclick = (e) => {
                e.stopPropagation();
                settingsMenu.classList.toggle('show');
            };

            document.addEventListener('click', (e) => {
                if (!settingsMenu.contains(e.target) && e.target !== settings) {
                    settingsMenu.classList.remove('show');
                }
            });

            full.onclick = () => {
                const w = document.getElementById('playerWrapper');
                if (!document.fullscreenElement) {
                    w.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            };

            // Auto-hide controls
            const wrapper = document.getElementById('playerWrapper');
            wrapper.addEventListener('mousemove', () => {
                controls.classList.add('show');
                clearTimeout(controlsTimeout);
                controlsTimeout = setTimeout(() => {
                    if (!vid.paused) {
                        controls.classList.remove('show');
                    }
                }, 3000);
            });

            wrapper.addEventListener('mouseleave', () => {
                if (!vid.paused) {
                    controls.classList.remove('show');
                }
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (!vid || vid.style.display === 'none') return;
                
                switch(e.key) {
                    case ' ':
                    case 'k':
                        e.preventDefault();
                        toggle();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        vid.currentTime -= 5;
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        vid.currentTime += 5;
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        vid.volume = Math.min(1, vid.volume + 0.1);
                        vslider.value = vid.volume * 100;
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        vid.volume = Math.max(0, vid.volume - 0.1);
                        vslider.value = vid.volume * 100;
                        break;
                    case 'f':
                        e.preventDefault();
                        full.click();
                        break;
                    case 'm':
                        e.preventDefault();
                        vbtn.click();
                        break;
                }
            });
        }

        function setSpeed(speed) {
            if (!vid) return;
            vid.playbackRate = speed;
            
            document.querySelectorAll('[data-speed]').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(\`[data-speed="\${speed}"]\`).classList.add('active');
        }

        function fmt(s) {
            if (!s || !isFinite(s)) return '0:00';
            const h = Math.floor(s / 3600);
            const m = Math.floor((s % 3600) / 60);
            const sec = Math.floor(s % 60);
            
            if (h > 0) {
                return h + ':' + (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
            }
            return m + ':' + (sec < 10 ? '0' : '') + sec;
        }

        function closeVideo() {
            document.getElementById('videoSection').classList.remove('active');
            if (vid) {
                vid.pause();
                vid.src = '';
            }
            if (ifr) ifr.src = '';
            document.getElementById('settingsMenu').classList.remove('show');
        }
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
