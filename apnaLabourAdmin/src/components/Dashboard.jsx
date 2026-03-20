import React, { useEffect, useState, useMemo } from 'react';
import { dashboardAPI } from '../services/dashboardAPI';
import { remoteConfigBackendAPI } from '../services/remoteConfigBackendAPI';

// ─── Format helpers ───────────────────────────────────────────────────────────
const fmtINR = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const shortINR = (v) =>
  v >= 10000000 ? `₹${(v / 10000000).toFixed(1)}Cr`
    : v >= 100000 ? `₹${(v / 100000).toFixed(1)}L`
      : v >= 1000 ? `₹${(v / 1000).toFixed(1)}K`
        : `₹${Math.round(v)}`;

const shortNum = (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${Math.round(v)}`;
const fmtNum = (n) => new Intl.NumberFormat('en-IN').format(n);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'current', label: 'This Month' },
  { key: '3months', label: '3 Months' },
  { key: '6months', label: '6 Months' }
];

// ─── Completed-only filter ────────────────────────────────────────────────────
const completed = (bookings) => bookings.filter(b => (b.status || '').toLowerCase() === 'completed');

// ─── Period-key helpers ───────────────────────────────────────────────────────
function getPeriodKeys(period) {
  const now = new Date();
  if (period === 'today') {
    const yr = now.getFullYear(), mo = now.getMonth(), dt = now.getDate();
    const pNow = new Date(now); pNow.setDate(dt - 1);
    const pYr = pNow.getFullYear(), pMo = pNow.getMonth(), pDt = pNow.getDate();
    return { type: 'hourly', yr, mo, dt, pYr, pMo, pDt };
  }
  if (period === 'week') {
    const cDates = [], pDates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      cDates.push({ y: d.getFullYear(), m: d.getMonth(), d: d.getDate() });
      const pd = new Date(now); pd.setDate(now.getDate() - i - 7);
      pDates.push({ y: pd.getFullYear(), m: pd.getMonth(), d: pd.getDate() });
    }
    return { type: 'daily_sliding', cDates, pDates };
  }
  if (period === 'current') {
    const yr = now.getFullYear(), mo = now.getMonth();
    const pMo = mo === 0 ? 11 : mo - 1, pYr = mo === 0 ? yr - 1 : yr;
    const days = new Date(yr, mo + 1, 0).getDate();
    const prevDays = new Date(pYr, pMo + 1, 0).getDate();
    return { type: 'daily', yr, mo, pYr, pMo, days, prevDays };
  }
  const mc = period === '3months' ? 3 : 6;
  const cKeys = [], pKeys = [];
  for (let i = mc - 1; i >= 0; i--) {
    const d1 = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const d2 = new Date(now.getFullYear(), now.getMonth() - i - mc, 1);
    cKeys.push(`${d1.getFullYear()}-${String(d1.getMonth() + 1).padStart(2, '0')}`);
    pKeys.push(`${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}`);
  }
  return { type: 'monthly', mc, cKeys, pKeys };
}

// ─── Data builders ─────────────────────────────────────────────────────────────
function buildSeries(bookings, period, valueFn) {
  const ok = completed(bookings);
  const pk = getPeriodKeys(period);
  const labels = [], current = [], prev = [];

  if (pk.type === 'hourly') {
    const { yr, mo, dt, pYr, pMo, pDt } = pk;
    const curBuckets = new Array(24).fill(null).map(() => []);
    const prevBuckets = new Array(24).fill(null).map(() => []);

    ok.forEach(b => {
      const d = new Date(b.createdAt), y = d.getFullYear(), m = d.getMonth(), day = d.getDate(), h = d.getHours();
      if (y === yr && m === mo && day === dt) curBuckets[h].push(b);
      if (y === pYr && m === pMo && day === pDt) prevBuckets[h].push(b);
    });

    for (let i = 0; i < 24; i++) {
      labels.push(`${i}:00`);
      current.push(valueFn(curBuckets[i]));
      prev.push(valueFn(prevBuckets[i]));
    }
  } else if (pk.type === 'daily_sliding') {
    const { cDates, pDates } = pk;
    const curBuckets = new Array(7).fill(null).map(() => []);
    const prevBuckets = new Array(7).fill(null).map(() => []);

    ok.forEach(b => {
      const d = new Date(b.createdAt), y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
      const cIdx = cDates.findIndex(cd => cd.y === y && cd.m === m && cd.d === day);
      if (cIdx !== -1) curBuckets[cIdx].push(b);
      const pIdx = pDates.findIndex(pd => pd.y === y && pd.m === m && pd.d === day);
      if (pIdx !== -1) prevBuckets[pIdx].push(b);
    });

    for (let i = 0; i < 7; i++) {
      const dObj = new Date(cDates[i].y, cDates[i].m, cDates[i].d);
      labels.push(dObj.toLocaleDateString('en-US', { weekday: 'short' }));
      current.push(valueFn(curBuckets[i]));
      prev.push(valueFn(prevBuckets[i]));
    }
  } else if (pk.type === 'daily') {
    const { yr, mo, pYr, pMo, days, prevDays } = pk;
    const curBuckets = new Array(days).fill(null).map(() => []);
    const prevBuckets = new Array(prevDays).fill(null).map(() => []);

    ok.forEach(b => {
      const d = new Date(b.createdAt), y = d.getFullYear(), m = d.getMonth(), day = d.getDate() - 1;
      if (y === yr && m === mo) curBuckets[day].push(b);
      if (y === pYr && m === pMo) prevBuckets[Math.min(day, prevDays - 1)].push(b);
    });

    for (let i = 0; i < days; i++) {
      labels.push(`${i + 1}`);
      current.push(valueFn(curBuckets[i]));
      prev.push(valueFn(prevBuckets[Math.min(i, prevDays - 1)]));
    }
  } else {
    const { cKeys, pKeys } = pk;
    const cMap = Object.fromEntries(cKeys.map(k => [k, []]));
    const pMap = Object.fromEntries(pKeys.map(k => [k, []]));

    ok.forEach(b => {
      const d = new Date(b.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in cMap) cMap[key].push(b);
      if (key in pMap) pMap[key].push(b);
    });

    cKeys.forEach((key, i) => {
      labels.push(MONTH_NAMES[parseInt(key.split('-')[1], 10) - 1]);
      current.push(valueFn(cMap[key]));
      prev.push(valueFn(pMap[pKeys[i]]));
    });
  }
  return { labels, current, prev };
}

const revenueVal = (bkgs) => bkgs.reduce((s, b) => s + (b.totalAmount || 0), 0);
const ordersVal = (bkgs) => bkgs.length;
const aovVal = (bkgs) => bkgs.length === 0 ? 0 : Math.round(revenueVal(bkgs) / bkgs.length);

// ─── User series builder (keyed on createdAt or updatedAt) ──────────────────
function buildUserSeries(users, period, dateField) {
  const pk = getPeriodKeys(period);
  const labels = [], current = [], prev = [];

  if (pk.type === 'hourly') {
    const { yr, mo, dt, pYr, pMo, pDt } = pk;
    const cur = new Array(24).fill(0);
    const prv = new Array(24).fill(0);
    users.forEach(u => {
      const d = new Date(u[dateField]);
      if (isNaN(d)) return;
      const y = d.getFullYear(), m = d.getMonth(), day = d.getDate(), h = d.getHours();
      if (y === yr && m === mo && day === dt) cur[h] += 1;
      if (y === pYr && m === pMo && day === pDt) prv[h] += 1;
    });
    for (let i = 0; i < 24; i++) {
      labels.push(`${i}:00`);
      current.push(cur[i]);
      prev.push(prv[i]);
    }
  } else if (pk.type === 'daily_sliding') {
    const { cDates, pDates } = pk;
    const cur = new Array(cDates.length).fill(0);
    const prv = new Array(pDates.length).fill(0);
    users.forEach(u => {
      const d = new Date(u[dateField]);
      if (isNaN(d)) return;
      const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
      const cIdx = cDates.findIndex(cd => cd.y === y && cd.m === m && cd.d === day);
      if (cIdx !== -1) cur[cIdx] += 1;
      const pIdx = pDates.findIndex(pd => pd.y === y && pd.m === m && pd.d === day);
      if (pIdx !== -1) prv[pIdx] += 1;
    });
    for (let i = 0; i < cDates.length; i++) {
      const dObj = new Date(cDates[i].y, cDates[i].m, cDates[i].d);
      labels.push(dObj.toLocaleDateString('en-US', { weekday: 'short' }));
      current.push(cur[i]);
      prev.push(prv[i]);
    }
  } else if (pk.type === 'daily') {
    const { yr, mo, pYr, pMo, days, prevDays } = pk;
    const cur = new Array(days).fill(0);
    const prv = new Array(prevDays).fill(0);
    users.forEach(u => {
      const d = new Date(u[dateField]);
      if (isNaN(d)) return;
      const y = d.getFullYear(), m = d.getMonth(), day = d.getDate() - 1;
      if (y === yr && m === mo) cur[day] += 1;
      if (y === pYr && m === pMo) prv[Math.min(day, prevDays - 1)] += 1;
    });
    for (let i = 0; i < days; i++) {
      labels.push(`${i + 1}`);
      current.push(cur[i]);
      prev.push(prv[Math.min(i, prevDays - 1)]);
    }
  } else {
    const { cKeys, pKeys } = pk;
    const cMap = Object.fromEntries(cKeys.map(k => [k, 0]));
    const pMap = Object.fromEntries(pKeys.map(k => [k, 0]));
    users.forEach(u => {
      const d = new Date(u[dateField]);
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in cMap) cMap[key] += 1;
      if (key in pMap) pMap[key] += 1;
    });
    cKeys.forEach((key, i) => {
      labels.push(MONTH_NAMES[parseInt(key.split('-')[1], 10) - 1]);
      current.push(cMap[key]); prev.push(pMap[pKeys[i]]);
    });
  }
  return { labels, current, prev };
}

// ─── SVG helpers ──────────────────────────────────────────────────────────────
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
}

// ─── Theme palette ────────────────────────────────────────────────────────────
const THEMES = {
  indigo: { barTop: '#a5b4fc', barBot: '#6366f1', glow: '#6366f1', hl: '#eef2ff', lbl: '#6366f1', active: '#6366f1', line: '#6366f1', area: '#6366f1', dot: '#6366f1', dotStroke: '#6366f1', badge: 'from-indigo-500 to-blue-600' },
  teal: { barTop: '#5eead4', barBot: '#0d9488', glow: '#14b8a6', hl: '#f0fdfa', lbl: '#0d9488', active: '#0d9488', line: '#0d9488', area: '#14b8a6', dot: '#0d9488', dotStroke: '#0d9488', badge: 'from-teal-400 to-cyan-600' },
  amber: { barTop: '#fcd34d', barBot: '#f59e0b', glow: '#f59e0b', hl: '#fffbeb', lbl: '#b45309', active: '#b45309', line: '#f59e0b', area: '#f59e0b', dot: '#f59e0b', dotStroke: '#b45309', badge: 'from-amber-400 to-orange-500' },
  violet: { barTop: '#c4b5fd', barBot: '#7c3aed', glow: '#7c3aed', hl: '#f5f3ff', lbl: '#6d28d9', active: '#6d28d9', line: '#7c3aed', area: '#7c3aed', dot: '#7c3aed', dotStroke: '#6d28d9', badge: 'from-violet-500 to-purple-700' },
  emerald: { barTop: '#6ee7b7', barBot: '#059669', glow: '#10b981', hl: '#ecfdf5', lbl: '#047857', active: '#047857', line: '#059669', area: '#10b981', dot: '#059669', dotStroke: '#047857', badge: 'from-emerald-400 to-teal-600' },
};


// ─── BarChart SVG ─────────────────────────────────────────────────────────────
const BarChart = ({ labels, current, prev, tooltip, setTooltip, themeKey, formatVal, compact }) => {
  const W = 800, H = compact ? 180 : 240;
  const PAD = { top: compact ? 20 : 28, right: 16, bottom: compact ? 34 : 44, left: compact ? 52 : 64 };
  const cW = W - PAD.left - PAD.right, cH = H - PAD.top - PAD.bottom;
  const n = labels.length, gap = cW / n;
  const bW = Math.max(3, Math.min(compact ? 14 : 18, gap * 0.28));
  const maxVal = Math.max(...current, ...prev, 1);
  const th = THEMES[themeKey];
  const uid = `bc_${themeKey}`;

  const yTicks = compact ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: n > 16 ? `${n * 28}px` : undefined, height: 'auto' }}>
      <defs>
        <linearGradient id={`${uid}_cur`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={th.barTop} /><stop offset="100%" stopColor={th.barBot} />
        </linearGradient>
        <linearGradient id={`${uid}_prv`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" /><stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <filter id={`${uid}_drp`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={th.glow} floodOpacity="0.35" />
        </filter>
      </defs>
      {yTicks.map((f, i) => {
        const y = PAD.top + cH * (1 - f);
        return (
          <g key={i}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
              stroke={i === 0 ? '#e2e8f0' : '#f1f5f9'} strokeWidth={i === 0 ? 1.5 : 1}
              strokeDasharray={i > 0 ? '4 4' : undefined} />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={compact ? 9 : 10} fill="#94a3b8" fontFamily="system-ui">
              {formatVal(Math.round(maxVal * f))}
            </text>
          </g>
        );
      })}
      {labels.map((lbl, i) => {
        const gx = PAD.left + i * gap + gap / 2;
        const cH2 = Math.max(3, (current[i] / maxVal) * cH);
        const pH2 = Math.max(3, (prev[i] / maxVal) * cH);
        const cX = gx - bW - 1.5, pX = gx + 1.5;
        const active = tooltip?.index === i;
        return (
          <g key={i}>
            <rect x={PAD.left + i * gap} y={PAD.top} width={gap} height={cH} fill="transparent"
              onMouseEnter={() => setTooltip({ index: i, label: lbl, cur: current[i], prv: prev[i] })} />
            {active && <rect x={PAD.left + i * gap + 1} y={PAD.top} width={gap - 2} height={cH} fill={th.hl} rx="5" />}
            <rect x={pX} y={PAD.top + cH - pH2} width={bW} height={pH2} rx="3" fill={active ? '#94a3b8' : `url(#${uid}_prv)`} style={{ transition: 'fill 0.15s' }} />
            <rect x={cX} y={PAD.top + cH - cH2} width={bW} height={cH2} rx="3" fill={`url(#${uid}_cur)`}
              filter={active ? `url(#${uid}_drp)` : undefined} style={{ transition: 'filter 0.15s' }} />
            {!compact && current[i] > 0 && cH2 > 18 && (
              <text x={cX + bW / 2} y={PAD.top + cH - cH2 - 4} textAnchor="middle" fontSize="7.5" fill={th.lbl} fontWeight="700" fontFamily="system-ui">
                {formatVal(current[i])}
              </text>
            )}
            <text x={gx} y={H - PAD.bottom + (compact ? 13 : 16)} textAnchor="middle"
              fontSize={n > 20 ? '7' : compact ? '9' : '10'} fill={active ? th.active : '#94a3b8'}
              fontWeight={active ? '700' : '400'} fontFamily="system-ui">{lbl}</text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── LineAreaChart SVG ────────────────────────────────────────────────────────
const LineAreaChart = ({ labels, current, prev, tooltip, setTooltip, themeKey, formatVal, compact }) => {
  const W = 800, H = compact ? 180 : 240;
  const PAD = { top: compact ? 28 : 36, right: 20, bottom: compact ? 34 : 44, left: compact ? 52 : 64 };
  const cW = W - PAD.left - PAD.right, cH = H - PAD.top - PAD.bottom;
  const n = labels.length;
  const maxVal = Math.max(...current, ...prev, 1);
  const th = THEMES[themeKey];
  const uid = `la_${themeKey}`;

  const xOf = (i) => n <= 1 ? PAD.left + cW / 2 : PAD.left + (i / (n - 1)) * cW;
  const yOf = (v) => PAD.top + cH - Math.max(0, Math.min(1, v / maxVal)) * cH;

  const curPts = current.map((v, i) => [xOf(i), yOf(v)]);
  const prvPts = prev.map((v, i) => [xOf(i), yOf(v)]);
  const cLine = smoothPath(curPts);
  const pLine = smoothPath(prvPts);
  const cArea = n > 1 ? `${cLine} L${xOf(n - 1)},${PAD.top + cH} L${xOf(0)},${PAD.top + cH} Z` : '';
  const pArea = n > 1 ? `${pLine} L${xOf(n - 1)},${PAD.top + cH} L${xOf(0)},${PAD.top + cH} Z` : '';

  const yTicks = compact ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 'auto' }}>
      <defs>
        <linearGradient id={`${uid}_ca`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={th.area} stopOpacity="0.25" /><stop offset="100%" stopColor={th.area} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}_pa`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.12" /><stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
        </linearGradient>
        <filter id={`${uid}_glow`}>
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={th.dot} floodOpacity="0.6" />
        </filter>
      </defs>
      {yTicks.map((f, i) => {
        const y = PAD.top + cH * (1 - f);
        return (
          <g key={i}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
              stroke={i === 0 ? '#e2e8f0' : '#f1f5f9'} strokeWidth={i === 0 ? 1.5 : 1}
              strokeDasharray={i > 0 ? '4 4' : undefined} />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={compact ? 9 : 10} fill="#94a3b8" fontFamily="system-ui">
              {formatVal(Math.round(maxVal * f))}
            </text>
          </g>
        );
      })}
      {labels.map((lbl, i) => {
        const x = xOf(i), active = tooltip?.index === i;
        return (
          <g key={i}>
            {active && <line x1={x} x2={x} y1={PAD.top} y2={PAD.top + cH} stroke={th.line} strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.4" />}
            <text x={x} y={H - PAD.bottom + (compact ? 13 : 17)} textAnchor="middle"
              fontSize={compact ? '9' : '11'} fill={active ? th.active : '#94a3b8'}
              fontWeight={active ? '700' : '400'} fontFamily="system-ui">{lbl}</text>
          </g>
        );
      })}
      {pArea && <path d={pArea} fill={`url(#${uid}_pa)`} />}
      {pLine && <path d={pLine} fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />}
      {cArea && <path d={cArea} fill={`url(#${uid}_ca)`} />}
      {cLine && <path d={cLine} fill="none" stroke={th.line} strokeWidth={compact ? 2 : 2.5} strokeLinejoin="round" strokeLinecap="round" />}
      {labels.map((_, i) => {
        const x = xOf(i);
        const hw = n <= 1 ? cW : i === 0 ? (xOf(1) - xOf(0)) / 2 : (x - xOf(i - 1)) / 2;
        const zx = x - hw;
        const zw = n <= 1 ? cW : i === n - 1 ? hw : hw + (n > 1 ? (xOf(Math.min(i + 1, n - 1)) - x) / 2 : 0);
        return <rect key={i} x={zx} y={PAD.top} width={Math.max(0, zw)} height={cH} fill="transparent"
          onMouseEnter={() => setTooltip({ index: i, label: labels[i], cur: current[i], prv: prev[i] })} />;
      })}
      {current.map((v, i) => {
        const x = xOf(i), y = yOf(v), a = tooltip?.index === i;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={a ? (compact ? 6 : 7) : (compact ? 3.5 : 4.5)} fill="white" stroke={th.dotStroke} strokeWidth={compact ? 2 : 2.5}
              filter={a ? `url(#${uid}_glow)` : undefined} style={{ transition: 'r 0.15s' }} />
            {a && !compact && <text x={x} y={y - 13} textAnchor="middle" fontSize="9.5" fill={th.dot} fontWeight="700" fontFamily="system-ui">{formatVal(v)}</text>}
          </g>
        );
      })}
      {prev.map((v, i) => {
        const x = xOf(i), y = yOf(v), a = tooltip?.index === i;
        return <circle key={i} cx={x} cy={y} r={a ? 4.5 : 3} fill="white" stroke="#94a3b8" strokeWidth="1.5" style={{ transition: 'r 0.15s' }} />;
      })}
    </svg>
  );
};

// ─── MiniChart card ───────────────────────────────────────────────────────────
const MiniChartCard = ({ title, icon, themeKey, labels, current, prev, period, tooltip, setTooltip, totalCur, totalPrv, formatVal, formatTip, prevLabel }) => {
  const th = THEMES[themeKey];
  const pct = totalPrv === 0 ? null : ((totalCur - totalPrv) / totalPrv) * 100;
  const up = pct === null || pct >= 0;

  const renderTooltip = () => {
    if (!tooltip) return null;
    const diff = tooltip.cur - tooltip.prv;
    const tp = tooltip.prv === 0 ? null : ((diff / tooltip.prv) * 100).toFixed(1);
    const tUp = diff >= 0;
    return (
      <div className="absolute top-2 right-2 bg-gray-950 text-white text-[11px] rounded-xl p-2.5 shadow-2xl pointer-events-none z-10 w-40 border border-white/10">
        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2">
          {period === 'current' ? `Day ${tooltip.label}` : period === 'today' ? `Time: ${tooltip.label}` : tooltip.label}
        </p>
        <div className="flex justify-between items-center mb-1">
          <span className="flex items-center gap-1.5 text-gray-300">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: th.dotStroke }}></span>Now
          </span>
          <span className="font-bold text-white">{formatTip(tooltip.cur)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2 h-2 rounded-full bg-gray-500 inline-block"></span>Prev
          </span>
          <span className="text-gray-300">{formatTip(tooltip.prv)}</span>
        </div>
        {tp !== null && (
          <div className={`text-center text-[10px] font-bold py-1 rounded-lg ${tUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {tUp ? '▲' : '▼'} {Math.abs(tp)}%
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${th.badge} flex items-center justify-center shadow`}>
            <i className={`${icon} text-white text-xs`}></i>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-700 leading-tight">{title}</p>
            <p className="text-[10px] text-gray-400">{prevLabel} comparison</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-extrabold leading-tight" style={{ color: th.active }}>{formatVal(totalCur)}</p>
          {pct !== null && (
            <span className={`text-[10px] font-bold ${up ? 'text-emerald-600' : 'text-red-500'}`}>
              {up ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      {/* Divider */}
      <div className="border-t border-gray-50 mx-5"></div>
      {/* Chart */}
      <div className="relative overflow-x-auto px-3 pb-3 pt-2 flex-1" onMouseLeave={() => setTooltip(null)}>
        {['current', 'today', 'week'].includes(period)
          ? <BarChart labels={labels} current={current} prev={prev} tooltip={tooltip} setTooltip={setTooltip} themeKey={themeKey} formatVal={formatVal} compact />
          : <LineAreaChart labels={labels} current={current} prev={prev} tooltip={tooltip} setTooltip={setTooltip} themeKey={themeKey} formatVal={formatVal} compact />
        }
        {renderTooltip()}
      </div>
    </div>
  );
};

// ─── Full-width Revenue chart ─────────────────────────────────────────────────
const RevenueChart = ({ labels, current, prev, period, tooltip, setTooltip }) => {
  const th = THEMES.indigo;
  const totalCur = current.reduce((s, v) => s + v, 0);
  const totalPrv = prev.reduce((s, v) => s + v, 0);
  const pct = totalPrv === 0 ? null : ((totalCur - totalPrv) / totalPrv) * 100;
  const up = pct === null || pct >= 0;
  const prevLabel = period === 'today' ? 'Yesterday' : period === 'week' ? 'Last Week' : period === 'current' ? 'Last Month' : period === '3months' ? 'Prev 3 Mo' : 'Prev 6 Mo';

  const renderTooltip = () => {
    if (!tooltip) return null;
    const diff = tooltip.cur - tooltip.prv;
    const tp = tooltip.prv === 0 ? null : ((diff / tooltip.prv) * 100).toFixed(1);
    const tUp = diff >= 0;
    return (
      <div className="absolute top-3 right-3 bg-gray-950 text-white text-xs rounded-2xl p-3.5 shadow-2xl pointer-events-none z-10 w-44 border border-white/10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">
          {period === 'current' ? `Day ${tooltip.label}` : period === 'today' ? `Time: ${tooltip.label}` : tooltip.label}
        </p>
        <div className="space-y-1.5 mb-2.5">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-gray-300">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block ring-2 ring-indigo-400/30"></span>Current
            </span>
            <span className="font-bold">{shortINR(tooltip.cur)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-500 inline-block ring-2 ring-gray-500/20"></span>Previous
            </span>
            <span className="text-gray-300">{shortINR(tooltip.prv)}</span>
          </div>
        </div>
        {tp !== null && (
          <div className={`flex items-center justify-center gap-1 text-[10px] font-bold py-1.5 rounded-xl ${tUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            <i className={`fas fa-arrow-${tUp ? 'up' : 'down'} text-[8px]`}></i> {Math.abs(tp)}% vs previous
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${th.badge} flex items-center justify-center shadow-md`}>
            <i className="fas fa-chart-area text-white text-sm"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Revenue</h3>
            <p className="text-[11px] text-gray-400">Completed bookings · {
              period === 'today' ? 'vs yesterday' :
                period === 'week' ? 'vs last week' :
                  period === 'current' ? 'vs last month' :
                    `vs prev ${period === '3months' ? '3' : '6'} months`
            }</p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full inline-block" style={{ backgroundColor: th.line }}></span>Current</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-gray-300 inline-block"></span>{prevLabel}</span>
          </div>
        </div>
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-y border-gray-50 bg-gray-50/50 mb-1">
        <div className="px-5 py-3">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{
            period === 'today' ? 'Today' :
              period === 'week' ? 'This Week' :
                period === 'current' ? 'This Month' : 'Current'
          }</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: th.dot }}></span>
            <span className="font-extrabold text-gray-900 text-base">{shortINR(totalCur)}</span>
          </div>
        </div>
        <div className="px-5 py-3">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{prevLabel}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block flex-shrink-0"></span>
            <span className="font-extrabold text-gray-900 text-base">{shortINR(totalPrv)}</span>
          </div>
        </div>
        <div className="px-5 py-3 flex items-center">
          {pct !== null ? (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold ${up ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              <i className={`fas fa-arrow-${up ? 'up' : 'down'} text-[9px]`}></i>
              {Math.abs(pct).toFixed(1)}%
            </div>
          ) : <span className="text-xs text-gray-400">—</span>}
        </div>
      </div>

      {/* Chart */}
      <div className="relative overflow-x-auto px-3 pb-3 pt-1" onMouseLeave={() => setTooltip(null)}>
        {['current', 'today', 'week'].includes(period)
          ? <BarChart labels={labels} current={current} prev={prev} tooltip={tooltip} setTooltip={setTooltip} themeKey="indigo" formatVal={shortINR} />
          : <LineAreaChart labels={labels} current={current} prev={prev} tooltip={tooltip} setTooltip={setTooltip} themeKey="indigo" formatVal={shortINR} />
        }
        {renderTooltip()}
      </div>
    </div>
  );
};

// ─── Stat cards ───────────────────────────────────────────────────────────────
const CARD_THEMES = {
  blue: { grad: 'from-blue-500 to-indigo-600', light: 'from-blue-50 to-indigo-50', icon: 'text-blue-600', iconBg: 'bg-blue-100', border: 'border-blue-100', ring: 'hover:ring-blue-200', value: 'text-blue-700' },
  orange: { grad: 'from-orange-400 to-rose-500', light: 'from-orange-50 to-rose-50', icon: 'text-orange-600', iconBg: 'bg-orange-100', border: 'border-orange-100', ring: 'hover:ring-orange-200', value: 'text-orange-700' },
  purple: { grad: 'from-violet-500 to-purple-600', light: 'from-violet-50 to-purple-50', icon: 'text-violet-600', iconBg: 'bg-violet-100', border: 'border-violet-100', ring: 'hover:ring-violet-200', value: 'text-violet-700' },
  emerald: { grad: 'from-emerald-400 to-teal-600', light: 'from-emerald-50 to-teal-50', icon: 'text-emerald-600', iconBg: 'bg-emerald-100', border: 'border-emerald-100', ring: 'hover:ring-emerald-200', value: 'text-emerald-700' },
};

const StatCard = ({ title, value, icon, color = 'blue', loading = false, isCurrency = false }) => {
  const t = CARD_THEMES[color];
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${t.border} bg-gradient-to-br ${t.light} shadow-sm hover:shadow-lg hover:ring-2 ${t.ring} ring-transparent transition-all duration-300 group p-5`}>
      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${t.grad} opacity-10 group-hover:opacity-20 transition-opacity`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
          {loading ? <div className="h-7 w-24 bg-gray-200 animate-pulse rounded-lg mt-1" />
            : <p className={`text-xl sm:text-2xl font-extrabold ${t.value} leading-tight`}>{isCurrency ? fmtINR(value) : fmtNum(value)}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${t.iconBg} flex items-center justify-center flex-shrink-0`}>
          <i className={`${icon} text-base ${t.icon}`}></i>
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, activeLabours: 0, totalUsers: 0 });
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAppDisabled, setIsAppDisabled] = useState(false);
  const [togglingAppDisabled, setTogglingAppDisabled] = useState(false);
  // Shared period toggle for ALL charts
  const [period, setPeriod] = useState('current');
  const [revTip, setRevTip] = useState(null);
  const [ordTip, setOrdTip] = useState(null);
  const [aovTip, setAovTip] = useState(null);
  const [newTip, setNewTip] = useState(null);
  const [actTip, setActTip] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true); setChartLoading(true); setError(null);
      const [data, all, allUsers, remoteConfig] = await Promise.all([
        dashboardAPI.getDashboardStats(),
        dashboardAPI.getAllBookings(),
        dashboardAPI.getAllCustomers(),
        remoteConfigBackendAPI.getRemoteConfig().catch(e => {
          console.error("Failed to fetch remote config", e);
          return null;
        }),
      ]);
      setStats(data); setBookings(all); setUsers(allUsers);

      if (remoteConfig && remoteConfig.data && remoteConfig.data.parameters) {
        const disabledParam = remoteConfig.data.parameters['is_app_disabled'];
        if (disabledParam && disabledParam.defaultValue && disabledParam.defaultValue.value) {
          setIsAppDisabled(disabledParam.defaultValue.value === 'true');
        } else {
          setIsAppDisabled(false);
        }
      }
    } catch { setError('Failed to load dashboard data'); }
    finally { setLoading(false); setChartLoading(false); }
  };

  const toggleAppDisabled = async () => {
    const newVal = !isAppDisabled;
    setIsAppDisabled(newVal);
    setTogglingAppDisabled(true);
    try {
      const payload = {
        "is_app_disabled": {
          "defaultValue": {
            "value": String(newVal)
          },
          "description": "Disable app due to high demand",
          "valueType": "BOOLEAN"
        }
      };
      const result = await remoteConfigBackendAPI.updateRemoteConfig(payload);
      if (!result || !result.success) {
        setIsAppDisabled(!newVal);
        alert("Failed to update app disabled status.");
      }
    } catch (err) {
      console.error("Error toggling app disabled:", err);
      setIsAppDisabled(!newVal);
      alert("Error updating app disabled status.");
    } finally {
      setTogglingAppDisabled(false);
    }
  };

  useEffect(() => { fetchData(); const t = setInterval(fetchData, 30000); return () => clearInterval(t); }, []);

  const revData = useMemo(() => buildSeries(bookings, period, revenueVal), [bookings, period]);
  const ordData = useMemo(() => buildSeries(bookings, period, ordersVal), [bookings, period]);
  const aovData = useMemo(() => buildSeries(bookings, period, aovVal), [bookings, period]);
  const newUserData = useMemo(() => buildUserSeries(users, period, 'createdAt'), [users, period]);
  const actUserData = useMemo(() => buildUserSeries(users, period, 'updatedAt'), [users, period]);

  const prevLabel = period === 'today' ? 'Yesterday' : period === 'week' ? 'Last Week' : period === 'current' ? 'Last Month' : period === '3months' ? 'Prev 3 Mo' : 'Prev 6 Mo';
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const resetTips = () => { setRevTip(null); setOrdTip(null); setAovTip(null); setNewTip(null); setActTip(null); };

  return (
    <div className="px-3 sm:px-6 lg:px-8 py-5 sm:py-7 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Analytics</h1>
          <p className="text-xs text-gray-400 mt-0.5">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 mr-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-xs font-semibold text-gray-700">High Demand (App Disabled)</span>
            <button
              onClick={toggleAppDisabled}
              disabled={togglingAppDisabled}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isAppDisabled ? 'bg-red-500' : 'bg-gray-200'} ${togglingAppDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAppDisabled ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
          {/* ── Shared period toggle ── */}
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-0.5 shadow-sm">
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => { setPeriod(p.key); resetTips(); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${period === p.key ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={fetchData} disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 shadow-sm text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50">
            <i className={`fas fa-sync-alt text-xs ${loading ? 'fa-spin' : ''}`}></i>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard title="Total Revenue" value={stats.revenue} icon="fas fa-indian-rupee-sign" color="blue" loading={loading} isCurrency />
        <StatCard title="Total Orders" value={stats.totalOrders} icon="fas fa-receipt" color="orange" loading={loading} />
        <StatCard title="Active Labours" value={stats.activeLabours} icon="fas fa-hard-hat" color="purple" loading={loading} />
        <StatCard title="Total Users" value={stats.totalUsers} icon="fas fa-user-group" color="emerald" loading={loading} />
      </div>

      {/* ── Revenue chart (full width) ── */}
      <div className="mb-4">
        <RevenueChart
          labels={revData.labels} current={revData.current} prev={revData.prev}
          period={period} tooltip={revTip} setTooltip={setRevTip}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Orders ── */}
        <div className="mb-0">
          <MiniChartCard
            title="Orders" icon="fas fa-receipt" themeKey="teal"
            labels={ordData.labels} current={ordData.current} prev={ordData.prev}
            period={period} tooltip={ordTip} setTooltip={setOrdTip}
            totalCur={ordData.current.reduce((s, v) => s + v, 0)}
            totalPrv={ordData.prev.reduce((s, v) => s + v, 0)}
            formatVal={(v) => String(v)} formatTip={(v) => `${v} orders`}
            prevLabel={prevLabel}
          />
        </div>

        {/* ── AOV ── */}
        <div className="mb-0">
          <MiniChartCard
            title="Avg. Order Value" icon="fas fa-tags" themeKey="amber"
            labels={aovData.labels} current={aovData.current} prev={aovData.prev}
            period={period} tooltip={aovTip} setTooltip={setAovTip}
            totalCur={(() => { const ok = completed(bookings); return ok.length === 0 ? 0 : Math.round(ok.reduce((s, b) => s + (b.totalAmount || 0), 0) / ok.length); })()}
            totalPrv={0}
            formatVal={shortINR} formatTip={shortINR}
            prevLabel={prevLabel}
          />
        </div>

        {/* ── New Users ── */}
        <div className="mb-0">
          <MiniChartCard
            title="New Users" icon="fas fa-user-plus" themeKey="violet"
            labels={newUserData.labels} current={newUserData.current} prev={newUserData.prev}
            period={period} tooltip={newTip} setTooltip={setNewTip}
            totalCur={newUserData.current.reduce((s, v) => s + v, 0)}
            totalPrv={newUserData.prev.reduce((s, v) => s + v, 0)}
            formatVal={(v) => String(v)} formatTip={(v) => `${v} users`}
            prevLabel={prevLabel}
          />
        </div>

        {/* ── Active Users ── */}
        <div className="mb-0">
          <MiniChartCard
            title="Active Users" icon="fas fa-user-check" themeKey="emerald"
            labels={actUserData.labels} current={actUserData.current} prev={actUserData.prev}
            period={period} tooltip={actTip} setTooltip={setActTip}
            totalCur={actUserData.current.reduce((s, v) => s + v, 0)}
            totalPrv={actUserData.prev.reduce((s, v) => s + v, 0)}
            formatVal={(v) => String(v)} formatTip={(v) => `${v} users`}
            prevLabel={prevLabel}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;