import React from 'react'
import type { Lang } from '../types'

export default function LanguageSelect({ onSelect }: { onSelect: (lang: Lang) => void }) {
  // Vertikal layout, inga kort/ramar, transparenta knappar
  const wrap: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', // centreras i ytan som App ger (under headern)
    gap: '1.25rem',
  }

  const btn: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    transform: 'scale(1)',
    transition: 'transform .12s ease'
  }

  const onDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'
  }
  const onUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
  }

  // Storlek på flaggorna
  const W = 260
  const H = 170

  return (
    <div style={wrap}>
      {/* 🇸🇪 Svenska överst */}
      <button aria-label="Svenska" onClick={() => onSelect('sv')} style={btn} onMouseDown={onDown} onMouseUp={onUp}>
        <svg width={W} height={H} viewBox="0 0 26 17" aria-hidden="true">
          <rect width="26" height="17" fill="#006AA7" />
          <rect x="7.2" width="2.9" height="17" fill="#FECC00" />
          <rect y="7.2" width="26" height="2.9" fill="#FECC00" />
        </svg>
      </button>

      {/* 🇵🇱 Polska under */}
      <button aria-label="Polski" onClick={() => onSelect('pl')} style={btn} onMouseDown={onDown} onMouseUp={onUp}>
        <svg width={W} height={H} viewBox="0 0 26 17" aria-hidden="true">
          <rect width="26" height="8.5" y="0" fill="#ffffff" />
          <rect width="26" height="8.5" y="8.5" fill="#D4213D" />
        </svg>
      </button>
    </div>
  )
}
