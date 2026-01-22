export default function handler(req, res) {
  const securityString = process.env.MASTER_SECURITY_STRING || '__SECURITY_STRING__';
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Player</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #0a0a0a;
            color: white;
            min-height: 100vh;
            user-select: none;
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
            background-clip: text;
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
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 20px;
        }
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
            background-clip: text;
        }
        .form-group {
            margin-bottom: 20px;
        }
        input {
            width: 100%;
            padding: 16px 20px;
            background: rgba(255,255,255,0.05);
            border: 2px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            color: white;
            font-size: 15px;
            transition: all 0.3s;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
            background: rgba(255,255,255,0.08);
        }
        input::placeholder {
            color: rgba(255,255,255,0.4);
        }
        .btn {
            padding: 16px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
        .btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
        }
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .video-section {
            display: none;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .video-section.active {
            display: block;
            animation: fadeIn 0.5s;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .video-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
        }
        .video-title {
            font-size: 22px;
            font-weight: 700;
        }
        .close-btn {
            padding: 10px 20px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
            border-radius: 10px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
        }
        .close-btn:hover {
            background: rgba(255,255,255,0.15);
        }
        .player-wrapper {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            background: #000;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .custom-controls {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
            padding: 40px 20px 15px;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 10;
        }
        .player-wrapper:hover .custom-controls,
        .player-wrapper.playing .custom-controls {
            opacity: 1;
        }
        .progress-container {
            width: 100%;
            height: 6px;
            background: rgba(255,255,255,0.2);
            border-radius: 3px;
            margin-bottom: 15px;
            cursor: pointer;
            position: relative;
        }
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            border-radius: 3px;
            width: 0%;
            transition: width 0.1s;
            position: relative;
        }
        .progress-bar::after {
            content: '';
            position: absolute;
            right: -6px;
            top: 50%;
            transform: translateY(-50%);
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        .controls-row {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .control-btn {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 5px;
            transition: transform 0.2s, color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .control-btn:hover {
            transform: scale(1.1);
            color: #667eea;
        }
        .time {
            color: white;
            font-size: 14px;
            font-weight: 500;
            min-width: 110px;
        }
        .volume-group {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-left: auto;
        }
        .volume-slider {
            width: 100px;
            height: 4px;
            background: rgba(255,255,255,0.3);
            border-radius: 2px;
            outline: none;
            cursor: pointer;
            -webkit-appearance: none;
        }
        .volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            cursor: pointer;
        }
        .volume-slider::-moz-range-thumb {
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            cursor: pointer;
            border: none;
        }
        .error {
            background: rgba(244, 67, 54, 0.2);
            border: 1px solid rgba(244, 67, 54, 0.3);
            padding: 16px;
            border-radius: 12px;
            margin-top: 20px;
            color: #f44336;
            font-size: 14px;
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
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        video::-webkit-media-controls {
            display: none !important;
        }
        video::-webkit-media-controls-enclosure {
            display: none !important;
        }
        .info-text {
            color: rgba(255,255,255,0.5);
            font-size: 13px;
            margin-top: 10px;
        }
        .quality-badge {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(10px);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            color: white;
            z-index: 5;
        }
        .buffer-indicator {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: none;
            z-index: 15;
        }
        .buffer-indicator.show {
            display: block;
        }
    </style>
</head>
<body oncontextmenu="return false;">
    <div class="header">
        <div class="header-content">
            <div class="logo">🎬 Video Player</div>
            <div class="status-badge">🔒 Secure Streaming</div>
        </div>
    </div>

    <div class="container">
        <div class="input-section">
            <div class="input-title">Load Your Video</div>
            <div class="form-group">
                <input 
                    type="url" 
                    id="videoUrl" 
                    placeholder="Paste your secure video URL here..."
                    onkeypress="handleEnter(event)"
                >
                <div class="info-text">Enter the secure URL from Platform B</div>
            </div>
            <button class="btn" onclick="loadVideo()" id="loadBtn">▶️ Load Video</button>
            <div id="error" class="error" style="display: none;"></div>
        </div>

        <div id="loadingSection" class="loading" style="display: none;">
            <div class="spinner"></div>
            <p>Loading your video...</p>
        </div>

        <div id="videoSection" class="video-section">
            <div class="video-header">
                <div class="video-title">Now Playing</div>
                <button class="close-btn" onclick="closeVideo()">✕ Close</button>
            </div>
            <div class="player-wrapper" id="playerWrapper">
                <div class="quality-badge">HD Quality</div>
                <div class="buffer-indicator" id="bufferIndicator">
                    <div class="spinner"></div>
                </div>
                <video 
                    id="videoPlayer" 
                    playsinline 
                    preload="metadata" 
                    crossorigin="anonymous"
                    oncontextmenu="return false;">
                </video>
                
                <div class="custom-controls" id="customControls">
                    <div class="progress-container" id="progressContainer">
                        <div class="progress-bar" id="progressBar"></div>
                    </div>
                    <div class="controls-row">
                        <button class="control-btn" id="playBtn">▶️</button>
                        <span class="time" id="timeDisplay">0:00 / 0:00</span>
                        <div class="volume-group">
                            <button class="control-btn" id="volumeBtn">🔊</button>
                            <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="100">
                        </div>
                        <button class="control-btn" id="fullscreenBtn">⛶</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const SECURITY_STRING = '${securityString}';
        let video = null;
        let isPlaying = false;

        // Disable right-click and keyboard shortcuts
        document.addEventListener('contextmenu', e => e.preventDefault());
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
            video = document.getElementById('videoPlayer');
            const loadBtn = document.getElementById('loadBtn');

            if (!videoUrlInput) {
                showError('Please enter a video URL');
                return;
            }

            if (!videoUrlInput.includes('/video/')) {
                showError('Invalid video URL format');
                return;
            }

            errorEl.style.display = 'none';
            videoSection.classList.remove('active');
            loadingSection.style.display = 'block';
            loadBtn.disabled = true;

            try {
                const urlParts = videoUrlInput.split('/');
                const videoId = urlParts[urlParts.length - 1];
                const baseUrl = videoUrlInput.substring(0, videoUrlInput.lastIndexOf('/video/'));
                const apiUrl = \`\${baseUrl}/api/video/\${videoId}\`;

                const response = await fetch(apiUrl, {
                    headers: { 'X-Security-String': SECURITY_STRING }
                });

                const data = await response.json();

                if (data.success && data.streamUrl) {
                    // Set video source - Dropbox raw URLs work directly in video tag
                    video.src = data.streamUrl;
                    video.load();
                    
                    initControls();
                    
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

        function initControls() {
            const playBtn = document.getElementById('playBtn');
            const progressContainer = document.getElementById('progressContainer');
            const progressBar = document.getElementById('progressBar');
            const timeDisplay = document.getElementById('timeDisplay');
            const volumeBtn = document.getElementById('volumeBtn');
            const volumeSlider = document.getElementById('volumeSlider');
            const fullscreenBtn = document.getElementById('fullscreenBtn');
            const wrapper = document.getElementById('playerWrapper');
            const bufferIndicator = document.getElementById('bufferIndicator');

            // Play/Pause
            playBtn.addEventListener('click', togglePlay);
            video.addEventListener('click', togglePlay);

            function togglePlay() {
                if (video.paused) {
                    video.play();
                    playBtn.textContent = '⏸️';
                    isPlaying = true;
                    wrapper.classList.add('playing');
                } else {
                    video.pause();
                    playBtn.textContent = '▶️';
                    isPlaying = false;
                    wrapper.classList.remove('playing');
                }
            }

            // Show buffer indicator
            video.addEventListener('waiting', () => {
                bufferIndicator.classList.add('show');
            });

            video.addEventListener('canplay', () => {
                bufferIndicator.classList.remove('show');
            });

            video.addEventListener('playing', () => {
                bufferIndicator.classList.remove('show');
            });

            // Update progress
            video.addEventListener('timeupdate', () => {
                const percent = (video.currentTime / video.duration) * 100;
                progressBar.style.width = percent + '%';
                timeDisplay.textContent = \`\${formatTime(video.currentTime)} / \${formatTime(video.duration)}\`;
            });

            // Seek
            progressContainer.addEventListener('click', (e) => {
                const rect = progressContainer.getBoundingClientRect();
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
                } else {
                    video.volume = 1;
                    volumeSlider.value = 100;
                }
                updateVolumeIcon(volumeSlider.value);
            });

            // Fullscreen
            fullscreenBtn.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    wrapper.requestFullscreen().catch(err => console.log(err));
                } else {
                    document.exitFullscreen();
                }
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (videoSection.classList.contains('active')) {
                    if (e.code === 'Space') {
                        e.preventDefault();
                        togglePlay();
                    }
                    if (e.code === 'ArrowLeft') {
                        video.currentTime -= 5;
                    }
                    if (e.code === 'ArrowRight') {
                        video.currentTime += 5;
                    }
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
            if (video) {
                video.pause();
                video.src = '';
            }
            isPlaying = false;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function showError(message) {
            const errorEl = document.getElementById('error');
            errorEl.textContent = '❌ ' + message;
            errorEl.style.display = 'block';
            setTimeout(() => errorEl.style.display = 'none', 5000);
        }

        function handleEnter(event) {
            if (event.key === 'Enter') loadVideo();
        }

        if (SECURITY_STRING === '__SECURITY_STRING__') {
            showError('Security configuration missing. Please contact administrator.');
        }
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
