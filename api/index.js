// api/index.js — Platform C serverless handler
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Video Player Pro</title>
<!-- mp4box.js: reads unfragmented MP4, re-segments it into fMP4 for MSE -->
<script src="https://cdn.jsdelivr.net/npm/mp4box@0.5.2/dist/mp4box.all.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;color:#fff;min-height:100vh}
.hdr{background:linear-gradient(135deg,#1a1a2e,#16213e);padding:18px 24px;box-shadow:0 2px 20px rgba(0,0,0,.5)}
.hdr-in{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
.logo{font-size:24px;font-weight:700;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.badge{background:rgba(76,175,80,.2);color:#4caf50;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600}
.wrap{max-width:1200px;margin:0 auto;padding:32px 20px}
.card{background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px;padding:32px;margin-bottom:24px;box-shadow:0 8px 32px rgba(0,0,0,.3)}
.card-title{font-size:20px;font-weight:700;margin-bottom:16px;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
input[type=url]{width:100%;padding:14px 16px;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:15px;margin-bottom:16px;transition:border-color .2s}
input:focus{outline:none;border-color:#667eea}
input::placeholder{color:rgba(255,255,255,.35)}
.btn{padding:14px 36px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;transition:transform .15s,opacity .15s}
.btn:hover:not(:disabled){transform:translateY(-2px)}
.btn:disabled{opacity:.5;cursor:not-allowed}
.sbadge{display:inline-block;margin-top:12px;background:rgba(76,175,80,.12);color:#4caf50;border:1px solid rgba(76,175,80,.28);padding:6px 12px;border-radius:6px;font-size:11px}
.err{background:rgba(244,67,54,.14);border:1px solid rgba(244,67,54,.3);color:#f44336;padding:12px 16px;border-radius:10px;margin-top:12px;display:none;line-height:1.6}
#vSec{display:none}
#vSec.on{display:block}
.ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:10px}
.ptitle{font-size:18px;font-weight:700}
.cbtn{padding:8px 16px;background:rgba(255,59,48,.18);color:#ff3b30;border:1px solid rgba(255,59,48,.25);border-radius:8px;cursor:pointer;font-weight:600;font-size:13px}
.cbtn:hover{background:rgba(255,59,48,.3)}
.pwrap{position:relative;padding-bottom:56.25%;height:0;background:#000;border-radius:12px;overflow:hidden}
video,iframe{position:absolute;inset:0;width:100%;height:100%;border:none;background:#000}
.ov{position:absolute;inset:0;z-index:5;pointer-events:none}
.vload{position:absolute;inset:0;z-index:20;background:rgba(0,0,0,.75);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;transition:opacity .3s}
.vload.gone{opacity:0;pointer-events:none}
.spin{width:46px;height:46px;border:3px solid rgba(255,255,255,.15);border-top-color:#667eea;border-radius:50%;animation:sp 1s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
.vload-txt{font-size:13px;color:rgba(255,255,255,.65);text-align:center;padding:0 20px}
.bwrap{margin-top:8px;height:5px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden;display:none}
.bbar{height:100%;width:0%;background:linear-gradient(90deg,#667eea,#764ba2);border-radius:3px;transition:width .6s ease}
.binfo{margin-top:6px;font-size:11px;color:rgba(255,255,255,.35);display:none;justify-content:space-between}
#st{font-size:11px;color:rgba(255,255,255,.35);margin-top:6px;min-height:16px}
#loadSec{display:none;text-align:center;padding:48px;color:rgba(255,255,255,.5)}
.lspin{width:44px;height:44px;border:3px solid rgba(255,255,255,.1);border-top-color:#667eea;border-radius:50%;animation:sp 1s linear infinite;margin:0 auto 14px}
*{-webkit-user-select:none;-moz-user-select:none;user-select:none}
input[type=url]{-webkit-user-select:text;-moz-user-select:text;user-select:text}
video,img,iframe{-webkit-user-drag:none;user-drag:none}
@media(max-width:600px){.card{padding:20px}.logo{font-size:20px}}
</style>
</head>
<body>
<div class="hdr">
  <div class="hdr-in">
    <div class="logo">🎬 Video Player Pro</div>
    <div class="badge">🔒 Protected</div>
  </div>
</div>
<div class="wrap">
  <div class="card">
    <div class="card-title">Load Secure Video</div>
    <input type="url" id="urlIn" placeholder="Paste Platform B video URL… e.g. https://platform-b.vercel.app/video/abc123">
    <button class="btn" id="loadBtn">▶ Load Video</button>
    <div class="sbadge">🛡 blob:// URL · Token in header only · IDM blocked</div>
    <div class="err" id="errBox"></div>
  </div>
  <div id="loadSec"><div class="lspin"></div><p>Connecting…</p></div>
  <div id="vSec" class="card">
    <div class="ph">
      <div class="ptitle">Now Playing</div>
      <button class="cbtn" id="closeBtn">✕ Close</button>
    </div>
    <div class="pwrap">
      <video id="vid" controls playsinline
             controlsList="nodownload nofullscreen noremoteplayback"
             disablePictureInPicture oncontextmenu="return false;"></video>
      <iframe id="ifr" allowfullscreen allow="autoplay" style="display:none" oncontextmenu="return false;"></iframe>
      <div class="ov" oncontextmenu="return false;"></div>
      <div class="vload" id="vload">
        <div class="spin"></div>
        <div class="vload-txt" id="vloadTxt">Connecting…</div>
      </div>
    </div>
    <div class="bwrap" id="bWrap"><div class="bbar" id="bBar"></div></div>
    <div class="binfo" id="bInfo"><span id="bL">Loading…</span><span id="bR"></span></div>
    <div id="st"></div>
  </div>
</div>
<script>
'use strict';
// ═══════════════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════════════
const SEC          = '84418779257393762955868022673598';
const CHUNK_BYTES  = 4 * 1024 * 1024;   // 4MB fetch chunks
const AHEAD_STOP   = 90;                 // pause pump when 90s ahead
const AHEAD_GO     = 20;                 // resume pump when < 20s ahead
const INITIAL_S    = 3;                  // play after 3s buffered
const EVICT_S      = 60;                 // evict data > 60s behind playhead
const MAX_RETRIES  = 4;
const FETCH_TO_MS  = 20000;

// ═══════════════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════════════
let _vid, _ms, _sb, _mp4box;
let _token, _endpoint;
let _totalBytes = 0, _fetched = 0;
let _stopped = false, _started = false, _done = false;
let _pumping = false, _paused = false;
let _blobUrl = null;
let _sbQueue = Promise.resolve(); // serialise all SB operations

// ═══════════════════════════════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════════════════════════════
const norm  = u => u.replace(/([^:])\\/\\/+/g,'$1/');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const setSt = msg => { const e = document.getElementById('st'); if(e) e.textContent = msg; };
const setOverlay = (on, msg) => {
  const e = document.getElementById('vload');
  const t = document.getElementById('vloadTxt');
  if(!e) return;
  e.classList.toggle('gone', !on);
  if(on && msg && t) t.textContent = msg;
};

function getAhead() {
  if(!_vid||!_vid.buffered||!_vid.buffered.length) return 0;
  const ct = _vid.currentTime;
  for(let i=0;i<_vid.buffered.length;i++)
    if(_vid.buffered.start(i)<=ct+0.5 && _vid.buffered.end(i)>ct)
      return _vid.buffered.end(i)-ct;
  return 0;
}

function updateBar() {
  if(!_totalBytes) return;
  const pct = Math.min(100,(_fetched/_totalBytes)*100);
  const b = document.getElementById('bBar');
  const l = document.getElementById('bL');
  const r = document.getElementById('bR');
  if(b) b.style.width = pct.toFixed(1)+'%';
  if(l) l.textContent = _done ? 'Fully loaded ✓' : \`Loaded \${pct.toFixed(0)}%\`;
  if(r) r.textContent = getAhead()>0 ? \`\${Math.round(getAhead())}s ahead\` : '';
}

// ═══════════════════════════════════════════════════════════════
//  SOURCEBUFFER — serialised via promise chain
//  Never touches SB while it's updating. All ops queued.
// ═══════════════════════════════════════════════════════════════
function sbOp(fn) {
  _sbQueue = _sbQueue.then(() => new Promise((ok, fail) => {
    if(_stopped || !_sb || !_ms || _ms.readyState !== 'open') { ok(); return; }
    if(_sb.updating) {
      // wait for current op to finish
      _sb.addEventListener('updateend', () => doIt(ok, fail), {once:true});
    } else {
      doIt(ok, fail);
    }
    function doIt(ok, fail) {
      if(_stopped || !_sb || _ms.readyState !== 'open') { ok(); return; }
      _sb.addEventListener('updateend', ok,   {once:true});
      _sb.addEventListener('error',     fail, {once:true});
      try { fn(); } catch(e) { _sb.removeEventListener('updateend', ok); fail(e); }
    }
  }));
  return _sbQueue;
}

async function sbAppend(buf) {
  if(_stopped) return;
  let retried = false;
  try {
    await sbOp(() => _sb.appendBuffer(buf));
  } catch(e) {
    if(e && e.name === 'QuotaExceededError' && !retried) {
      retried = true;
      await sbEvict(true);
      await sbOp(() => _sb.appendBuffer(buf));
    }
  }
}

function sbEvict(force) {
  const ct = _vid ? _vid.currentTime : 0;
  const to = force ? Math.max(0,ct-5) : Math.max(0,ct-EVICT_S);
  if(to < 0.5) return Promise.resolve();
  return sbOp(() => _sb.remove(0, to));
}

// ═══════════════════════════════════════════════════════════════
//  MP4BOX INTEGRATION
//  mp4box.js reads the raw bytes we feed it, detects the moov,
//  then re-segments the movie data into proper fMP4 segments.
//  We feed those segments directly into the MSE SourceBuffer.
// ═══════════════════════════════════════════════════════════════
function initMp4Box() {
  _mp4box = MP4Box.createFile();

  _mp4box.onError = e => {
    setSt('⚠ MP4 parse error: ' + e);
  };

  // Called once the moov (movie header) has been fully parsed
  _mp4box.onReady = info => {
    setSt('Video info parsed — setting up tracks…');

    // Set up segmentation: 2-second segments
    const tracks = info.videoTracks.concat(info.audioTracks);
    if(!tracks.length) { setSt('⚠ No tracks found'); return; }

    tracks.forEach(track => {
      _mp4box.setSegmentOptions(track.id, null, { nbSamples: 60 });
    });

    // Get the fMP4 init segment (contains moov with mvex — required by MSE)
    const initSegs = _mp4box.initializeSegmentation();

    // For each track, add a SourceBuffer and append the init segment
    initSegs.forEach(seg => {
      // Find a supported MIME type for this track
      const mime = getMime(seg.track);
      if(!mime) return;

      try {
        if(!_sb) {
          // Use the first SourceBuffer (video track preferred)
          _sb = _ms.addSourceBuffer(mime);
          _sb.mode = 'segments'; // fMP4 from mp4box — segments mode works now!
        }
      } catch(e) {
        setSt('⚠ addSourceBuffer failed: ' + e.message);
        return;
      }

      // Append init segment
      sbOp(() => _sb.appendBuffer(seg.buffer));
    });

    // Start generating segments
    _mp4box.start();
  };

  // Called whenever a segment is ready
  _mp4box.onSegment = (id, user, buffer, sampleNum, isLast) => {
    if(_stopped) return;
    // Append the fMP4 segment to the SourceBuffer
    sbAppend(buffer).then(() => {
      if(!_started && getAhead() >= INITIAL_S) {
        _started = true;
        setOverlay(false);
        setSt('Playing');
        _vid.play().catch(() => setSt('Click ▶ to play'));
      }
      updateBar();
      if(isLast || _done) {
        sbOp(() => {}).then(() => {
          if(_ms && _ms.readyState === 'open') {
            try { _ms.endOfStream(); } catch(_){}
          }
          setSt('Fully loaded ✓');
          updateBar();
        });
      }
    });
  };
}

function getMime(track) {
  if(!track) return 'video/mp4';
  const codec = track.codec || '';
  if(track.type === 'video' || track.video) {
    if(MediaSource.isTypeSupported(\`video/mp4; codecs="\${codec}"\`))
      return \`video/mp4; codecs="\${codec}"\`;
    return MediaSource.isTypeSupported('video/mp4') ? 'video/mp4' : null;
  }
  if(track.type === 'audio' || track.audio) {
    if(MediaSource.isTypeSupported(\`audio/mp4; codecs="\${codec}"\`))
      return \`audio/mp4; codecs="\${codec}"\`;
    return MediaSource.isTypeSupported('audio/mp4') ? 'audio/mp4' : null;
  }
  return 'video/mp4';
}

// ═══════════════════════════════════════════════════════════════
//  FETCH PUMP
//  Downloads the MP4 in 4MB chunks, feeds raw bytes to mp4box.
//  mp4box converts them to fMP4 segments → MSE → video plays.
// ═══════════════════════════════════════════════════════════════
async function fetchChunk(start, retry = 0) {
  const end  = start + CHUNK_BYTES - 1;
  const ctrl = new AbortController();
  const tm   = setTimeout(() => ctrl.abort(), FETCH_TO_MS);
  try {
    const res = await fetch(_endpoint, {
      headers: {
        'X-Session-Token': _token,
        'Range': \`bytes=\${start}-\${end}\`,
        'Origin': location.origin,
      },
      signal: ctrl.signal,
    });
    clearTimeout(tm);
    if(res.status === 416) return {buf:null, eof:true};
    if(!res.ok && res.status !== 206) throw new Error('HTTP '+res.status);
    const cr = res.headers.get('content-range')||'';
    const m  = cr.match(/\\/(\\d+)$/);
    if(m && !_totalBytes) {
      _totalBytes = parseInt(m[1],10);
      document.getElementById('bWrap').style.display = 'block';
      document.getElementById('bInfo').style.display = 'flex';
    }
    const buf = await res.arrayBuffer();
    return {buf, eof: _totalBytes>0 && start+buf.byteLength >= _totalBytes};
  } catch(e) {
    clearTimeout(tm);
    if(retry < MAX_RETRIES) { await sleep(Math.min(1000*(retry+1),5000)); return fetchChunk(start,retry+1); }
    throw e;
  }
}

async function runPump() {
  if(_pumping || _stopped || _done) return;
  _pumping = true;
  _paused  = false;

  try {
    while(!_stopped && !_done) {
      // Pause if very healthy buffer
      if(_started && getAhead() >= AHEAD_STOP) {
        _paused  = true;
        _pumping = false;
        setSt(\`Buffered \${Math.round(getAhead())}s — paused\`);
        return;
      }

      // Periodic eviction
      if(_fetched > 0 && _fetched % (CHUNK_BYTES*20) === 0) sbEvict(false);

      let res;
      try { res = await fetchChunk(_fetched); }
      catch(e) { setSt('⚠ Network error — will retry on seek/wait'); _pumping=false; return; }
      if(_stopped) break;

      if(res.buf && res.buf.byteLength > 0) {
        // Feed raw bytes into mp4box — it handles fragmentation
        const ab = res.buf;
        ab.fileStart = _fetched;   // mp4box needs to know the byte offset
        _fetched += ab.byteLength;
        _mp4box.appendBuffer(ab); // mp4box will fire onSegment with fMP4 data
        updateBar();
      }

      if(res.eof) {
        _done = true;
        _mp4box.flush(); // tell mp4box no more data
        break;
      }
    }
  } catch(e) { setSt('⚠ Stream error'); }
  _pumping = false;
}

function startResumeCheck() {
  const iv = setInterval(() => {
    if(_stopped || _done) { clearInterval(iv); return; }
    if(!_paused) { clearInterval(iv); return; }
    if(getAhead() < AHEAD_GO) { _paused = false; clearInterval(iv); runPump(); }
  }, 1500);
}

// ═══════════════════════════════════════════════════════════════
//  MAIN INIT
// ═══════════════════════════════════════════════════════════════
async function startStream(endpoint, token) {
  _endpoint = endpoint; _token = token;
  _stopped = _started = _done = _pumping = _paused = false;
  _fetched = _totalBytes = 0;
  _sb = null; _mp4box = null;
  _sbQueue = Promise.resolve();

  setOverlay(true, 'Initialising player…');

  // Create MediaSource + blob URL
  _ms = new MediaSource();
  _blobUrl = URL.createObjectURL(_ms);
  _vid.src = _blobUrl; // IDM sees blob:// — nothing to intercept

  await new Promise((res, rej) => {
    _ms.addEventListener('sourceopen', res,  {once:true});
    _ms.addEventListener('error',      rej,  {once:true});
  });

  setOverlay(true, 'Loading video…');

  // Init mp4box
  initMp4Box();

  // Wire video events
  _vid.addEventListener('waiting',    onWait);
  _vid.addEventListener('playing',    () => setOverlay(false));
  _vid.addEventListener('canplay',    () => setOverlay(false));
  _vid.addEventListener('timeupdate', updateBar);
  _vid.addEventListener('error',      () => {
    const e = _vid.error;
    setSt('⚠ '+( e ? e.message : 'video error'));
  });

  // Start fetching
  setSt('Fetching…');
  runPump();
  startResumeCheck();
}

function onWait() {
  setOverlay(true, 'Buffering…');
  if(!_pumping && !_stopped) {
    _paused = false;
    runPump();
  }
}

// ═══════════════════════════════════════════════════════════════
//  LOAD / CLOSE
// ═══════════════════════════════════════════════════════════════
async function loadVideo() {
  const url   = document.getElementById('urlIn').value.trim();
  const btn   = document.getElementById('loadBtn');
  const load  = document.getElementById('loadSec');
  const vSec  = document.getElementById('vSec');
  _vid        = document.getElementById('vid');
  const ifr   = document.getElementById('ifr');
  const errEl = document.getElementById('errBox');

  errEl.style.display = 'none';
  if(!url || !url.includes('/video/')) {
    errEl.textContent = '❌ Invalid URL — must contain /video/';
    errEl.style.display = 'block'; return;
  }

  vSec.classList.remove('on');
  load.style.display = 'block';
  btn.disabled = true;

  try {
    const m = url.match(/\\/video\\/([^/?#]+)/);
    if(!m) throw new Error('Cannot extract video ID from URL');
    const videoId = m[1];
    const base    = url.slice(0, url.indexOf('/video/'));

    const res = await fetch(norm(base+'/api/video/'+videoId), {
      headers:{'X-Security-String':SEC, 'Accept':'application/json'}
    });
    if(res.status===403) throw new Error('Access denied — wrong security key');
    if(res.status===404) throw new Error('Video not found');
    if(!res.ok) throw new Error('Server error: '+res.status);
    const data = await res.json();
    if(!data.success) throw new Error(data.message||'Failed to load');

    load.style.display = 'none';
    vSec.classList.add('on');
    btn.disabled = false;

    document.getElementById('bWrap').style.display = 'none';
    document.getElementById('bInfo').style.display = 'none';
    document.getElementById('bBar').style.width = '0%';
    document.getElementById('st').textContent = '';

    if(data.type === 'embed') {
      ifr.src = norm(data.proxyUrl)+'?key='+encodeURIComponent(SEC);
      ifr.style.display = 'block';
      _vid.style.display = 'none';
      setOverlay(false);
    } else {
      _vid.style.display = 'block';
      ifr.style.display  = 'none';
      ifr.src = '';
      if(!data.sessionToken)   throw new Error('No session token — redeploy Platform B');
      if(!data.streamEndpoint) throw new Error('No stream endpoint — redeploy Platform B');
      if(typeof MediaSource === 'undefined')
        throw new Error('MediaSource not supported. Use Chrome, Edge, or Firefox.');
      if(typeof MP4Box === 'undefined')
        throw new Error('mp4box.js failed to load — check internet connection.');
      await startStream(data.streamEndpoint, data.sessionToken);
    }
  } catch(e) {
    load.style.display = 'none';
    btn.disabled = false;
    errEl.textContent = '❌ ' + e.message;
    errEl.style.display = 'block';
    setTimeout(()=>{ errEl.style.display='none'; }, 10000);
  }
}

function closeVideo() {
  _stopped = _pumping = _paused = true;
  document.getElementById('vSec').classList.remove('on');
  document.getElementById('bWrap').style.display = 'none';
  document.getElementById('bInfo').style.display = 'none';
  document.getElementById('st').textContent = '';
  setOverlay(false);
  if(_vid) {
    ['waiting','playing','canplay','timeupdate','error'].forEach(ev =>
      _vid.removeEventListener(ev, ev==='waiting'?onWait:()=>{}));
    _vid.pause(); _vid.removeAttribute('src'); _vid.load();
  }
  if(_blobUrl) { URL.revokeObjectURL(_blobUrl); _blobUrl=null; }
  if(_ms) { try{_ms.endOfStream();}catch(_){} _ms=null; _sb=null; }
  if(_mp4box) { try{_mp4box.stop();}catch(_){} _mp4box=null; }
  const ifr = document.getElementById('ifr');
  if(ifr) { ifr.src=''; ifr.style.display='none'; }
}

document.getElementById('loadBtn') .addEventListener('click', loadVideo);
document.getElementById('closeBtn').addEventListener('click', closeVideo);
document.getElementById('urlIn')   .addEventListener('keypress', e=>{ if(e.key==='Enter') loadVideo(); });

// ═══════════════════════════════════════════════════════════════
//  ANTI-DOWNLOAD
// ═══════════════════════════════════════════════════════════════
document.addEventListener('contextmenu', e=>{ e.preventDefault(); return false; });
document.addEventListener('keydown', e=>{
  const k=(e.key||'').toLowerCase();
  if((e.ctrlKey||e.metaKey)&&['s','u','p','i','j','c'].includes(k)){e.preventDefault();return false;}
  if((e.ctrlKey||e.metaKey)&&e.shiftKey&&['i','j','c'].includes(k)){e.preventDefault();return false;}
  if(k==='f12'||k==='printscreen'){e.preventDefault();return false;}
});
document.addEventListener('dragstart', e=>{ e.preventDefault(); return false; });
document.addEventListener('visibilitychange', ()=>{ const v=document.getElementById('vid'); if(v&&document.hidden) v.pause(); });
if(navigator.mediaDevices){
  try{Object.defineProperty(navigator.mediaDevices,'getDisplayMedia',{configurable:false,writable:false,value:()=>Promise.reject(new DOMException('Not allowed','NotAllowedError'))});}catch(_){}
  try{
    const _g=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:false,writable:false,value:c=>c&&c.video?Promise.reject(new DOMException('Not allowed','NotAllowedError')):_g(c)});
  }catch(_){}
}
try{Object.defineProperty(window,'MediaRecorder',{configurable:false,writable:false,value:function(){throw new DOMException('Disabled','NotSupportedError');}});}catch(_){}
(function(){
  let open=false;
  setInterval(()=>{
    const isOpen=window.outerWidth-window.innerWidth>160||window.outerHeight-window.innerHeight>160;
    const v=document.getElementById('vid'),f=document.getElementById('ifr');
    if(isOpen&&!open){open=true;if(v){v.pause();v.style.visibility='hidden';}if(f)f.style.visibility='hidden';}
    else if(!isOpen&&open){open=false;if(v)v.style.visibility='visible';if(f)f.style.visibility='visible';}
  },800);
})();
</script>
</body>
</html>
`);
}
