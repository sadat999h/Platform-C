// Platform C - Video Player JavaScript
// Version: 2.0 - CORS Fixed, Button Fixed, URL Normalized

// ============================================
// CONFIGURATION
// ============================================
// IMPORTANT: Replace this with your Platform B's MASTER_SECURITY_STRING
const SEC = '06942188162472527188672293629719';

// ============================================
// GLOBAL VARIABLES
// ============================================
let vid = null;
let ifr = null;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Normalize URL - Remove double slashes (except after protocol)
 * Fixes CORS issues caused by URL redirects
 */
function normalizeUrl(url) {
    return url.replace(/([^:]\/)\/+/g, '$1');
}

/**
 * Show error message to user
 */
function showError(message) {
    const err = document.getElementById('error');
    err.textContent = '❌ ' + message;
    err.style.display = 'block';
}

/**
 * Hide error message
 */
function hideError() {
    const err = document.getElementById('error');
    err.style.display = 'none';
}

/**
 * Show loading spinner
 */
function showLoading() {
    const load = document.getElementById('loadingSection');
    load.style.display = 'block';
}

/**
 * Hide loading spinner
 */
function hideLoading() {
    const load = document.getElementById('loadingSection');
    load.style.display = 'none';
}

/**
 * Show video section
 */
function showVideoSection() {
    const sec = document.getElementById('videoSection');
    sec.classList.add('active');
}

/**
 * Hide video section
 */
function hideVideoSection() {
    const sec = document.getElementById('videoSection');
    sec.classList.remove('active');
}

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Load and play video from Platform B URL
 */
async function loadVideo() {
    const url = document.getElementById('videoUrl').value.trim();
    const btn = document.getElementById('loadBtn');
    vid = document.getElementById('videoPlayer');
    ifr = document.getElementById('iframePlayer');

    // Validation: Check if URL is provided
    if (!url) {
        showError('Please enter a video URL');
        return;
    }

    // Validation: Check if URL contains /video/
    if (!url.includes('/video/')) {
        showError('Invalid URL - Must contain /video/');
        return;
    }

    // Hide error and video section, show loading
    hideError();
    hideVideoSection();
    showLoading();
    btn.disabled = true;

    try {
        // Extract video ID using regex
        const videoMatch = url.match(/\/video\/([^/?#]+)/);
        if (!videoMatch) {
            throw new Error('Could not extract video ID from URL');
        }
        
        const videoId = videoMatch[1];
        
        // Extract base URL (everything before /video/)
        const baseUrl = url.substring(0, url.indexOf('/video/'));
        
        // Construct API URL and normalize (prevent double slashes)
        const apiUrl = normalizeUrl(baseUrl + '/api/video/' + videoId);
        
        console.log('🎬 Fetching video metadata...');
        console.log('📍 API URL:', apiUrl);
        console.log('🆔 Video ID:', videoId);
        
        // Fetch video metadata from Platform B
        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: { 
                'X-Security-String': SEC,
                'Content-Type': 'application/json'
            }
        });
        
        // Check if request was successful
        if (!res.ok) {
            const errorText = await res.text();
            console.error('❌ Fetch failed:', res.status, errorText);
            throw new Error('Failed to fetch video (Status: ' + res.status + ')');
        }
        
        // Parse JSON response
        const data = await res.json();
        console.log('📦 Response data:', data);
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to load video');
        }

        // Construct proxy URL with security key
        const proxyUrl = normalizeUrl(data.proxyUrl) + '?key=' + encodeURIComponent(SEC);
        
        console.log('🔗 Proxy URL:', proxyUrl);
        console.log('📺 Video type:', data.type);
        console.log('🎯 Platform:', data.platform);
        
        // Display video based on type (embed or video)
        if (data.type === 'embed') {
            // For YouTube, Vimeo, Dailymotion
            console.log('🎬 Loading embed player...');
            ifr.src = proxyUrl;
            ifr.style.display = 'block';
            vid.style.display = 'none';
        } else {
            // For Dropbox, Google Drive
            console.log('🎬 Loading video player...');
            vid.style.display = 'block';
            ifr.style.display = 'none';
            vid.src = proxyUrl;
        }

        // Hide loading, show video section
        hideLoading();
        showVideoSection();
        btn.disabled = false;
        
        console.log('✅ Video loaded successfully!');
        
    } catch (e) {
        console.error('❌ Load error:', e);
        hideLoading();
        showError(e.message);
        btn.disabled = false;
    }
}

/**
 * Close video and reset player
 */
function closeVideo() {
    console.log('🛑 Closing video...');
    
    hideVideoSection();
    
    // Stop and clear video player
    if (vid) {
        vid.pause();
        vid.src = '';
    }
    
    // Clear iframe player
    if (ifr) {
        ifr.src = '';
    }
    
    console.log('✅ Video closed');
}

/**
 * Handle Enter key press in input field
 */
function handleEnterKey(event) {
    if (event.key === 'Enter') {
        loadVideo();
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

/**
 * Initialize event listeners when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Platform C Video Player initialized');
    
    // Load button
    const loadBtn = document.getElementById('loadBtn');
    if (loadBtn) {
        loadBtn.addEventListener('click', loadVideo);
        console.log('✅ Load button listener attached');
    }
    
    // Close button
    const closeBtn = document.getElementById('closeBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeVideo);
        console.log('✅ Close button listener attached');
    }
    
    // Enter key on input field
    const videoUrlInput = document.getElementById('videoUrl');
    if (videoUrlInput) {
        videoUrlInput.addEventListener('keypress', handleEnterKey);
        console.log('✅ Enter key listener attached');
    }
    
    // Auto-hide errors after 5 seconds
    const errorEl = document.getElementById('error');
    if (errorEl) {
        const observer = new MutationObserver(function() {
            if (errorEl.style.display === 'block') {
                setTimeout(() => {
                    errorEl.style.display = 'none';
                }, 5000);
            }
        });
        observer.observe(errorEl, { attributes: true, attributeFilter: ['style'] });
        console.log('✅ Error auto-hide observer attached');
    }
    
    // Verify security string is configured
    if (SEC === '84418779257393762955868022673598') {
        console.warn('⚠️ Using default security string. Please update SEC variable with your Platform B key.');
    } else {
        console.log('✅ Security string configured');
    }
});

// ============================================
// DEBUGGING HELPERS
// ============================================

/**
 * Test function - Check if everything is loaded correctly
 * Usage: Open console and type: testPlatformC()
 */
function testPlatformC() {
    console.log('🧪 Running Platform C diagnostics...');
    
    const checks = {
        'Load button exists': !!document.getElementById('loadBtn'),
        'Close button exists': !!document.getElementById('closeBtn'),
        'Video URL input exists': !!document.getElementById('videoUrl'),
        'Video player exists': !!document.getElementById('videoPlayer'),
        'Iframe player exists': !!document.getElementById('iframePlayer'),
        'Loading section exists': !!document.getElementById('loadingSection'),
        'Video section exists': !!document.getElementById('videoSection'),
        'Error element exists': !!document.getElementById('error'),
        'loadVideo function defined': typeof loadVideo === 'function',
        'closeVideo function defined': typeof closeVideo === 'function',
        'normalizeUrl function defined': typeof normalizeUrl === 'function',
        'Security string configured': SEC !== '84418779257393762955868022673598'
    };
    
    console.table(checks);
    
    const allPassed = Object.values(checks).every(v => v === true);
    if (allPassed) {
        console.log('✅ All diagnostics passed!');
    } else {
        console.error('❌ Some diagnostics failed. Check the table above.');
    }
    
    return checks;
}

// Make test function available globally
window.testPlatformC = testPlatformC;

console.log('📄 Platform C JavaScript loaded');
console.log('💡 Tip: Type testPlatformC() in console to run diagnostics');
