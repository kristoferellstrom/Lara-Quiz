import React from 'react'

export default function BrandHeader({
  title,
  subtitle,
  welcome,
  padY, // ⬅ extra vertikal padding (px) för specialfall, t.ex. flaggsidan
}: {
  title: string
  subtitle?: string
  welcome?: string
  padY?: number
}) {
  // Stöder radbrytning via "\n" i title (ex: "LARA ROZALIA\nQUIZ")
  const titleLines = String(title).split('\n')

  return (
    <header style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 1000,
          textAlign: 'center',
          padding: `${padY ?? 16}px 1.25rem`, // var tidigare ~1rem
          borderRadius: 20,
          border: '1px solid #f1d5e2',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.82))',
          boxShadow: '0 12px 34px rgba(236,109,156,.20)',
          backdropFilter: 'saturate(120%) blur(2px)',
        }}
      >
        {welcome ? (
          <div
            style={{
              fontSize: '0.95rem',
              opacity: 0.9,
              marginBottom: '0.25rem',
              fontWeight: 600,
            }}
          >
            {welcome}
          </div>
        ) : null}

        <h1 style={{ margin: 0, lineHeight: 1.12 }}>
          {titleLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </h1>

        {subtitle ? (
          <div style={{ opacity: 0.9, marginTop: '0.15rem' }}>
            {subtitle}
          </div>
        ) : null}
      </div>
    </header>
  )
}
