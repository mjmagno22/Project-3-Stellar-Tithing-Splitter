'use client';

import { useState, useMemo, useCallback } from 'react';
import { buildSep7Uri } from '@/lib/sep7';
import QrDisplay from '@/components/QrDisplay';

interface Ministry {
  id: string;
  name: string;
  address: string;
  percent: number;
}

const USDC_ISSUER = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

let nextId = 1;
function freshId() { return `m${nextId++}`; }

export default function Home() {
  const [minAmount, setMinAmount] = useState('');
  const [asset, setAsset] = useState<'XLM' | 'USDC'>('XLM');
  const [ministries, setMinistries] = useState<Ministry[]>([
    { id: freshId(), name: 'Main Church', address: '', percent: 50 },
    { id: freshId(), name: 'Youth Ministry', address: '', percent: 30 },
    { id: freshId(), name: 'Charity & Outreach', address: '', percent: 20 },
  ]);
  const [selectedMinistry, setSelectedMinistry] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'setup' | 'donate'>('setup');
  const [qrMode, setQrMode] = useState<'simple' | 'full'>('simple');

  // Normalize percentages to always sum to 100
  const totalPct = useMemo(() => ministries.reduce((s, m) => s + m.percent, 0), [ministries]);

  const updateMinistry = useCallback((id: string, field: keyof Ministry, value: string | number) => {
    setMinistries(prev => {
      const next = prev.map(m => m.id === id ? { ...m, [field]: value } : m);
      // If a percentage changed, normalize the rest to sum to 100
      if (field === 'percent') {
        const changed = next.find(m => m.id === id)!;
        const others = next.filter(m => m.id !== id);
        const totalOthers = others.reduce((s, m) => s + m.percent, 0);
        const newVal = Number(value);
        if (others.length > 0 && totalOthers > 0) {
          const remaining = Math.max(0, 100 - newVal);
          others.forEach(m => {
            m.percent = Math.round((m.percent / totalOthers) * remaining);
          });
          // Fix rounding: adjust last to make exact 100
          const sum = next.reduce((s, m) => s + m.percent, 0);
          if (sum !== 100 && others.length > 0) {
            others[others.length - 1].percent += (100 - sum);
          }
        }
      }
      return next;
    });
  }, []);

  const addMinistry = useCallback(() => {
    setMinistries(prev => [...prev, { id: freshId(), name: '', address: '', percent: 0 }]);
  }, []);

  const removeMinistry = useCallback((id: string) => {
    setMinistries(prev => prev.filter(m => m.id !== id).map((m, i, arr) => ({
      ...m,
      percent: Math.round(100 / arr.length),
    })));
  }, []);

  const totalAmount = useMemo(() => {
    const n = Number(minAmount);
    return isNaN(n) ? 0 : n;
  }, [minAmount]);

  const breakdown = useMemo(() => {
    if (!totalAmount) return [];
    return ministries.map(m => ({
      ...m,
      share: (totalAmount * m.percent / 100),
    }));
  }, [totalAmount, ministries]);

  const selectedBreakdown = useMemo(() => {
    if (!selectedMinistry) return null;
    return breakdown.find(b => b.id === selectedMinistry) || null;
  }, [selectedMinistry, breakdown]);

  const qrUri = useMemo(() => {
    if (!selectedBreakdown || !selectedBreakdown.address) return '';
    if (qrMode === 'simple') return selectedBreakdown.address;
    return buildSep7Uri({
      destination: selectedBreakdown.address,
      amount: selectedBreakdown.share.toFixed(7).replace(/\.?0+$/, ''),
      assetCode: asset,
      assetIssuer: asset === 'USDC' ? USDC_ISSUER : undefined,
      memo: `Tithe: ${selectedBreakdown.name}`,
    });
  }, [selectedBreakdown, asset, qrMode]);

  const allQrUris = useMemo(() => {
    return breakdown.filter(b => b.address).map(b => ({
      name: b.name,
      share: b.share,
      uri: qrMode === 'simple'
        ? b.address
        : buildSep7Uri({
            destination: b.address,
            amount: b.share.toFixed(7).replace(/\.?0+$/, ''),
            assetCode: asset,
            assetIssuer: asset === 'USDC' ? USDC_ISSUER : undefined,
            memo: `Tithe: ${b.name}`,
          }),
    }));
  }, [breakdown, asset, qrMode]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-[var(--color-border)] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <span className="font-sans text-lg font-semibold text-[var(--foreground)]">Tithing Splitter</span>
              <span className="ml-2 rounded-full bg-[var(--color-muted)] px-2.5 py-0.5 font-body text-[11px] font-medium text-[var(--color-muted-fg)]">Transparent Giving</span>
            </div>
          </div>
          <div className="flex rounded-lg border border-[var(--color-border)] p-0.5">
            <button onClick={() => setActiveTab('setup')} className={`cursor-pointer rounded-md px-3 py-1.5 font-body text-xs font-medium transition-all active:scale-[0.95] ${activeTab === 'setup' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-muted-fg)] hover:text-[var(--foreground)]'}`}>Setup</button>
            <button onClick={() => setActiveTab('donate')} className={`cursor-pointer rounded-md px-3 py-1.5 font-body text-xs font-medium transition-all active:scale-[0.95] ${activeTab === 'donate' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-muted-fg)] hover:text-[var(--foreground)]'}`}>Donate</button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12">
        {activeTab === 'setup' ? (
          /* ══════ SETUP TAB ══════ */
          <>
            <section className="mb-8 text-center">
              <h1 className="font-sans text-3xl font-bold leading-tight text-[var(--foreground)] sm:text-[2.5rem]">
                Configure Your Ministries
              </h1>
              <p className="mx-auto mt-3 max-w-xl font-body text-base leading-relaxed text-[var(--color-muted-fg)]">
                Set up your church&apos;s ministry allocations. Donors will see exactly where their tithe goes.
              </p>
            </section>

            <div className="rounded-xl border border-[var(--color-border)] bg-white p-7 shadow-sm">
              {/* Ministry list */}
              <div className="space-y-3">
                {ministries.map((m, i) => (
                  <div key={m.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-body text-xs font-medium text-[var(--color-muted-fg)]">Ministry #{i + 1}</span>
                      {ministries.length > 1 && (
                        <button onClick={() => removeMinistry(m.id)} className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 font-body text-xs font-medium text-red-500 transition hover:bg-red-50 hover:text-red-700 active:scale-[0.95]" aria-label={`Remove ${m.name || `ministry #${i + 1}`}`}>
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-4">
                      <div className="sm:col-span-2">
                        <label htmlFor={`name-${m.id}`} className="sr-only">Ministry name</label>
                        <input id={`name-${m.id}`} type="text" value={m.name} onChange={(e) => updateMinistry(m.id, 'name', e.target.value)} placeholder="Ministry name" className="block w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 font-body text-sm text-[var(--foreground)] placeholder:text-[var(--color-muted-fg)] transition hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_2px_rgba(14,116,144,0.15)] focus:outline-none" />
                      </div>
                      <div className="sm:col-span-1">
                        <label htmlFor={`pct-${m.id}`} className="sr-only">Allocation percentage</label>
                        <div className="relative">
                          <input id={`pct-${m.id}`} type="text" inputMode="numeric" value={m.percent} onChange={(e) => updateMinistry(m.id, 'percent', Number(e.target.value) || 0)} className="block w-full rounded-lg border border-[var(--color-border)] bg-white px-8 py-2.5 font-body text-sm text-[var(--foreground)] text-center transition hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_2px_rgba(14,116,144,0.15)] focus:outline-none" />
                          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-body text-xs text-[var(--color-muted-fg)]">%</span>
                        </div>
                      </div>
                      <div className="sm:col-span-1">
                        <label htmlFor={`addr-${m.id}`} className="sr-only">Stellar address</label>
                        <input id={`addr-${m.id}`} type="text" value={m.address} onChange={(e) => updateMinistry(m.id, 'address', e.target.value)} placeholder="G... address" className="block w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 font-mono text-xs text-[var(--foreground)] placeholder:text-[var(--color-muted-fg)] transition hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_2px_rgba(14,116,144,0.15)] focus:outline-none" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={addMinistry} className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-[var(--color-border)] px-4 py-3 font-body text-xs font-medium text-[var(--color-muted-fg)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] active:scale-[0.99]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Ministry
              </button>

              <div className="mt-4 text-center">
                <p className="font-body text-xs text-[var(--color-muted-fg)]">
                  Total allocation: <span className={totalPct === 100 ? 'font-semibold text-green-600' : 'font-semibold text-red-500'}>
                    {totalPct === 100 ? (
                      <svg className="mr-0.5 inline-block h-3 w-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="mr-0.5 inline-block h-3 w-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                    {totalPct}%
                  </span>
                  {totalPct !== 100 && ' — adjust percentages to sum to 100%'}
                </p>
              </div>

              <div className="mt-6 rounded-lg bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 px-4 py-3">
                <p className="font-body text-xs text-[var(--color-muted-fg)]">
                  <strong>Next:</strong> Switch to the <strong>Donate</strong> tab to enter your tithe amount and see the breakdown.
                </p>
              </div>
            </div>
          </>
        ) : (
          /* ══════ DONATE TAB ══════ */
          <>
            <section className="mb-8 text-center">
              <h1 className="font-sans text-3xl font-bold leading-tight text-[var(--foreground)] sm:text-[2.5rem]">
                Your Tithe, Split Transparently
              </h1>
              <p className="mx-auto mt-3 max-w-xl font-body text-base leading-relaxed text-[var(--color-muted-fg)]">
                Enter your donation amount and see exactly how it&apos;s distributed.
              </p>
            </section>

            <div className="rounded-xl border border-[var(--color-border)] bg-white p-7 shadow-sm">
              {/* Amount + Asset */}
              <div className="mb-6 flex gap-3">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-sans text-lg font-semibold text-[var(--color-muted-fg)]">₱</span>
                  <input type="text" inputMode="decimal" value={minAmount} onChange={(e) => { setMinAmount(e.target.value); setSelectedMinistry(null); }} placeholder="0.00" className="block w-full rounded-lg border border-[var(--color-border)] bg-white py-4 pl-10 pr-4 font-sans text-2xl font-bold text-[var(--foreground)] placeholder:text-[var(--color-muted-fg)] transition hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_2px_rgba(14,116,144,0.15)] focus:outline-none" />
                </div>
                <select value={asset} onChange={(e) => setAsset(e.target.value as 'XLM' | 'USDC')} className="appearance-none rounded-lg border border-[var(--color-border)] bg-white px-4 py-4 font-body text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none">
                  <option value="XLM">XLM</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>

              {totalAmount > 0 ? (
                <>
                  {/* Breakdown table */}
                  <div className="mb-6 overflow-hidden rounded-lg border border-[var(--color-border)]">
                    <table className="w-full text-left font-body text-sm">
                      <thead>
                        <tr className="bg-[var(--color-muted)]">
                          <th className="px-4 py-3 text-xs font-medium text-[var(--color-muted-fg)]">Ministry</th>
                          <th className="px-4 py-3 text-xs font-medium text-[var(--color-muted-fg)]">%</th>
                          <th className="px-4 py-3 text-xs font-medium text-[var(--color-muted-fg)]">Amount</th>
                          <th className="px-4 py-3 text-xs font-medium text-[var(--color-muted-fg)]">Address</th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {breakdown.map((b) => (
                          <tr key={b.id} className={`transition ${selectedMinistry === b.id ? 'bg-[var(--color-primary)]/5' : 'hover:bg-[var(--color-muted)]'}`}>
                            <td className="px-4 py-3 text-xs font-medium text-[var(--foreground)]">{b.name}</td>
                            <td className="px-4 py-3 text-xs text-[var(--color-muted-fg)]">{b.percent}%</td>
                            <td className="px-4 py-3 text-xs font-semibold text-[var(--foreground)]">{b.share.toFixed(2)} {asset}</td>
                            <td className="px-4 py-3 font-mono text-[10px] text-[var(--color-muted-fg)]">{b.address ? `${b.address.slice(0, 6)}...` : '—'}</td>
                            <td className="px-4 py-3">
                              {b.address ? (
                                <button onClick={() => setSelectedMinistry(b.id === selectedMinistry ? null : b.id)} className={`cursor-pointer rounded-md px-2.5 py-1 font-body text-[10px] font-medium transition active:scale-[0.92] ${selectedMinistry === b.id ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white'}`}>
                                  {selectedMinistry === b.id ? 'Selected' : 'QR'}
                                </button>
                              ) : (
                                <span className="text-[10px] text-red-400">No address</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[var(--color-muted)] font-semibold">
                          <td className="px-4 py-3 text-xs text-[var(--foreground)]">Total</td>
                          <td className="px-4 py-3 text-xs text-[var(--color-muted-fg)]">100%</td>
                          <td className="px-4 py-3 text-xs text-[var(--foreground)]">{totalAmount.toFixed(2)} {asset}</td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* QR for selected ministry */}
                  {selectedMinistry && selectedBreakdown && selectedBreakdown.address ? (
                    <div className="flex flex-col items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-6">
                      <p className="font-body text-xs font-medium text-[var(--color-muted-fg)]">
                        Donating to: <span className="font-semibold text-[var(--foreground)]">{selectedBreakdown.name}</span>
                      </p>
                      <p className="font-sans text-2xl font-bold text-[var(--color-primary)]">
                        {selectedBreakdown.share.toFixed(2)} {asset}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-body text-[10px] text-[var(--color-muted-fg)]">Address QR</span>
                        <button
                          onClick={() => setQrMode(qrMode === 'simple' ? 'full' : 'simple')}
                          className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors ${
                            qrMode === 'full' ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
                          }`}
                          role="switch"
                          aria-checked={qrMode === 'full'}
                          aria-label="Toggle between address QR and SEP-7 URI"
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                            qrMode === 'full' ? 'translate-x-[18px]' : 'translate-x-[2px]'
                          }`} />
                        </button>
                        <span className="font-body text-[10px] text-[var(--color-muted-fg)]">Full QR</span>
                      </div>
                      <QrDisplay uri={qrUri} label={`Scan to give to ${selectedBreakdown.name}`} showUri={qrMode === 'full'} />
                    </div>
                  ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                      <p className="font-body text-xs text-amber-700">
                        Click <strong>QR</strong> next to a ministry to generate its donation QR code.
                      </p>
                    </div>
                  )}

                  {/* All QRs for print */}
                  {allQrUris.length > 0 && allQrUris.every(q => q.uri) && (
                    <details className="mt-4">
                      <summary className="cursor-pointer font-body text-xs font-medium text-[var(--color-primary)] hover:underline">Show all ministry QR codes</summary>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {allQrUris.map((q) => (
                          <div key={q.name} className="flex flex-col items-center rounded-lg border border-[var(--color-border)] bg-white p-4">
                            <p className="mb-1 font-body text-xs font-semibold text-[var(--foreground)]">{q.name}</p>
                            <p className="mb-2 font-body text-xs text-[var(--color-muted-fg)]">{q.share.toFixed(2)} {asset}</p>
                            <QrDisplay uri={q.uri} label="" showUri={false} />
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-muted)]">
                    <svg className="h-6 w-6 text-[var(--color-muted-fg)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </div>
                  <p className="font-body text-sm text-[var(--color-muted-fg)]">Enter an amount to see the breakdown across ministries.</p>
                </div>
              )}
            </div>

            {/* How it works */}
            <section className="mt-10 rounded-xl border border-[var(--color-border)] bg-white p-7 shadow-sm">
              <div className="mb-5 flex items-center gap-2 border-b border-[var(--color-border)] pb-4">
                <svg className="h-5 w-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <h2 className="font-sans text-base font-semibold text-[var(--foreground)]">How It Works</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
                  <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-primary)] font-sans text-xs font-bold text-white">1</div>
                  <h3 className="mb-1 font-sans text-sm font-semibold text-[var(--foreground)]">Church sets up splits</h3>
                  <p className="font-body text-xs leading-relaxed text-[var(--color-muted-fg)]">The church configures ministries with their Stellar addresses and allocation percentages in the Setup tab.</p>
                </div>
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
                  <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-primary)] font-sans text-xs font-bold text-white">2</div>
                  <h3 className="mb-1 font-sans text-sm font-semibold text-[var(--foreground)]">Donor enters amount</h3>
                  <p className="font-body text-xs leading-relaxed text-[var(--color-muted-fg)]">The donor sees exactly where their money goes — every ministry&apos;s share calculated in real time.</p>
                </div>
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
                  <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-primary)] font-sans text-xs font-bold text-white">3</div>
                  <h3 className="mb-1 font-sans text-sm font-semibold text-[var(--foreground)]">Scan & pay</h3>
                  <p className="font-body text-xs leading-relaxed text-[var(--color-muted-fg)]">Each ministry gets its own QR code. Donors scan the QR of the ministry they want to support — payment goes directly to that ministry&apos;s wallet.</p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-[var(--color-border)] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <p className="font-body text-xs text-[var(--color-muted-fg)]">Powered by <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--color-primary)] underline decoration-[var(--color-primary)]/30 underline-offset-2 transition hover:decoration-[var(--color-primary)]">Stellar</a> · <a href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md" target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--color-primary)] underline decoration-[var(--color-primary)]/30 underline-offset-2 transition hover:decoration-[var(--color-primary)]">SEP-7</a></p>
          <p className="font-body text-xs text-[var(--color-muted-fg)]">Built for StellarX PH @ PUP QC</p>
        </div>
      </footer>
    </div>
  );
}
