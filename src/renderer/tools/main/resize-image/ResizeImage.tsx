import { useEffect, useRef, useState } from 'react';
import { useAppearance } from '../../../src/useAppearance';
import { MAX_EDGE, MAX_PIXELS, outputName, resizeImage, validDimensions, type Format } from './resize';

type Source = { bitmap: ImageBitmap; name: string; size: number };
type Output = { blob: Blob; url: string; name: string; width: number; height: number; quality: number };
function size(bytes: number) { return bytes < 1_000_000 ? `${Math.max(1, Math.round(bytes / 1000))} KB` : `${(bytes / 1_000_000).toFixed(1)} MB`; }

export default function ResizeImage() {
  useAppearance();
  const picker = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  const [source, setSource] = useState<Source | null>(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [locked, setLocked] = useState(true);
  const [format, setFormat] = useState<Format>('image/png');
  const [quality, setQuality] = useState(90);
  const [output, setOutput] = useState<Output | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState('');
  const [dragging, setDragging] = useState(false);
  const w = Number(width), h = Number(height);
  const valid = validDimensions(w, h);
  const ready = output && output.width === w && output.height === h && output.blob.type === format && (format === 'image/png' || output.quality === quality);

  useEffect(() => () => { generation.current += 1; }, []);
  useEffect(() => () => source?.bitmap.close(), [source]);
  useEffect(() => () => { if (output) URL.revokeObjectURL(output.url); }, [output]);
  useEffect(() => {
    setOutput(null); setStatus('');
    if (!source || !valid || loading) { setProcessing(false); return; }
    let cancelled = false;
    setProcessing(true); setError('');
    const timer = window.setTimeout(() => {
      void resizeImage(source.bitmap, w, h, format, quality / 100).then((blob) => {
        if (!cancelled) setOutput({ blob, url: URL.createObjectURL(blob), name: outputName(source.name, w, h, format), width: w, height: h, quality });
      }).catch((failure) => { if (!cancelled) setError(failure instanceof Error ? failure.message : 'Could not resize the image.'); })
        .finally(() => { if (!cancelled) setProcessing(false); });
    }, 180);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [source, w, h, format, quality, valid, loading]);

  async function load(file: File | undefined) {
    if (!file) return;
    const revision = ++generation.current;
    setError(''); setLoadError(''); setStatus(''); setOutput(null); setLoading(true);
    try {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Choose a PNG, JPEG, or WebP image.');
      if (file.size > 50 * 1024 * 1024) throw new Error('Choose an image smaller than 50 MB.');
      const bitmap = await createImageBitmap(file);
      if (revision !== generation.current) { bitmap.close(); return; }
      if (bitmap.width * bitmap.height > 80_000_000) { bitmap.close(); throw new Error('Choose an image up to 80 megapixels.'); }
      const scale = Math.min(1, MAX_EDGE / bitmap.width, MAX_EDGE / bitmap.height, Math.sqrt(MAX_PIXELS / (bitmap.width * bitmap.height)));
      setWidth(String(Math.max(1, Math.floor(bitmap.width * scale)))); setHeight(String(Math.max(1, Math.floor(bitmap.height * scale))));
      setLocked(true); setFormat(file.type as Format);
      setSource({ bitmap, name: file.name, size: file.size });
    } catch (failure) {
      if (revision === generation.current) setLoadError(failure instanceof Error ? failure.message : 'Could not read this image. Try another file.');
    } finally { if (revision === generation.current) setLoading(false); }
  }
  function changeDimension(axis: 'width' | 'height', value: string) {
    if (axis === 'width') setWidth(value); else setHeight(value);
    if (locked && source && Number(value) > 0) {
      const other = String(Math.max(1, Math.round(Number(value) * (axis === 'width' ? source.bitmap.height / source.bitmap.width : source.bitmap.width / source.bitmap.height))));
      if (axis === 'width') setHeight(other); else setWidth(other);
    }
  }
  function preset(percent: number) {
    if (!source) return;
    setWidth(String(Math.max(1, Math.round(source.bitmap.width * percent))));
    setHeight(String(Math.max(1, Math.round(source.bitmap.height * percent))));
  }
  async function save() {
    if (!output || !ready || processing || loading || saving || !valid) return;
    setSaving(true); setError(''); setStatus('');
    try {
      if (window.betaImageTool) {
        const result = await window.betaImageTool.saveCopy({ bytes: new Uint8Array(await output.blob.arrayBuffer()), name: output.name, format });
        setStatus(result === 'saved' ? 'Resized copy saved.' : 'Save cancelled.');
      } else {
        const link = document.createElement('a'); link.href = output.url; link.download = output.name;
        document.body.append(link); link.click(); link.remove();
        setStatus('Copy sent to downloads.');
      }
    } catch { setError('Could not save the image. Please try again.'); }
    finally { setSaving(false); }
  }

  return <div className="resize-app" onDragOver={(event) => { event.preventDefault(); if (event.dataTransfer.types.includes('Files')) setDragging(true); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }} onDrop={(event) => { event.preventDefault(); setDragging(false); void load(event.dataTransfer.files[0]); }}>
    <header className="resize-header"><span>ZEUS <span>/ Tools</span></span><span className="local-label">Processed on your device</span></header>
    <main>
      <div className="resize-title"><div><h1>Resize Image</h1><p>A different size. A fresh copy.</p></div>{source && <button className="quiet" onClick={() => picker.current?.click()} disabled={loading}>Change image</button>}</div>
      <input className="file-input" ref={picker} type="file" accept="image/png,image/jpeg,image/webp" aria-label="Choose image" onChange={(event) => { void load(event.target.files?.[0]); event.target.value = ''; }} />
      {!source ? <button className={`drop-zone ${dragging ? 'dragging' : ''}`} onClick={() => picker.current?.click()} disabled={loading}><span className="upload-icon" aria-hidden="true">↥</span><strong>{loading ? 'Opening image…' : 'Drop an image here'}</strong><span>or click to choose a file</span><small>PNG, JPEG, WebP · Up to 50 MB</small></button> : <div className="resize-workspace">
        <section className={`image-preview ${dragging ? 'dragging' : ''}`} aria-label="Image preview"><div className="preview-canvas">{output ? <img src={output.url} alt="Resized preview" /> : <span>{loading ? 'Opening image…' : processing ? 'Preparing preview…' : 'Set valid dimensions to preview'}</span>}</div><footer><span title={source.name}>{source.name}</span><span>{source.bitmap.width} × {source.bitmap.height} · {size(source.size)}</span></footer></section>
        <section className="resize-controls" aria-label="Resize options">
          <div className="control-heading"><h2>Dimensions</h2><span>pixels</span></div>
          <div className="dimension-fields"><label>Width<input type="number" min="1" max={MAX_EDGE} step="1" value={width} onChange={(event) => changeDimension('width', event.target.value)} /></label><span aria-hidden="true">×</span><label>Height<input type="number" min="1" max={MAX_EDGE} step="1" value={height} onChange={(event) => changeDimension('height', event.target.value)} /></label></div>
          <label className="ratio-lock"><input type="checkbox" checked={locked} onChange={(event) => { setLocked(event.target.checked); if (event.target.checked && source) setHeight(String(Math.max(1, Math.round(Number(width) * source.bitmap.height / source.bitmap.width)))); }} />Keep aspect ratio</label>
          <div className="presets">{[.25, .5, 1].map((percent) => <button key={percent} onClick={() => preset(percent)}>{percent * 100}%</button>)}</div>
          {!valid && <p className="field-error">Use whole numbers from 1–8192 px, up to 40 megapixels.</p>}
          <label className="format-label">Format<select aria-label="Format" value={format} onChange={(event) => setFormat(event.target.value as Format)}><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select></label>
          {format !== 'image/png' && <label className="quality-label">Quality <span>{quality}%</span><input type="range" min="10" max="100" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /></label>}
          <p className="format-note">{format === 'image/jpeg' ? 'Transparent areas become white in JPEG.' : 'Transparency is preserved.'}</p>
          <div className="export-summary" aria-live="polite">{output && !processing ? `${output.width} × ${output.height} · ${size(output.blob.size)}` : processing ? 'Updating preview…' : 'Choose your output size'}</div>
          <button className="save-copy" disabled={!ready || processing || loading || saving || !valid} onClick={save}>{saving ? 'Saving…' : processing ? 'Preparing…' : 'Save copy'}<span aria-hidden="true">↓</span></button>
          <p className="original-note">Your original stays unchanged.</p>
        </section>
      </div>}
      {(loadError || error) && <p role="alert" className="resize-error">{loadError || error}</p>}
      <p role="status" className="save-status">{status}</p>
    </main>
    {dragging && source && <div className="drop-overlay">Drop to change image</div>}
  </div>;
}
