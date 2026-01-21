export default function handler(req, res) {
  const securityString = process.env.SECURITY_STRING || '__SECURITY_STRING__';
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Platform C - Video Streaming</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #1a1a1a;
            color: white;
            min-height: 100vh;
            user-select: none;
        }
        .header {
            background: #2a2a2a;
            border-bottom: 2px solid #667eea;
            padding: 20px 0;
        }
        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        h1 {
            margin-bottom: 5px;
            font-size: 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .subtitle {
            color: #999;
            font-size: 14px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .input-section {
            background: #2a2a2a;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #ddd;
            font-weight: 500;
        }
        input {
            width: 100%;
            padding: 14px 16px;
            background: #1a1a1a;
            border: 2px solid #444;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        input::placeholder {
            color: #666;
        }
        button {
            padding: 14px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .video-section {
            background: #2a2a2a;
            padding: 30px;
            border-radius: 12px;
            display: none;
        }
        .video-section.active {
            display: block;
        }
        .video-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .video-title {
            font-size: 20px;
            font-weight: 600;
        }
        .close-btn {
            padding: 8px 16px;
            font-size: 14px;
            background: #444;
        }
        .video-container {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            background: #000;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .video-container iframe,
        .video-container video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
        }
        .video-container video {
            object-fit: contain;
        }
        .custom-controls {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0,0,0,0.8));
            padding: 20px 15px 10px;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 10;
        }
        .video-container:hover .custom-controls {
            opacity: 1;
        }
        .progress-bar {
            width: 100%;
            height: 5px;
            background: rgba(255,255,255,0.3);
            border-radius: 3px;
            margin-bottom: 10px;
            cursor: pointer;
            position: relative;
        }
        .progress-filled {
            height: 100%;
            background: #667eea;
            border-radius: 3px;
            width: 0%;
            transition: width 0.1s;
        }
        .controls-bottom {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .play-btn {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .time-display {
            color: white;
            font-size: 14px;
            min-width: 100px;
        }
        .volume-control {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .volume-btn {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
        }
        .volume-slider {
            width: 80px;
            cursor: pointer;
        }
        .fullscreen-btn {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
        }
        .video-info {
            background: #1a1a1a;
            padding: 16px;
            border-radius: 8px;
            font-size: 14px;
            color: #999;
        }
        .video-info-item {
            margin-bottom: 8px;
        }
        .video-info-item:last-child {
            margin-bottom: 0;
        }
        .video-info-label {
            color: #667eea;
            font-weight: 600;
        }
        .error {
            background: #ff4444;
            padding: 16px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 14px;
        }
        .loading {
            text-align: center;
            padding: 40px;
            color: #999;
        }
        .spinner {
            border: 3px solid #333;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .info-box {
            background: #1a3a52;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #4a9eff;
        }
        .info-box-title {
            color: #4a9eff;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .info-box-text {
            color: #99c5e8;
            font-size: 14px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            background: #4caf50;
            color: white;
        }
        .type-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            background: #667eea;
            color: white;
            margin-left: 10px;
        }
        .no-context-menu {
            pointer-events: none;
        }
        video::-webkit-media-controls {
            display: none !important;
        }
        video::-webkit-media-controls-enclosure {
            display: none !important;
        }
    </style>
</head>
<body oncontextmenu="return false;">
    <div class="header">
        <div class="header-content">
            <h1>Platform C</h1>
            <p class="subtitle">Secure Video Streaming Player <span class="status-badge">🔒 Protected</span></p>
        </div>
    </div>

    <div class="container">
        <div class="input-section">
            <div class="info-box">
                <div class="info-box-title">🛡️ Security Active</div>
                <div class="info-box-text">
                    Custom video player with full control. No external branding, no URL exposure.
                </div>
            </div>
            
            <div class="form-group">
                <label for="videoUrl">Enter Platform B Video URL</label>
                <input 
                    type="url" 
                    id="videoUrl" 
                    placeholder="https://your-platform-b.vercel.app/video/xxxxx"
                    onkeypress="handleEnter(event)"
                >
            </div>
            <button onclick="loadVideo()" id="loadBtn">🎬 Load & Stream Video</button>
            <div id="error" class="error" style="display: none;"></div>
        </div>

        <div id="loadingSection" class="loading" style="display: none;">
            <div class="spinner"></div>
            <p>Securely fetching video...</p>
        </div>

        <div id="videoSection" class="video-section">
            <div class="video-header">
                <div>
                    <span class="video-title">Now Playing</span>
                    <span class="type-badge" id="typeBadge">-</span>
                </div>
                <button class="close-btn" onclick="closeVideo()">Close</button>
            </div>
            <div class="video-container" id="videoContainer">
                <video id="videoPlayer" playsinline oncontextmenu="return false;"></video>
                <iframe id="iframePlayer" style="display:none;" allowfullscreen allow="autoplay; encrypted-media"></iframe>
                
                <div class="custom-controls" id="customControls">
                    <div class="progress-bar" id="progressBar">
                        <div class="progress-filled" id="progressFilled"></div>
                    </div>
                    <div class="controls-bottom">
                        <button class="play-btn" id="playBtn">▶️</button>
                        <span class="time-display" id="timeDisplay">0:00 / 0:00</span>
                        <div class="volume-control">
                            <button class="volume-btn" id="volumeBtn">🔊</button>
                            <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="100">
                        </div>
                        <button class="fullscreen-btn" id="fullscreenBtn">⛶</button>
                    </div>
                </div>
            </div>
            <div class="video-info">
                <div class="video-info-item">
                    <span class="video-info-label">Video ID:</span>
                    <span id="videoId">-</span>
                </div>
                <div class="video-info-item">
                    <span class="video-info-label">Type:</span>
                    <span id="videoTypeText">-</span>
                </div>
                <div class="video-info-item">
                    <span class="video-info-label">Status:</span>
                    <span style="color: #4caf50;">✓ Securely Loaded</span>
                </div>
                <div class="video-info-item">
                    <span class="video-info-label">Protection:</span>
                    <span>Custom player • URL hidden • Right-click disabled</span>
                </div>
            </div>
        </div>
    </div>

    <script>
        const SECURITY_STRING = '${securityString}';
        let currentVideoUrl = '';
        let currentVideoId = '';
        let videoType = '';
        let videoElement = null;
        let iframeElement = null;

        // Disable right-click globally
        document.addEventListener('contextmenu', e => e.preventDefault());
        
        // Disable keyboard shortcuts for video inspection
        document.addEventListener('keydown', e => {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || 
                (e.ctrlKey && e.shiftKey && e.key === 'C') || (e.ctrlKey && e.key === 'u')) {
                e.preventDefault();
            }
        });

        async function loadVideo() {
            const videoUrlInput = document.getElementById('videoUrl').value.trim();
            const errorEl = document.getElementById('error');
            const loadingSection = document.getElementById('loadingSection');
            const videoSection = document.getElementById('videoSection');
            videoElement = document.getElementById('videoPlayer');
            iframeElement = document.getElementById('iframePlayer');
            const loadBtn = document.getElementById('loadBtn');

            if (!videoUrlInput) {
                showError('Please enter a video URL');
                return;
            }

            if (!isValidUrl(videoUrlInput)) {
                showError('Invalid URL format');
                return;
            }

            const urlParts = videoUrlInput.split('/');
            const videoId = urlParts[urlParts.length - 1];

            if (!videoId) {
                showError('Invalid video URL format');
                return;
            }

            errorEl.style.display = 'none';
            videoSection.classList.remove('active');
            loadingSection.style.display = 'block';
            loadBtn.disabled = true;

            try {
                const baseUrl = videoUrlInput.substring(0, videoUrlInput.lastIndexOf('/video/'));
                const apiUrl = \`\${baseUrl}/api/video/\${videoId}\`;

                const response = await fetch(apiUrl, {
                    headers: {
                        'X-Security-String': SECURITY_STRING
                    }
                });

                const data = await response.json();

                if (data.success && data.embeddableUrl) {
                    currentVideoUrl = data.embeddableUrl;
                    currentVideoId = data.videoId || videoId;
                    videoType = data.videoType;
                    
                    document.getElementById('videoId').textContent = currentVideoId;
                    document.getElementById('videoTypeText').textContent = videoType.toUpperCase();
                    document.getElementById('typeBadge').textContent = videoType.toUpperCase();
                    
                    // Use custom player for direct videos, iframe for others
                    if (videoType === 'direct' || videoType === 'gdrive') {
                        videoElement.style.display = 'block';
                        iframeElement.style.display = 'none';
                        videoElement.src = currentVideoUrl;
                        initCustomControls();
                    } else {
                        // For YouTube, Vimeo, etc. - use iframe without controls
                        videoElement.style.display = 'none';
                        iframeElement.style.display = 'block';
                        
                        // Modify URL to hide controls
                        let modifiedUrl = currentVideoUrl;
                        if (videoType === 'youtube') {
                            modifiedUrl += '?autoplay=0&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3';
                        } else if (videoType === 'vimeo') {
                            modifiedUrl += '?title=0&byline=0&portrait=0&controls=0';
                        }
                        
                        iframeElement.src = modifiedUrl;
                        document.getElementById('customControls').style.display = 'none';
                    }
                    
                    loadingSection.style.display = 'none';
                    videoSection.classList.add('active');
                    
                    videoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    throw new Error(data.message || 'Failed to load video');
                }
            } catch (error) {
                loadingSection.style.display = 'none';
                showError('Error loading video: ' + error.message);
            } finally {
                loadBtn.disabled = false;
            }
        }

        function initCustomControls() {
            const video = videoElement;
            const playBtn = document.getElementById('playBtn');
            const progressBar = document.getElementById('progressBar');
            const progressFilled = document.getElementById('progressFilled');
            const timeDisplay = document.getElementById('timeDisplay');
            const volumeBtn = document.getElementById('volumeBtn');
            const volumeSlider = document.getElementById('volumeSlider');
            const fullscreenBtn = document.getElementById('fullscreenBtn');
            const container = document.getElementById('videoContainer');

            // Play/Pause
            playBtn.addEventListener('click', () => {
                if (video.paused) {
                    video.play();
                    playBtn.textContent = '⏸️';
                } else {
                    video.pause();
                    playBtn.textContent = '▶️';
                }
            });

            // Update progress
            video.addEventListener('timeupdate', () => {
                const percent = (video.currentTime / video.duration) * 100;
                progressFilled.style.width = percent + '%';
                timeDisplay.textContent = \`\${formatTime(video.currentTime)} / \${formatTime(video.duration)}\`;
            });

            // Seek
            progressBar.addEventListener('click', (e) => {
                const rect = progressBar.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                video.currentTime = pos * video.duration;
            });

            // Volume
            volumeSlider.addEventListener('input', (e) => {
                video.volume = e.target.value / 100;
                updateVolumeIcon(e.target.value);
            });

            volumeBtn.addEventListener('click', () => {
                if (video.volume > 0) {
                    video.volume = 0;
                    volumeSlider.value = 0;
                    volumeBtn.textContent = '🔇';
                } else {
                    video.volume = 1;
                    volumeSlider.value = 100;
                    volumeBtn.textContent = '🔊';
                }
            });

            // Fullscreen
            fullscreenBtn.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    container.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            });

            // Click to play/pause
            video.addEventListener('click', () => {
                if (video.paused) {
                    video.play();
                    playBtn.textContent = '⏸️';
                } else {
                    video.pause();
                    playBtn.textContent = '▶️';
                }
            });
        }

        function formatTime(seconds) {
            if (isNaN(seconds)) return '0:00';
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
        }

        function updateVolumeIcon(value) {
            const volumeBtn = document.getElementById('volumeBtn');
            if (value == 0) volumeBtn.textContent = '🔇';
            else if (value < 50) volumeBtn.textContent = '🔉';
            else volumeBtn.textContent = '🔊';
        }

        function closeVideo() {
            const videoSection = document.getElementById('videoSection');
            
            videoSection.classList.remove('active');
            if (videoElement) videoElement.src = '';
            if (iframeElement) iframeElement.src = '';
            currentVideoUrl = '';
            currentVideoId = '';
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function isValidUrl(string) {
            try {
                new URL(string);
                return true;
            } catch (_) {
                return false;
            }
        }

        function showError(message) {
            const errorEl = document.getElementById('error');
            errorEl.textContent = '❌ ' + message;
            errorEl.style.display = 'block';
            
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        }

        function handleEnter(event) {
            if (event.key === 'Enter') {
                loadVideo();
            }
        }

        if (SECURITY_STRING === '__SECURITY_STRING__') {
            console.warn('Security string not configured.');
            showError('Security configuration missing. Please contact administrator.');
        }
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
