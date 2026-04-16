'use client';
import React, { useState, useRef, useEffect } from 'react';

type Props = {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function SingleDatePicker({ value, onChange, placeholder = 'Select date' }: Props) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const [month, setMonth] = useState(value ? new Date(value + 'T00:00:00').getMonth() : today.getMonth());
  const [year, setYear] = useState(value ? new Date(value + 'T00:00:00').getFullYear() : today.getFullYear());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (m: number, y: number) => new Date(y, m, 1).getDay();

  const formatDisplay = () => {
    if (!value) return placeholder;
    const d = new Date(value + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateStr);
    setOpen(false);
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const days = getDaysInMonth(month, year);
  const firstDay = getFirstDay(month, year);
  const selectedDay = value ? parseInt(value.split('-')[2]) : null;
  const selectedMonth = value ? parseInt(value.split('-')[1]) - 1 : null;
  const selectedYear = value ? parseInt(value.split('-')[0]) : null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '9px 14px', background: '#111111',
          border: '1px solid #2A2A2A', borderRadius: '8px',
          color: value ? '#FEFEFE' : '#FEFEFE', fontSize: '13px',
          cursor: 'pointer', whiteSpace: 'nowrap', width: '100%',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FEFEFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {formatDisplay()}
      </button>

      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: 0,
          background: '#1A1A1A', border: '1px solid #2A2A2A',
          borderRadius: '12px', padding: '16px', zIndex: 999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)', minWidth: '280px',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <button onClick={prevMonth} style={{ background: 'transparent', border: 'none', color: '#FEFEFE', cursor: 'pointer', fontSize: '18px', padding: '4px 8px' }}>‹</button>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE' }}>{MONTHS[month]} {year}</p>
            <button onClick={nextMonth} style={{ background: 'transparent', border: 'none', color: '#FEFEFE', cursor: 'pointer', fontSize: '18px', padding: '4px 8px' }}>›</button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '6px' }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: '#FEFEFE', fontWeight: '600', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: days }, (_, i) => {
              const day = i + 1;
              const isSelected = selectedDay === day && selectedMonth === month && selectedYear === year;
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '34px', borderRadius: '8px',
                    background: isSelected ? '#E5B800' : isToday ? '#E5B80020' : 'transparent',
                    color: isSelected ? '#000' : isToday ? '#E5B800' : '#FEFEFE',
                    fontSize: '13px', fontWeight: isSelected ? '700' : '400',
                    cursor: 'pointer', border: isToday && !isSelected ? '1px solid #E5B80040' : '1px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = '#2A2A2A'; }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Clear button */}
          {value && (
            <button
              onClick={() => { onChange(''); setOpen(false); }}
              style={{
                width: '100%', marginTop: '12px', padding: '8px',
                background: 'transparent', border: '1px solid #2A2A2A',
                borderRadius: '8px', color: '#FEFEFE',
                fontSize: '12px', cursor: 'pointer',
              }}
            >
              Clear Date
            </button>
          )}
        </div>
      )}
    </div>
  );
}