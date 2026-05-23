// src/pages/ARImageView.jsx
// AR viewer for AI-generated models (Image-to-3D).
// Accepts ?url=<encoded_glb_url> — no backend fetch required.
// Identical UI/UX to ARView.jsx (model-viewer with ar-overlay).

import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const getBackend = () => `http://${window.location.hostname}:5000`;

function useModelViewerScript() {
  const [loaded, setLoaded] = useState(!!customElements.get('model-viewer'));

  useEffect(() => {
    if (!document.querySelector('script[data-mv]')) {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
      s.setAttribute('data-mv', 'true');
      document.head.appendChild(s);
    }
    
    customElements.whenDefined('model-viewer').then(() => setLoaded(true));
  }, []);

  return loaded;
}

// ── Search Panel (same as ARView) ─────────────────────────────────────────────
function SearchPanel({ onAdd, onClose }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(null);

  const search = async () => {
    if (!q.trim()) return;
    setBusy(true);
    try {
      const r = await fetch(`${getBackend()}/api/search?q=${encodeURIComponent(q)}`);
      const d = await r.json();
      setResults(d.results || []);
    } catch { setResults([]); }
    setBusy(false);
  };

  const add = async (m) => {
    setAdding(m.uid);
    try {
      const r = await fetch(`${getBackend()}/api/model/${m.uid}`);
      const d = await r.json();
      if (d.modelUrl) onAdd({ uid: m.uid, name: m.name, modelUrl: d.modelUrl, thumbnail: m.thumbnail });
    } catch {}
    setAdding(null);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 10px' }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#8B5E3C', letterSpacing: '0.1em' }}>➕ Add Object</p>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: 34, height: 34, borderRadius: '50%', fontSize: 18, cursor: 'pointer' }}>×</button>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px' }}>
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="sofa, chair, lamp, table…" autoFocus
          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,94,60,0.2)', borderRadius: 12, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
        <button onClick={search} style={{ background: 'rgba(139,94,60,0.1)', border: '1px solid rgba(139,94,60,0.3)', color: '#8B5E3C', borderRadius: 12, padding: '0 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {busy ? '…' : 'Go'}
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 32px' }}>
        {!results.length && <p style={{ color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 40, fontSize: 13 }}>Search furniture &amp; decor</p>}
        {results.map(m => (
          <div key={m.uid} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {m.thumbnail
              ? <img src={m.thumbnail} alt="" style={{ width: 54, height: 54, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
              : <div style={{ width: 54, height: 54, borderRadius: 10, background: 'rgba(139,94,60,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink:0 }}>📦</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{m.author}</p>
            </div>
            <button onClick={() => add(m)} disabled={!!adding}
              style={{ background: adding === m.uid ? 'rgba(139,94,60,0.05)' : 'rgba(139,94,60,0.15)', border: '1px solid rgba(139,94,60,0.4)', color: '#8B5E3C', borderRadius: 20, padding: '7px 16px', fontSize: 12, fontWeight: 800, cursor: adding ? 'default' : 'pointer', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {adding === m.uid ? '…' : '＋ Add'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ARImageView() {
  const navigate = useNavigate();
  const isMvReady = useModelViewerScript();

  // Read ?url= from query string
  const params = new URLSearchParams(window.location.search);
  const modelUrl = params.get('url');

  const mvRef = useRef(null);
  const rotRAF = useRef(null);
  const overlayRef = useRef(null);

  const [brightness, setBrightness] = useState(1.0);
  const [showSearch, setShowSearch] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [objects, setObjects] = useState(
    modelUrl ? [{ uid: 'ai-model', name: 'AI Generated Model', modelUrl, thumbnail: null }] : []
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeModelUrl, setActiveModelUrl] = useState(modelUrl);

  useEffect(() => {
    if (objects[activeIdx]) setActiveModelUrl(objects[activeIdx].modelUrl);
  }, [activeIdx, objects]);

  // Safety timeout: Force hide loader after 5s if onLoad doesn't fire
  useEffect(() => {
    const timer = setTimeout(() => setModelLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    mvRef.current?.setAttribute('exposure', String(brightness));
  }, [brightness]);

  const startRotate = useCallback((dir) => {
    if (rotRAF.current) return;
    const tick = () => {
      try {
        const mv = mvRef.current;
        if (!mv) return;
        const o = mv.getCameraOrbit();
        mv.cameraOrbit = `${o.theta + dir * 0.06}rad ${o.phi}rad ${o.radius}m`;
      } catch (_) {}
      rotRAF.current = requestAnimationFrame(tick);
    };
    rotRAF.current = requestAnimationFrame(tick);
  }, []);

  const stopRotate = useCallback(() => {
    if (rotRAF.current) { cancelAnimationFrame(rotRAF.current); rotRAF.current = null; }
  }, []);

  const addObject = useCallback((obj) => {
    setObjects(prev => { const n = [...prev, obj]; setActiveIdx(n.length - 1); return n; });
    setShowSearch(false);
  }, []);

  // Loading state
  if (!modelUrl) return (
    <div style={S.screen}>
      <style>{KF}</style>
      <div style={{ textAlign: 'center', padding: 24 }}>
        <p style={{ color: '#f87171', fontSize: 14 }}>⚠️ No model URL provided.</p>
        <button onClick={() => navigate('/assets')} style={{ ...S.retryBtn, marginTop: 16 }}>Go back</button>
      </div>
    </div>
  );

  const isReallyLoading = !isMvReady || modelLoading;

  return (
    <div style={S.screen}>
      <style>{KF + RANGE_CSS + MV_CSS}</style>

      {/* ── Premium Loader ── */}
      {isReallyLoading && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 200, background: '#0A0A0A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <div style={{ position: 'relative', width: 80, height: 80 }}>
            <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(255,255,255,0.05)', borderRadius: '50%' }} />
            <div style={{ ...S.ring, width: 80, height: 80, borderWidth: 2, borderTopColor: '#8B5E3C' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: '#8B5E3C', letterSpacing: '0.6em', textTransform: 'uppercase', animation: 'pulse 2s infinite' }}>Materializing Asset</p>
            <p style={{ margin: '8px 0 0', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Studio Syncing • Neural Buffer Active</p>
          </div>
        </div>
      )}

      {/* ── model-viewer ── */}
      {activeModelUrl && (
        <model-viewer
          ref={mvRef}
          src={activeModelUrl}
          onLoad={() => setModelLoading(false)}
          alt="AR model"
          ar
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="auto"
          ar-placement="floor"
          camera-controls
          auto-rotate
          interaction-prompt="none"
          interpolation-decay="200"
          orbit-sensitivity="1.5"
          camera-orbit="auto auto auto"
          field-of-view="auto"
          min-field-of-view="5deg"
          max-field-of-view="auto"
          shadow-intensity="2.5"
          shadow-softness="1"
          environment-image="neutral"
          exposure={String(brightness)}
          loading="eager"
          reveal="auto"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'transparent', zIndex: 1 }}
        >
          {/* Background vibes — hidden automatically in AR */}
          <div className="ar-background-vibes" style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 50% 40%, #151515 0%, #0A0A0A 100%)', zIndex:-1 }} />
          <div className="ar-background-vibes" style={{ position:'absolute', inset:0, opacity:0.03, pointerEvents:'none', background:'repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 2px)', backgroundSize:'100% 2px', zIndex:-1 }} />

          {/* AR button */}
          <button slot="ar-button" style={S.arBtn}>
            <span style={{ fontSize: 22 }}>⬡</span>
            View in AR
          </button>

          {/* AR overlay — renders INSIDE the camera session */}
          <div slot="ar-overlay" ref={overlayRef} style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            pointerEvents: 'none',
          }}>
            <div style={{
              pointerEvents: 'auto',
              background: 'rgba(10,10,10,0.85)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              borderTop: '1px solid rgba(139,94,60,0.3)',
              borderRadius: '32px 32px 0 0',
              padding: '20px 24px 40px',
              boxShadow: '0 -20px 40px rgba(0,0,0,0.4)'
            }}>
              {/* Rotation row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 18 }}>
                <button
                  onPointerDown={() => startRotate(-1)} onPointerUp={stopRotate}
                  onPointerLeave={stopRotate} onPointerCancel={stopRotate}
                  style={S.rotBtn}
                >↺</button>

                <div style={{ flex: 1, textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 10, color: 'rgba(139,94,60,0.8)', letterSpacing: '0.3em', fontWeight: 900 }}>ROTATE</p>
                  <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Hold button · Pinch to scale</p>
                </div>

                <button
                  onPointerDown={() => startRotate(1)} onPointerUp={stopRotate}
                  onPointerLeave={stopRotate} onPointerCancel={stopRotate}
                  style={S.rotBtn}
                >↻</button>
              </div>

              {/* Brightness slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>☀️</span>
                <input
                  type="range" min="0.2" max="3" step="0.05"
                  value={brightness}
                  onChange={e => {
                    const v = parseFloat(e.target.value);
                    setBrightness(v);
                    mvRef.current?.setAttribute('exposure', String(v));
                  }}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 12, color: '#8B5E3C', minWidth: 30, textAlign: 'right', fontWeight: 700 }}>{brightness.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </model-viewer>
      )}

      {/* Top bar */}
      <div style={{ ...S.topBar, opacity: isReallyLoading ? 0 : 1, transition: 'opacity 0.5s' }}>
        <button onClick={() => navigate('/assets')} style={S.iconBtn}>←</button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#8B5E3C', letterSpacing: '0.1em' }}>ARtisan</p>
          <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
            {objects[activeIdx]?.name || 'AI Generated Model'}
            {objects.length > 1 ? ` · ${objects.length} objects` : ''}
          </p>
        </div>
        <button
          onClick={() => setShowSearch(true)}
          style={{ ...S.iconBtn, width: 'auto', padding: '0 16px', fontSize: 12, fontWeight: 800, color: '#8B5E3C', border: '1px solid rgba(139,94,60,0.3)', background: 'rgba(139,94,60,0.05)', textTransform: 'uppercase', letterSpacing: '0.1em' }}
        >
          ➕ Add Object
        </button>
      </div>

      {/* Objects strip */}
      {objects.length > 1 && (
        <div style={{ position: 'absolute', top: 76, left: 0, right: 0, zIndex: 25, padding: '4px 14px', background: 'linear-gradient(to bottom,rgba(10,10,10,0.8),transparent)' }}>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '4px 0' }}>
            {objects.map((o, i) => (
              <div key={i} onClick={() => setActiveIdx(i)}
                style={{ background: i === activeIdx ? 'rgba(139,94,60,0.2)' : 'rgba(0,0,0,0.4)', border: `1px solid ${i === activeIdx ? 'rgba(139,94,60,0.6)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 20, padding: '6px 16px', cursor: 'pointer', flexShrink: 0, transition: 'all 0.3s' }}>
                <span style={{ fontSize: 11, color: i === activeIdx ? '#8B5E3C' : '#F4F1EE', whiteSpace: 'nowrap', fontWeight: i === activeIdx ? 800 : 400 }}>{o.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pre-AR hint */}
      {!showSearch && activeModelUrl && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '10px 20px 32px', background: 'linear-gradient(to top,rgba(10,10,10,0.95) 40%,transparent)', textAlign: 'center', pointerEvents: 'none' }}>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(244,241,238,0.4)', letterSpacing: '0.05em' }}>
            Drag to rotate · Tap <strong style={{ color: '#8B5E3C' }}>View in AR</strong> to enter real space
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 9, color: 'rgba(244,241,238,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Pinch to scale · Hold ↺↻ to rotate · Exposure control — all in AR
          </p>
        </div>
      )}

      {showSearch && <SearchPanel onAdd={addObject} onClose={() => setShowSearch(false)} />}
    </div>
  );
}

const KF = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
  * { box-sizing: border-box; }
`;

const RANGE_CSS = `
  input[type=range] { -webkit-appearance:none; height:4px; border-radius:4px; background:rgba(255,255,255,0.1); outline:none; cursor:pointer; width:100%; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:24px; height:24px; border-radius:50%; background:#8B5E3C; border:3px solid #1A1A1A; box-shadow:0 4px 12px rgba(0,0,0,0.4); cursor:pointer; }
  input[type=range]::-webkit-slider-runnable-track { background:linear-gradient(to right,rgba(139,94,60,0.8),rgba(139,94,60,0.2)); border-radius:4px; height:4px; }
  ::-webkit-scrollbar { display:none; }
`;

const MV_CSS = `
  model-viewer { --progress-bar-color: #8B5E3C; --progress-bar-height: 2px; }
  model-viewer[ar-status="session-started"] > .ar-background-vibes { display: none; }
  .ar-background-vibes { pointer-events: none; }
`;

const S = {
  screen: { width: '100vw', height: '100dvh', background: '#0A0A0A', fontFamily: '"Inter", system-ui, sans-serif', color: '#F4F1EE', position: 'relative', overflow: 'hidden' },
  ring: { width:48, height:48, border:'2px solid rgba(139,94,60,0.1)', borderTop:'2px solid #8B5E3C', borderRadius:'50%', animation:'spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite' },
  retryBtn: { background: 'rgba(139,94,60,0.15)', border: '1px solid rgba(139,94,60,0.4)', color: '#8B5E3C', padding: '12px 32px', borderRadius: 50, fontSize: 12, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.2em' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30, padding: '20px 20px 14px', background: 'linear-gradient(to bottom,rgba(10,10,10,0.9) 60%,transparent)', display: 'flex', alignItems: 'center', gap: 12, backdropFilter: 'blur(10px)' },
  iconBtn: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: 42, height: 42, borderRadius: 12, fontSize: 18, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' },
  arBtn: { position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#8B5E3C', color: '#fff', padding: '18px 42px', borderRadius: 12, fontSize: 14, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 20px 40px rgba(139,94,60,0.3)', whiteSpace: 'nowrap', letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', transition: 'all 0.3s' },
  rotBtn: { background: 'rgba(139,94,60,0.1)', border: '1px solid rgba(139,94,60,0.3)', color: '#8B5E3C', borderRadius: 16, width: 64, height: 64, fontSize: 28, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', flexShrink: 0 },
};
