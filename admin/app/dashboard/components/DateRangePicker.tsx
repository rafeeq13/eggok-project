'use client';
import React, { useState, useRef, useEffect } from 'react';

type Preset = {
  label: string;
  getValue: () => { from: string; to: string };
};

type Props = {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
};

const fmt = (d: Date) => d.toISOString().split('T')[0];

const today = () => new Date();

const presets: Preset[] = [
  { label: 'Today', getValue: () => { const d = fmt(today()); return { from: d, to: d }; } },
  { label: 'This week', getValue: () => { const d = today(); const day = d.getDay(); const start = new Date(d); start.setDate(d.getDate() - day); return { from: fmt(start), to: fmt(d) }; } },
  { label: 'Last week', getValue: () => { const d = today(); const day = d.getDay(); const start = new Date(d); start.setDate(d.getDate() - day - 7); const end = new Date(start); end.setDate(start.getDate() + 6); return { from: fmt(start), to: fmt(end) }; } },
  { label: 'This month', getValue: () => { const d = today(); return { from: fmt(new Date(d.getFullYear(), d.getMonth(), 1)), to: fmt(d) }; } },
  { label: 'Last month', getValue: () => { const d = today(); const start = new Date(d.getFullYear(), d.getMonth() - 1, 1); const end = new Date(d.getFullYear(), d.getMonth(), 0); return { from: fmt(start), to: fmt(end) }; } },
  { label: 'Last 7 days', getValue: () => { const d = today(); const start = new Date(d); start.setDate(d.getDate() - 6); return { from: fmt(start), to: fmt(d) }; } },
  { label: 'Last 30 days', getValue: () => { const d = today(); const start = new Date(d); start.setDate(d.getDate() - 29); return { from: fmt(start), to: fmt(d) }; } },
  { label: 'Last 12 weeks', getValue: () => { const d = today(); const start = new Date(d); start.setDate(d.getDate() - 83); return { from: fmt(start), to: fmt(d) }; } },
  { label: 'Last 12 months', getValue: () => { const d = today(); const start = new Date(d); start.setFullYear(d.getFullYear() - 1); return { from: fmt(start), to: fmt(d) }; } },
  { label: 'Custom', getValue: () => ({ from: '', to: '' }) },
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function DateRangePicker({ from, to, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState('This month');
  const [showCustom, setShowCustom] = useState(false);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [selectingFrom, setSelectingFrom] = useState(true);
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);
  const today2 = today();
  const [leftMonth, setLeftMonth] = useState(today2.getMonth());
  const [leftYear, setLeftYear] = useState(today2.getFullYear());
  const ref = useRef<HTMLDivElement>(null);

  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1;
  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handlePreset = (preset: Preset) => {
    setActivePreset(preset.label);
    if (preset.label === 'Custom') {
      setShowCustom(true);
      setCustomFrom('');
      setCustomTo('');
      setSelectingFrom(true);
    } else {
      setShowCustom(false);
      const { from: f, to: t } = preset.getValue();
      onChange(f, t);
      setOpen(false);
    }
  };

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDay = (month: number, year: number) => new Date(year, month, 1).getDay();

  const handleDayClick = (dateStr: string) => {
    if (selectingFrom) {
      setCustomFrom(dateStr);
      setCustomTo('');
      setSelectingFrom(false);
    } else {
      if (dateStr < customFrom) {
        setCustomTo(customFrom);
        setCustomFrom(dateStr);
      } else {
        setCustomTo(dateStr);
      }
      setSelectingFrom(true);
    }
  };

  const isInRange = (dateStr: string) => {
    const f = customFrom;
    const t = customTo || hoverDate || '';
    if (!f) return false;
    const lo = f < t ? f : t;
    const hi = f < t ? t : f;
    return dateStr > lo && dateStr < hi;
  };

  const isStart = (dateStr: string) => dateStr === customFrom;
  const isEnd = (dateStr: string) => dateStr === (customTo || (hoverDate && !selectingFrom ? hoverDate : ''));

  const renderCalendar = (month: number, year: number) => {
    const days = getDaysInMonth(month, year);
    const firstDay = getFirstDay(month, year);
    const cells: React.ReactNode[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} />);
    }

    for (let d = 1; d <= days; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const start = isStart(dateStr);
      const end = isEnd(dateStr);
      const inRange = isInRange(dateStr);

      cells.push(
        <div
          key={dateStr}
          onClick={() => handleDayClick(dateStr)}
          onMouseEnter={() => setHoverDate(dateStr)}
          onMouseLeave={() => setHoverDate(null)}
          style={{
            width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: start || end ? '50%' : '0',
            background: start || end ? '#E5B800' : inRange ? '#E5B80030' : 'transparent',
            color: start || end ? '#000' : '#FEFEFE',
            fontSize: '13px', fontWeight: start || end ? '700' : '400',
            cursor: 'pointer',
          }}
        >
          {d}
        </div>
      );
    }

    return cells;
  };

  const formatDisplay = () => {
    if (!from && !to) return 'Select date range';
    const fmtDate = (s: string) => {
      if (!s) return '';
      const d = new Date(s + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    if (from === to) return fmtDate(from);
    return `${fmtDate(from)} ${fmtDate(to)}`;
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '9px 14px',
          background: '#111111', border: '1px solid #2A2A2A',
          borderRadius: '8px', color: '#FEFEFE', fontSize: '13px',
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FEFEFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span>{activePreset === 'Custom' ? formatDisplay() : activePreset}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FEFEFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points={open ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0,
          background: '#1A1A1A', border: '1px solid #2A2A2A',
          borderRadius: '12px', zIndex: 999,
          display: 'flex', boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}>
          {/* Presets */}
          <div style={{ width: '160px', borderRight: '1px solid #2A2A2A', padding: '8px' }}>
            {presets.map(preset => (
              <button
                key={preset.label}
                onClick={() => handlePreset(preset)}
                style={{
                  width: '100%', padding: '9px 12px',
                  background: activePreset === preset.label ? '#E5B800' : 'transparent',
                  color: activePreset === preset.label ? '#000' : '#FEFEFE',
                  border: 'none', borderRadius: '8px',
                  fontSize: '13px', fontWeight: activePreset === preset.label ? '700' : '400',
                  cursor: 'pointer', textAlign: 'left',
                  marginBottom: '2px',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Calendar */}
          {showCustom && (
            <div style={{ padding: '16px' }}>
              {/* Instructions */}
              <p style={{ fontSize: '12px', color: '#FEFEFE', marginBottom: '12px' }}>
                {selectingFrom ? 'Select start date' : 'Select end date'}
              </p>

              <div style={{ display: 'flex', gap: '24px' }}>
                {/* Left Calendar */}
                {[{ month: leftMonth, year: leftYear }, { month: rightMonth, year: rightYear }].map((cal, ci) => (
                  <div key={ci}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      {ci === 0 && (
                        <button onClick={() => { if (leftMonth === 0) { setLeftMonth(11); setLeftYear(y => y - 1); } else setLeftMonth(m => m - 1); }}
                          style={{ background: 'transparent', border: 'none', color: '#FEFEFE', cursor: 'pointer', fontSize: '16px' }}>‹</button>
                      )}
                      {ci === 1 && <div style={{ width: '24px' }} />}
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE' }}>
                        {MONTHS[cal.month]} {cal.year}
                      </p>
                      {ci === 1 && (
                        <button onClick={() => { if (leftMonth === 11) { setLeftMonth(0); setLeftYear(y => y + 1); } else setLeftMonth(m => m + 1); }}
                          style={{ background: 'transparent', border: 'none', color: '#FEFEFE', cursor: 'pointer', fontSize: '16px' }}>›</button>
                      )}
                      {ci === 0 && <div style={{ width: '24px' }} />}
                    </div>

                    {/* Day headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 32px)', gap: '2px', marginBottom: '4px' }}>
                      {DAYS.map(d => (
                        <div key={d} style={{ width: '32px', textAlign: 'center', fontSize: '11px', color: '#FEFEFE', fontWeight: '600' }}>{d}</div>
                      ))}
                    </div>

                    {/* Days */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 32px)', gap: '2px' }}>
                      {renderCalendar(cal.month, cal.year)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #2A2A2A' }}>
                <p style={{ fontSize: '12px', color: '#FEFEFE' }}>
                  {customFrom && <span style={{ color: '#E5B800' }}>Start: {customFrom}</span>}
                  {customFrom && customTo && <span style={{ color: '#FEFEFE' }}> </span>}
                  {customTo && <span style={{ color: '#E5B800' }}>End: {customTo}</span>}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setOpen(false); setShowCustom(false); setActivePreset('This month'); }}
                    style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#FEFEFE', fontSize: '12px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button
                    onClick={() => { if (customFrom && customTo) { onChange(customFrom, customTo); setOpen(false); } }}
                    disabled={!customFrom || !customTo}
                    style={{ padding: '7px 14px', background: customFrom && customTo ? '#E5B800' : '#2A2A2A', border: 'none', borderRadius: '8px', color: customFrom && customTo ? '#000' : '#FEFEFE', fontSize: '12px', fontWeight: '700', cursor: customFrom && customTo ? 'pointer' : 'not-allowed' }}>
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}