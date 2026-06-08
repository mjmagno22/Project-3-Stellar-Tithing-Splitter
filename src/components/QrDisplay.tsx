'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import QRCode from 'qrcode';

interface QrDisplayProps {
  uri: string;
  label?: string;
  showUri?: boolean;
  className?: string;
}

export default function QrDisplay({ uri, label, showUri = true, className = '' }: QrDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [fullscreenUrl, setFullscreenUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!uri) return;
    let cancelled = false;
    async function generate() {
      try {
        const url = await QRCode.toDataURL(uri, { width: 600, margin: 2, color: { dark: '#000000', light: '#ffffff' }, errorCorrectionLevel: 'M' });
        if (!cancelled) setQrDataUrl(url);
        const bigUrl = await QRCode.toDataURL(uri, { width: 900, margin: 3, color: { dark: '#000000', light: '#ffffff' }, errorCorrectionLevel: 'M' });
        if (!cancelled) setFullscreenUrl(bigUrl);
      } catch (err) { console.error('QR generation failed:', err); }
    }
    generate();
    return () => { cancelled = true; };
  }, [uri]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(uri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [uri]);

  const downloadQR = useCallback(() => {
    if (!downloadRef.current || !qrDataUrl) return;
    downloadRef.current.href = qrDataUrl;
    downloadRef.current.download = `stellar-qr-${Date.now()}.png`;
    downloadRef.current.click();
  }, [qrDataUrl]);

  const handleShare = useCallback(async () => {
    if (navigator.share) { try { await navigator.share({ title: 'Stellar Payment QR', text: uri }); } catch { /* OK */ } }
    else { handleCopy(); }
  }, [uri, handleCopy]);

  if (!qrDataUrl) {
    return <div className="flex items-center justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" /></div>;
  }

  return (
    <>
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <button onClick={() => setFullscreen(true)} className="cursor-pointer rounded-xl border-2 border-[var(--color-border)] bg-white p-3 shadow-sm transition-all hover:border-[var(--color-primary)] hover:shadow-md active:scale-[0.99]" title="Tap to enlarge">
          <img src={qrDataUrl} alt="Stellar QR code" className="max-w-full h-auto" style={{ width: 280, height: 280 }} />
        </button>
        {label && <p className="font-body text-sm font-medium text-[var(--foreground)]">{label}</p>}
        <div className="flex w-full flex-wrap gap-2">
          <button onClick={downloadQR} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 font-body text-xs font-medium text-[var(--color-muted-fg)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] active:scale-[0.97]">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download
          </button>
          <button onClick={() => setFullscreen(true)} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 font-body text-xs font-medium text-[var(--color-muted-fg)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] active:scale-[0.97]">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Enlarge
          </button>
          <button onClick={handleShare} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 font-body text-xs font-medium text-[var(--color-muted-fg)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] active:scale-[0.97]">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            Share
          </button>
        </div>
        {showUri && uri && (
          <div className="w-full">
            <div className="flex gap-2">
              <input type="text" readOnly value={uri} onClick={(e) => (e.target as HTMLInputElement).select()} className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] px-3 py-2.5 font-mono text-xs text-[var(--foreground)]" />
              <button onClick={handleCopy} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 font-body text-xs font-medium text-[var(--color-muted-fg)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] active:scale-[0.97]">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{copied ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /> : <><rect x="9" y="9" width="13" height="13" rx="2" strokeWidth={1.5} /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth={1.5} /></>}</svg>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
      <a ref={downloadRef} className="hidden" />
      {fullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm" onClick={() => setFullscreen(false)}>
          <div className="flex flex-col items-center gap-5 p-8" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-2xl border-4 border-white bg-white p-4 shadow-2xl">
              {fullscreenUrl && <img src={fullscreenUrl} alt="Stellar QR code" className="max-w-[92vw] max-h-[70vh] h-auto w-auto" />}
            </div>
            <p className="font-body text-sm font-medium text-white/80">Scan with your Stellar wallet</p>
            <div className="flex gap-3">
              <button onClick={() => setFullscreen(false)} className="cursor-pointer rounded-lg bg-white/10 px-6 py-2 font-body text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20">Close</button>
              <button onClick={downloadQR} className="cursor-pointer rounded-lg bg-[var(--color-primary)] px-6 py-2 font-body text-sm font-medium text-white transition hover:bg-[var(--color-primary-dark)]">Download PNG</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
