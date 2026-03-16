import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';

/* ─── constants ─── */
const RESULTS_PER_PAGE = 6;

/* ─── tiny helpers ─── */
const toB64Preview = (file) =>
  new Promise((res) => {
    const r = new FileReader();
    r.onloadend = () => res(r.result);
    r.readAsDataURL(file);
  });

/* ══════════════════════════════════════════
   GLOBAL STYLES (injected once)
══════════════════════════════════════════ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #090b06; }

:root {
  --bg:       #090b06;
  --surface:  #0d1008;
  --border:   #1a2a08;
  --border2:  #2a3a10;
  --lime:     #c8f050;
  --lime2:    #8ac030;
  --text:     #d4f07a;
  --muted:    #5a7a28;
  --muted2:   #3a5a18;
  --dark:     #1a2a08;
  --mono:     'Space Mono', monospace;
  --display:  'Bebas Neue', sans-serif;
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

.app {
  min-height: 100vh;
  background: var(--bg);
  background-image:
    radial-gradient(ellipse 60% 40% at 20% 10%, rgba(100,160,30,0.06) 0%, transparent 60%),
    radial-gradient(ellipse 40% 50% at 80% 80%, rgba(200,240,80,0.04) 0%, transparent 60%);
  font-family: var(--mono);
  color: var(--text);
  display: flex;
  flex-direction: column;
}

/* TOPBAR */
.topbar {
  border-bottom: 1px solid var(--border);
  padding: 14px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(13,16,8,0.9);
  backdrop-filter: blur(10px);
  position: sticky; top: 0; z-index: 10;
}
.logo {
  font-family: var(--display);
  font-size: 26px;
  letter-spacing: 4px;
  color: var(--lime);
}
.logo-sub { font-size: 9px; letter-spacing: 3px; color: var(--muted); margin-top: 2px; }
.topbar-badges { display: flex; gap: 8px; align-items: center; }
.badge {
  font-size: 9px;
  letter-spacing: 1.5px;
  padding: 4px 10px;
  border-radius: 3px;
  border: 1px solid var(--border2);
  color: var(--muted);
  background: var(--surface);
}
.badge.active { color: var(--lime2); border-color: var(--muted2); }
.badge.time { color: var(--lime); border-color: var(--muted2); }

/* LAYOUT */
.layout { display: flex; flex: 1; }

/* SIDEBAR */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  background: var(--surface);
}
.sec-label {
  font-size: 8px;
  letter-spacing: 2.5px;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.sec-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

/* SOURCE TABS */
.tab-row { display: flex; gap: 3px; }
.tab {
  flex: 1; padding: 8px 4px; text-align: center;
  font-size: 9px; letter-spacing: 1.5px;
  border: 1px solid var(--border2); border-radius: 3px;
  cursor: pointer; background: transparent; color: var(--muted);
  font-family: var(--mono); transition: all 0.15s;
}
.tab:hover { border-color: var(--muted2); color: var(--text); }
.tab.active { background: var(--lime); color: var(--bg); border-color: var(--lime); font-weight: 700; }

/* DROP ZONE */
.drop-zone {
  border: 1px dashed var(--muted2);
  border-radius: 6px;
  padding: 20px 12px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  background: rgba(9,11,6,0.6);
  cursor: pointer;
  transition: all 0.2s;
  position: relative; overflow: hidden; min-height: 130px;
}
.drop-zone:hover, .drop-zone.drag { border-color: var(--lime2); background: rgba(200,240,80,0.04); }
.drop-zone img { width: 100%; height: 130px; object-fit: cover; border-radius: 4px; }
.drop-text { font-size: 9px; letter-spacing: 1.5px; color: var(--muted); text-align: center; }
.drop-clear {
  position: absolute; top: 6px; right: 6px;
  width: 20px; height: 20px; border-radius: 50%;
  background: rgba(9,11,6,0.85); border: 1px solid var(--border2);
  color: var(--muted); font-size: 11px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; line-height: 1;
}

/* WEBCAM */
.webcam-wrap {
  border: 1px solid var(--border2); border-radius: 6px; overflow: hidden; position: relative; min-height: 130px;
  background: #000; display: flex; align-items: center; justify-content: center;
}
.webcam-wrap video { width: 100%; display: block; }
.webcam-snap {
  position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
  background: var(--lime); color: var(--bg); border: none;
  padding: 6px 18px; font-family: var(--mono); font-size: 9px; font-weight: 700;
  letter-spacing: 1.5px; border-radius: 3px; cursor: pointer;
}
.webcam-snap:hover { background: var(--lime2); }

/* ACCURACY SLIDER */
.slider-block { display: flex; flex-direction: column; gap: 6px; }
.slider-header { display: flex; justify-content: space-between; }
.slider-val { color: var(--lime); font-size: 12px; font-weight: 700; }
input[type=range].vis-range {
  -webkit-appearance: none; width: 100%;
  height: 3px; border-radius: 2px; outline: none; cursor: pointer;
}
input[type=range].vis-range::-webkit-slider-thumb {
  -webkit-appearance: none; width: 14px; height: 14px;
  background: var(--lime); border-radius: 50%;
  border: 2px solid var(--bg); box-shadow: 0 0 6px rgba(200,240,80,0.5);
}
.slider-labels { display: flex; justify-content: space-between; font-size: 7px; color: var(--muted2); margin-top: 2px; }

/* SEARCH BTN */
.search-btn {
  background: var(--lime);
  color: var(--bg);
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2.5px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-top: auto;
}
.search-btn:hover:not(:disabled) { background: var(--lime2); box-shadow: 0 4px 16px rgba(200,240,80,0.2); }
.search-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.btn-spinner {
  width: 10px; height: 10px;
  border: 2px solid rgba(9,11,6,0.4);
  border-top-color: var(--bg);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* MAIN */
.main { flex: 1; padding: 28px 32px; display: flex; flex-direction: column; gap: 20px; min-width: 0; }

/* RESULTS HEADER */
.results-header { display: flex; align-items: center; justify-content: space-between; }
.results-title { font-family: var(--display); font-size: 18px; letter-spacing: 3px; color: var(--lime); }
.results-meta { font-size: 9px; color: var(--muted); letter-spacing: 1.5px; }
.reset-btn {
  background: transparent; border: 1px solid var(--muted2);
  color: var(--lime2); padding: 6px 14px;
  font-family: var(--mono); font-size: 9px; letter-spacing: 1.5px;
  border-radius: 3px; cursor: pointer; transition: all 0.15s;
}
.reset-btn:hover { border-color: var(--lime); color: var(--lime); }

/* IMAGE GRID */
.img-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.img-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  transition: border-color 0.2s, transform 0.2s;
  animation: fadeUp 0.35s ease both;
}
.img-card:hover { border-color: var(--muted2); transform: translateY(-2px); }
.img-card img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
.img-foot {
  padding: 7px 10px;
  display: flex; justify-content: space-between; align-items: center;
  font-size: 8.5px; color: var(--muted); letter-spacing: 1px;
  border-top: 1px solid var(--border);
}
.dist-tag {
  background: var(--dark); border: 1px solid var(--border2);
  color: var(--lime2); font-size: 7.5px; padding: 2px 6px;
  border-radius: 2px; letter-spacing: 1px;
}

.img-overlay {
  position: absolute; inset: 0;
  background: rgba(9,11,6,0.75);
  display: flex; align-items: center; justify-content: center; gap: 8px;
  opacity: 0; transition: opacity 0.18s;
}
.img-card:hover .img-overlay { opacity: 1; }
.ov-btn {
  padding: 6px 12px; font-size: 8px; font-family: var(--mono);
  letter-spacing: 1px; border-radius: 3px; cursor: pointer;
  font-weight: 700; transition: all 0.15s;
}
.ov-btn.view { background: var(--lime); color: var(--bg); border: none; }
.ov-btn.save {
  background: transparent; color: var(--lime2);
  border: 1px solid var(--muted2);
}
.ov-btn:hover { filter: brightness(1.1); }

/* PAGINATION */
.pagination { display: flex; align-items: center; justify-content: center; gap: 4px; }
.page-btn {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-family: var(--mono);
  border: 1px solid var(--border2); border-radius: 3px;
  background: transparent; color: var(--muted); cursor: pointer;
  transition: all 0.15s;
}
.page-btn:hover { border-color: var(--muted2); color: var(--text); }
.page-btn.active { background: var(--lime); color: var(--bg); border-color: var(--lime); font-weight: 700; }
.page-btn:disabled { opacity: 0.25; cursor: not-allowed; }

/* PREVIEW MODAL */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(9,11,6,0.9);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}
.modal {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 8px;
  padding: 20px;
  max-width: 480px;
  width: 90%;
  position: relative;
}
.modal img { width: 100%; border-radius: 6px; max-height: 380px; object-fit: contain; }
.modal-label { font-size: 10px; color: var(--muted); letter-spacing: 1.5px; margin-top: 10px; }
.modal-close {
  position: absolute; top: 12px; right: 12px;
  background: var(--dark); border: 1px solid var(--border2); color: var(--muted);
  width: 24px; height: 24px; border-radius: 3px; font-size: 12px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}

/* EMPTY STATE */
.empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px;
  color: var(--muted); font-size: 10px; letter-spacing: 2px;
}
.empty-icon { font-size: 40px; opacity: 0.3; }

/* SCANLINES */
.scanlines {
  pointer-events: none; position: fixed; inset: 0; z-index: 999;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(200,240,80,0.008) 2px, rgba(200,240,80,0.008) 4px);
}

/* KEYFRAMES */
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
`;

/* ══════════════════════════════════════════
   COMPONENTS
══════════════════════════════════════════ */

/* ── FileInputArea ── */
function FileInputArea({ onFile, preview, onClear }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handle = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    onFile(file);
  };

  return (
    <div
      className={`drop-zone ${drag ? 'drag' : ''}`}
      onClick={() => !preview && inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
    >
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => handle(e.target.files[0])} />
      {preview ? (
        <>
          <img src={preview} alt="Selected" />
          <button className="drop-clear" onClick={(e) => { e.stopPropagation(); onClear(); }}>×</button>
        </>
      ) : (
        <>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8ac030" strokeWidth="1.5">
            <rect x="2" y="2" width="20" height="20" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <div className="drop-text">DROP IMAGE OR CLICK TO BROWSE</div>
          <div className="drop-text" style={{ fontSize: 7, color: 'var(--muted2)', marginTop: -4 }}>
            PNG · JPG · WEBP · AVIF · MAX 10MB
          </div>
        </>
      )}
    </div>
  );
}

/* ── WebcamCapture ── */
function WebcamCapture({ onCapture }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [active, setActive] = useState(false);
  const streamRef = useRef(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setActive(true);
    } catch {
      alert('Camera permission denied.');
    }
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setActive(false);
  };

  const snap = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    c.toBlob((blob) => {
      const file = new File([blob], 'webcam.jpg', { type: 'image/jpeg' });
      onCapture(file);
      stop();
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="webcam-wrap">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {active ? (
        <>
          <video ref={videoRef} style={{ width: '100%' }} />
          <button className="webcam-snap" onClick={snap}>⬤ CAPTURE</button>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <button
            onClick={start}
            style={{ background: 'transparent', border: '1px solid var(--muted2)', color: 'var(--lime2)', padding: '7px 16px', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 2, borderRadius: 3, cursor: 'pointer' }}
          >
            START CAMERA
          </button>
        </div>
      )}
    </div>
  );
}

/* ── AccuracySlider ── */
function AccuracySlider({ value, onChange }) {
  const pct = Math.round(value * 100);
  const bg = `linear-gradient(to right, #8ac030 ${pct}%, #1a2a08 ${pct}%)`;
  return (
    <div className="slider-block">
      <div className="sec-label">Accuracy threshold</div>
      <div className="slider-header">
        <span style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: 1 }}>DISTANCE CUTOFF</span>
        <span className="slider-val">{value.toFixed(2)}</span>
      </div>
      <input type="range" className="vis-range" min={0} max={100} step={1} value={pct}
        style={{ background: bg }}
        onChange={(e) => onChange(e.target.value / 100)} />
      <div className="slider-labels"><span>LOOSE</span><span>PRECISE</span></div>
    </div>
  );
}

/* ── ImageCard ── */
function ImageCard({ result, index, onPreview,show}) {
  const src = `data:image/jpeg;base64,${result.image}`;
  return (
    <div className="img-card" style={{ animationDelay: `${index * 60}ms` }}>
      <img src={src} alt={result.text} />
      <div className="img-overlay">
        <button className="ov-btn view" onClick={() => onPreview(result)}>VIEW</button>
        <a href={src} download={`result-${index + 1}.jpg`} className="ov-btn save" style={{ textDecoration: 'none' }}>SAVE</a>
      </div>
      <div className="img-foot">
        {show.filename && <span>{result.text?.slice(0, 18) || `IMG_${String(index + 1).padStart(3, '0')}`}</span>}
        {show.scores && <span className="dist-tag">{Number(result.distance).toFixed(3)}</span>}
      </div>
    </div>
  );
}

/* ── Pagination ── */
function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
        else if (pages[pages.length - 1] !== '…') pages.push('…');
    }

    return (
        <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => onChange(page - 1)}>‹</button>
            {pages.map((p, i) =>
                p === '…'
                    ? <span key={i} style={{ color: 'var(--muted)', fontSize: 10 }}>…</span>
                    : <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onChange(p)}>{p}</button>
            )}
            <button className="page-btn" disabled={page === totalPages} onClick={() => onChange(page + 1)}>›</button>
        </div>
    );
}

/* ── PreviewModal ── */
function PreviewModal({ result, onClose }) {
  if (!result) return null;
  const src = `data:image/jpeg;base64,${result.image}`;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <img src={src} alt={result.text} />
        <div className="modal-label">{result.text}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <a href={src} download="image.jpg" style={{ flex: 1, textAlign: 'center', padding: '9px', background: 'var(--lime)', color: 'var(--bg)', borderRadius: 3, fontSize: 9, fontFamily: 'var(--mono)', fontWeight: 700, letterSpacing: 2, textDecoration: 'none' }}>
            ↓ DOWNLOAD
          </a>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--muted)', borderRadius: 3, fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: 2, cursor: 'pointer' }}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   APP
══════════════════════════════════════════ */
export default function App() {
  const [source, setSource] = useState('file'); // 'file' | 'webcam' | 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [accuracy, setAccuracy] = useState(0.75);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [previewModal, setPreviewModal] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [show,setShow] = useState({scores:true,filename:true})
  const PER_PAGE = 6;

  const handleFile = useCallback(async (file) => {
    setSelectedFile(file);
    setPreview(await toB64Preview(file));
    setResults([]); setHasSearched(false);
  }, []);

  const clearInput = () => {
    setSelectedFile(null); setPreview(null);
    setResults([]); setHasSearched(false); setResponseTime(null);
  };

  const reset = () => {
    clearInput(); setUrlInput(''); setPage(1); setTotalResults(0);
  };

  const canSearch = !loading && (selectedFile || (source === 'url' && urlInput.trim()));

 const doSearch = async (pageNum = 1) => {
    setLoading(true);
    const form = new FormData();
    if (selectedFile) form.append('image', selectedFile);
    if (source === 'url') form.append('image_url', urlInput);
    form.append('page',     pageNum);
    form.append('limit',    PER_PAGE);
    form.append('distance', accuracy);   // ← sends slider value to backend

    const t0 = performance.now();
    try {
        const res  = await axios.post('http://localhost:3000/search', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        const ms   = (performance.now() - t0).toFixed(0);
        const data = res.data;           // now always { results, total, page, limit, totalPages }

        setResponseTime(ms);
        setResults(data.results);        // only the current page
        setTotalResults(data.total);     // real count for pagination
        setPage(data.page);
        setTotalPages(data.totalPages);
        setHasSearched(true);
    } catch (e) {
        if (e.response?.status === 404) {
            setResults([]);
            setTotalResults(0);
            setHasSearched(true);
        } else {
            console.error(e);
        }
    } finally {
        setLoading(false);
    }
};

// Results for the current page come directly from the backend now — no client-side slicing needed
const currentPageResults = results;

  const handlePageChange = (p) => {
    setPage(p);
    doSearch(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // const currentPageResults = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  // If backend returns paginated results directly, use: const currentPageResults = results;

const handleCheckboxChange = (e,label)=>{
  console.log(e.target.checked,label)
  switch(label){
    case "Show filename labels":setShow(prev=>({...prev,filename:e.target.checked}))
    case "Show distance scores":setShow(prev=>({...prev,scores:e.target.checked}))
  }
}
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="scanlines" />

      <div className="app">
        {/* TOP BAR */}
        <header className="topbar">
          <div>
            <div className="logo">VISEARCH</div>
            <div className="logo-sub">VECTOR IMAGE RETRIEVAL</div>
          </div>
          <div className="topbar-badges">
            <div className={`badge ${hasSearched ? 'active' : ''}`}>
              {hasSearched ? `${totalResults} RESULTS` : 'AWAITING QUERY'}
            </div>
            {responseTime && <div className="badge time">{responseTime}ms</div>}
            <div className="badge active">DB CONNECTED</div>
          </div>
        </header>

        <div className="layout">
          {/* SIDEBAR */}
          <aside className="sidebar">
            {/* Source Tabs */}
            <div>
              <div className="sec-label">Input source</div>
              <div className="tab-row">
                {['file', ].map((s) => (  // 'url','webcam'
                  <button key={s} className={`tab ${source === s ? 'active' : ''}`}
                    onClick={() => { setSource(s); clearInput(); }}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            {source === 'file' && (
              <FileInputArea onFile={handleFile} preview={preview} onClear={clearInput} />
            )}
            {source === 'webcam' && (
              <WebcamCapture onCapture={handleFile} />
            )}
            {source === 'url' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="sec-label">Image URL</div>
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--border2)',
                    borderRadius: 4, padding: '9px 10px', color: 'var(--text)',
                    fontFamily: 'var(--mono)', fontSize: 10, outline: 'none', width: '100%'
                  }}
                />
              </div>
            )}

            {/* Accuracy */}
            <AccuracySlider value={accuracy} onChange={setAccuracy} />

            {/* Options */}
            <div>
              <div className="sec-label">Display options</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  'Show distance scores',
                  'Show filename labels',
                ].map((label) => (
                  <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 9, color: 'var(--muted)', cursor: 'pointer', letterSpacing: 1 }}>
                    <input type="checkbox" onChange={(event)=>handleCheckboxChange(event,label)} defaultChecked style={{ accentColor: 'var(--lime)', width: 12, height: 12 }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ flex: 1 }} />

            <button className="search-btn" onClick={() => doSearch(1)} disabled={!canSearch}>
              {loading ? <><span className="btn-spinner" /> SEARCHING…</> : 'FIND SIMILAR ▶'}
            </button>
          </aside>

          {/* MAIN CONTENT */}
          <main className="main">
            {hasSearched && (
              <div className="results-header">
                <div>
                  <div className="results-title">RESULTS</div>
                  <div className="results-meta">
                    PAGE {page} · {results.length} OF {totalResults} MATCHES · THRESHOLD {accuracy.toFixed(2)}
                  </div>
                </div>
                <button className="reset-btn" onClick={reset}>↺ NEW SEARCH</button>
              </div>
            )}

            {!hasSearched && !loading ? (
              <div className="empty">
                <div className="empty-icon">◎</div>
                <div>SELECT AN IMAGE TO BEGIN VISUAL SEARCH</div>
                <div style={{ fontSize: 8, color: 'var(--muted2)', letterSpacing: 1.5 }}>
                  UPLOAD · WEBCAM · OR PASTE A URL
                </div>
              </div>
            ) : (
              <>
                <div className="img-grid">
                  {loading && results.length === 0
                    ? Array.from({ length: PER_PAGE }).map((_, i) => (
                        <div key={i} className="img-card" style={{ animationDelay: `${i * 50}ms` }}>
                          <div style={{ aspectRatio: 1, background: 'linear-gradient(135deg, var(--dark), var(--surface))', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(200,240,80,0.05), transparent)', animation: 'spin 1.5s linear infinite', transformOrigin: '50% 50%' }} />
                          </div>
                          <div className="img-foot">
                            <div style={{ width: 60, height: 6, background: 'var(--dark)', borderRadius: 2 }} />
                            <div style={{ width: 32, height: 6, background: 'var(--dark)', borderRadius: 2 }} />
                          </div>
                        </div>
                      ))
                    : currentPageResults.map((r, i) => (
                        <ImageCard key={i} result={r} index={i} onPreview={setPreviewModal} show={show}/>
                      ))
                  }
                </div>

                {!loading && results.length > 0 && (
                  <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <PreviewModal result={previewModal} onClose={() => setPreviewModal(null)} />
    </>
  );
}