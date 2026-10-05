import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FLAT_TYPES, Q1, Q2, TOWNS } from '../data/hdbResale2026H1';
import './HdbResaleDashboard.css';

const num = v => (typeof v === 'number' ? v : null);
const fmt = v => 'S$' + Math.round(v).toLocaleString('en-SG');
const fmtK = v => (v >= 1e6 ? 'S$' + (v / 1e6).toFixed(2).replace(/0$/, '') + 'M' : 'S$' + Math.round(v / 1000) + 'k');
const code = v => (v === '-' ? 'none' : '<20 txns');
const h1 = (t, i) => {
  const a = num(Q1[t][i]), b = num(Q2[t][i]);
  if (a && b) return (a + b) / 2;
  return a || b || null;
};
const median = arr => {
  const s = [...arr].sort((x, y) => x - y), m = s.length >> 1;
  if (!s.length) return null;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const pctChange = r => (r.a && r.b ? ((r.b - r.a) / r.a) * 100 : null);
const signed = p => `${p >= 0 ? '+' : ''}${p.toFixed(1)}%`;

function niceTicks(lo, hi, n) {
  const span = hi - lo, step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => span / s <= n) || 10 * mag;
  const a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step;
  const out = [];
  for (let v = a; v <= b + 1e-6; v += step) out.push(v);
  return out;
}

function useWidth(ref, fallback) {
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

const SORT_LABELS = { q2: 'Q2 price', chg: 'change', az: 'A–Z' };
const NEXT_SORT = { q2: 'chg', chg: 'az', az: 'q2' };
const SEQ = ['#e8f0fb', '#b9d1f3', '#7fa9e6', '#3f7fd4', '#1f56a8', '#123a78'];

function readStoredType() {
  try {
    const s = localStorage.getItem('hdbType');
    if (s !== null && FLAT_TYPES[+s]) return +s;
  } catch { /* storage unavailable */ }
  return 3;
}

function Tooltip({ tip }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!tip || !el) return;
    const w = el.offsetWidth, h = el.offsetHeight;
    let x = tip.x + 14, y = tip.y + 14;
    if (x + w > window.innerWidth - 8) x = tip.x - w - 14;
    if (y + h > window.innerHeight - 8) y = tip.y - h - 14;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  }, [tip]);
  if (!tip) return null;
  return <div ref={ref} className="hdb-tip">{tip.content}</div>;
}

function TipLines({ town, typeIdx, extra }) {
  return (
    <>
      <b>{town}</b> · {FLAT_TYPES[typeIdx]}<br />
      Q1: {num(Q1[town][typeIdx]) ? fmt(Q1[town][typeIdx]) : code(Q1[town][typeIdx])}<br />
      Q2: {num(Q2[town][typeIdx]) ? fmt(Q2[town][typeIdx]) : code(Q2[town][typeIdx])}
      {extra && <><br />{extra}</>}
    </>
  );
}

function Stats({ typeIdx, budget }) {
  const rows = TOWNS.map(t => ({ t, a: num(Q1[t][typeIdx]), b: num(Q2[t][typeIdx]) }));
  const both = rows.filter(r => r.a && r.b);
  const q2s = rows.filter(r => r.b);
  const withData = TOWNS.filter(t => h1(t, typeIdx)).length;
  if (!withData) {
    return (
      <div className="hdb-stats">
        <div className="hdb-stat"><small>{FLAT_TYPES[typeIdx]}</small><b className="hdb-stat-sm">No published medians in H1 2026</b></div>
      </div>
    );
  }
  const up = both.filter(r => r.b > r.a).length;
  const down = both.filter(r => r.b < r.a).length;
  const under = TOWNS.filter(t => { const v = h1(t, typeIdx); return v && v <= budget; }).length;
  const top = [...q2s].sort((x, y) => y.b - x.b)[0];
  return (
    <div className="hdb-stats">
      <div className="hdb-stat"><small>{FLAT_TYPES[typeIdx]} · median of town medians, Q2</small><b>{q2s.length ? fmt(median(q2s.map(r => r.b))) : '–'}</b></div>
      <div className="hdb-stat"><small>Towns up / down, Q1 → Q2</small><b>{up} ▲&nbsp;&nbsp;{down} ▼</b></div>
      <div className="hdb-stat"><small>Priciest town, Q2</small><b className="hdb-stat-md">{top ? `${top.t} · ${fmtK(top.b)}` : '–'}</b></div>
      <div className="hdb-stat"><small>Towns at or under {fmtK(budget)} (H1 avg)</small><b>{under} of {withData}</b></div>
    </div>
  );
}

function Dumbbell({ typeIdx, sortMode, budget, setTip }) {
  const hostRef = useRef(null);
  const width = useWidth(hostRef, 800);
  const [hover, setHover] = useState(null);

  const rows = TOWNS.map(t => ({ t, a: num(Q1[t][typeIdx]), b: num(Q2[t][typeIdx]) })).filter(r => r.a || r.b);
  const key = r => r.b || r.a;
  if (sortMode === 'q2') rows.sort((x, y) => key(y) - key(x));
  else if (sortMode === 'chg') rows.sort((x, y) => (pctChange(y) ?? -900) - (pctChange(x) ?? -900));
  else rows.sort((x, y) => x.t.localeCompare(y.t));

  if (!rows.length) {
    return <div ref={hostRef}><p className="hdb-note">No town has 20+ transactions for this flat type in either quarter.</p></div>;
  }

  const W = Math.max(width, 560), L = 128, R = 132, T = 26, rowH = 26, H = T + rows.length * rowH + 8;
  const vals = rows.flatMap(r => [r.a, r.b]).filter(Boolean).concat([budget]);
  const ticks = niceTicks(Math.min(...vals) * 0.97, Math.max(...vals) * 1.02, 6);
  const lo = ticks[0], hi = ticks[ticks.length - 1];
  const x = v => L + ((v - lo) / (hi - lo)) * (W - L - R);

  return (
    <div className="hdb-chart" ref={hostRef}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Dumbbell chart of Q1 and Q2 2026 median prices by town">
        {ticks.map(v => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={T - 6} y2={H - 6} stroke="#eceFED" />
            <text x={x(v)} y={T - 12} textAnchor="middle" className="mono">{fmtK(v)}</text>
          </g>
        ))}
        {budget >= lo && budget <= hi && (
          <line x1={x(budget)} x2={x(budget)} y1={T - 6} y2={H - 6} stroke="#141a18" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.7} />
        )}
        {rows.map((r, i) => {
          const cy = T + i * rowH + rowH / 2;
          const pct = pctChange(r);
          const rad = hover === r.t ? 7 : 5.5;
          const content = (
            <TipLines town={r.t} typeIdx={typeIdx}
              extra={pct !== null && `Change: ${signed(pct)} (${r.b - r.a >= 0 ? '+' : '−'}${fmt(Math.abs(r.b - r.a))})`} />
          );
          return (
            <g key={r.t}
              onPointerEnter={e => { setHover(r.t); setTip({ x: e.clientX, y: e.clientY, content }); }}
              onPointerMove={e => setTip({ x: e.clientX, y: e.clientY, content })}
              onPointerLeave={() => { setHover(null); setTip(null); }}>
              <rect x={0} y={cy - rowH / 2} width={W} height={rowH} fill="transparent" />
              <text x={L - 12} y={cy + 4} textAnchor="end">{r.t}</text>
              {r.a && r.b && <line x1={x(r.a)} x2={x(r.b)} y1={cy} y2={cy} stroke="#7d8883" strokeWidth={2} opacity={0.55} />}
              {r.a && <circle cx={x(r.a)} cy={cy} r={rad} fill="var(--hdb-q1)" stroke="#fff" strokeWidth={2} />}
              {r.b && <circle cx={x(r.b)} cy={cy} r={rad} fill="var(--hdb-q2)" stroke="#fff" strokeWidth={2} />}
              <text x={W - R + 10} y={cy + 4} className="mono">
                {(r.b ? fmtK(r.b) : '—') + (pct !== null ? `  ${signed(pct)}` : '')}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Heatmap({ typeIdx, setTip }) {
  const hostRef = useRef(null);
  const width = useWidth(hostRef, 800);
  const [hover, setHover] = useState(null);

  const { cols, mn, mx } = useMemo(() => {
    const cols = FLAT_TYPES.map((_, i) => i).filter(i => TOWNS.some(t => h1(t, i)));
    const all = TOWNS.flatMap(t => cols.map(i => h1(t, i))).filter(Boolean);
    return { cols, mn: Math.min(...all), mx: Math.max(...all) };
  }, []);
  const bin = v => Math.min(5, Math.floor(((v - mn) / (mx - mn + 1)) * 6));

  const L = 128, ch = 24, T = 28;
  const cw = Math.max(78, Math.min(120, (Math.max(width, 520) - L) / cols.length));
  const W = L + cols.length * cw, H = T + TOWNS.length * ch + 40;
  const ly = T + TOWNS.length * ch + 16;

  return (
    <div className="hdb-chart" ref={hostRef}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Heatmap of H1 2026 average median price by town and flat type">
        {cols.map((i, c) => (
          <g key={i}>
            <text x={L + c * cw + cw / 2} y={T - 10} textAnchor="middle" fontWeight={600}>{FLAT_TYPES[i]}</text>
            {i === typeIdx && (
              <rect x={L + c * cw + 1} y={T - 2} width={cw - 2} height={TOWNS.length * ch + 2} fill="none" stroke="var(--hdb-q2)" strokeWidth={2} rx={4} />
            )}
          </g>
        ))}
        {TOWNS.map((t, r) => {
          const y = T + r * ch;
          return (
            <g key={t}>
              <text x={L - 12} y={y + ch / 2 + 4} textAnchor="end">{t}</text>
              {cols.map((i, c) => {
                const v = h1(t, i);
                const id = `${t}|${i}`;
                const content = <TipLines town={t} typeIdx={i} extra={v && `H1 avg: ${fmt(v)}`} />;
                return (
                  <g key={i}
                    onPointerEnter={e => { setHover(id); setTip({ x: e.clientX, y: e.clientY, content }); }}
                    onPointerMove={e => setTip({ x: e.clientX, y: e.clientY, content })}
                    onPointerLeave={() => { setHover(null); setTip(null); }}>
                    <rect x={L + c * cw + 2} y={y + 1} width={cw - 4} height={ch - 2} rx={3}
                      fill={v ? SEQ[bin(v)] : '#eef1ef'}
                      stroke={hover === id ? '#141a18' : undefined} strokeWidth={1.5} />
                    <text x={L + c * cw + cw / 2} y={y + ch / 2 + 4} textAnchor="middle" className="mono" fontSize={11.5}
                      style={{ fill: v ? (bin(v) >= 3 ? '#ffffff' : '#141a18') : '#7d8883' }}>
                      {v ? fmtK(v) : (Q1[t][i] === '-' && Q2[t][i] === '-' ? '–' : '*')}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
        {SEQ.map((c, k) => <rect key={c} x={L + k * 36} y={ly} width={34} height={10} rx={2} fill={c} />)}
        <text x={L} y={ly + 24} className="mono" fontSize={11}>{fmtK(mn)}</text>
        <text x={L + 6 * 36 - 2} y={ly + 24} textAnchor="end" className="mono" fontSize={11}>{fmtK(mx)}</text>
      </svg>
    </div>
  );
}

function DataTable() {
  const cell = v => (num(v) ? fmt(v) : v === '-' ? '–' : '*');
  return (
    <div className="hdb-chart">
      <table className="hdb-table">
        <thead>
          <tr>
            <th>Town</th>
            {FLAT_TYPES.flatMap(t => [<th key={t + 'q1'}>{t} Q1</th>, <th key={t + 'q2'}>{t} Q2</th>])}
          </tr>
        </thead>
        <tbody>
          {TOWNS.map(t => (
            <tr key={t}>
              <td>{t}</td>
              {FLAT_TYPES.map((_, i) => [Q1, Q2].map((Q, q) => (
                <td key={`${i}-${q}`} className={num(Q[t][i]) ? '' : 'na'}>{cell(Q[t][i])}</td>
              )))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function HdbResaleDashboard({ budget = 650000 }) {
  const [typeIdx, setTypeIdx] = useState(readStoredType);
  const [sortMode, setSortMode] = useState('q2');
  const [tip, setTip] = useState(null);

  const selectType = i => {
    setTypeIdx(i);
    try { localStorage.setItem('hdbType', i); } catch { /* storage unavailable */ }
  };

  return (
    <div className="card full-width hdb">
      <h2>HDB Resale Medians by Town · H1 2026</h2>
      <p className="hdb-lede">
        Q1 and Q2 2026 medians side by side for each town, plus a combined H1 view across all flat types.
        The dashed line marks your property price ({fmtK(budget)}). Hover any mark for the figures.
      </p>

      <div className="hdb-controls" role="group" aria-label="Flat type">
        {FLAT_TYPES.map((t, i) => (
          <button key={t} type="button" className="hdb-chip" aria-pressed={i === typeIdx} onClick={() => selectType(i)}>{t}</button>
        ))}
      </div>

      <Stats typeIdx={typeIdx} budget={budget} />

      <section className="hdb-panel">
        <div className="hdb-panel-head">
          <h3>{FLAT_TYPES[typeIdx]}: Q1 → Q2 median by town</h3>
          <div className="hdb-legend">
            <span><i className="hdb-sw" style={{ background: 'var(--hdb-q1)' }} />Q1 2026</span>
            <span><i className="hdb-sw" style={{ background: 'var(--hdb-q2)' }} />Q2 2026</span>
            <span><i className="hdb-dash" />{fmtK(budget)} budget</span>
            <button type="button" className="hdb-sortbtn" onClick={() => setSortMode(NEXT_SORT[sortMode])}>
              Sort: {SORT_LABELS[sortMode]}
            </button>
          </div>
        </div>
        <Dumbbell typeIdx={typeIdx} sortMode={sortMode} budget={budget} setTip={setTip} />
        <p className="hdb-note">Towns with fewer than 20 transactions (or none) in both quarters for this flat type are omitted. A single dot means only one quarter had a published median.</p>
      </section>

      <section className="hdb-panel">
        <div className="hdb-panel-head">
          <h3>H1 2026 combined median, town × flat type</h3>
          <span className="hdb-note">Average of the Q1 and Q2 medians (or the one quarter available)</span>
        </div>
        <Heatmap typeIdx={typeIdx} setTip={setTip} />
      </section>

      <section className="hdb-panel">
        <details>
          <summary>Data table</summary>
          <DataTable />
        </details>
      </section>

      <p className="hdb-note">
        Source: HDB, “Median Resale Prices by Town and Flat Type, for Resale Cases Registered from 2nd Quarter 2007 to 2nd Quarter 2026”.
        “–” no transactions; “*” fewer than 20 transactions (not published). Prices include COV and are rounded to the nearest $100.
        The H1 figure is a simple mean of two quarterly medians, not the true half-year median.
      </p>

      <Tooltip tip={tip} />
    </div>
  );
}
