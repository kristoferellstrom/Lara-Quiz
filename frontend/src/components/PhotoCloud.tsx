import React, { useEffect, useMemo, useState } from 'react'

type Variant = 'inline' | 'background'
type Item = { src: string; size: 's' | 'm' | 'l' }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function PhotoCloud({
  variant = 'inline',
  maxItems
}: {
  variant?: Variant
  maxItems?: number
}) {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/img/decor-manifest.json', { cache: 'no-store' })
        if (!res.ok) return
        const files: unknown = await res.json()
        if (!Array.isArray(files)) return

        const cleaned = (files as string[])
          .filter(Boolean)
          .map(s => (s.startsWith('/img/') ? s : `/img/${s}`))

        // Välj antal bilder beroende på variant
        const take = Math.min(
          cleaned.length,
          maxItems ?? (variant === 'background' ? 80 : 28)
        )
        const picks = shuffle(cleaned).slice(0, take)

        // Fördela storlekar (fler små för background)
        const withSize: Item[] = picks.map((src) => {
          const r = Math.random()
          const size: Item['size'] =
            variant === 'background'
              ? (r < 0.06 ? 'l' : r < 0.30 ? 'm' : 's') // bakgrund: mest små
              : (r < 0.12 ? 'l' : r < 0.38 ? 'm' : 's') // inline: lite större mix
          return { src, size }
        })

        if (!cancelled) setItems(withSize)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [variant, maxItems])

  // Gemensamma stilar
  const TINT = 'rgba(236,109,156,0.24)' // rosa overlay
  const FILTER =
    'saturate(108%) hue-rotate(-10deg) contrast(98%) sepia(10%)'
  const RADIUS = 6

  // Grid-inställningar beroende på variant
  const gridStyles: React.CSSProperties =
    variant === 'background'
      ? {
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.22,                                                 // diskret i bakgrunden
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',   // tätare, små rutor
          gridAutoRows: 72,
          gap: 6,
          padding: '1.2rem',
        }
      : {
          width: '100%',
          maxWidth: 1000,
          margin: '1.25rem auto 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(54px, 1fr))',
          gridAutoRows: 54,
          gap: 6,
        }

  return (
    <div style={gridStyles} aria-label={variant === 'background' ? 'fotocollage-bakgrund' : 'fotocollage'}>
      {items.map((it, idx) => {
        const span =
          it.size === 'l' ? 3 : it.size === 'm' ? 2 : 1

        // Liten “organisk” känsla, men lugnare i bakgrunden
        const rotate = (variant === 'background'
          ? (Math.random() * 2 - 1)    // -1..+1°
          : (Math.random() * 6 - 3)    // -3..+3°
        ).toFixed(2)
        const jitterX = (variant === 'background'
          ? (Math.random() * 2 - 1)    // -1..+1px
          : (Math.random() * 4 - 2)    // -2..+2px
        ).toFixed(1)
        const jitterY = (variant === 'background'
          ? (Math.random() * 2 - 1)
          : (Math.random() * 4 - 2)
        ).toFixed(1)

        return (
          <div
            key={`${it.src}-${idx}`}
            style={{
              gridColumn: `span ${span}`,
              gridRow: `span ${span}`,
              position: 'relative',
              borderRadius: RADIUS,
              overflow: 'hidden',
              transform: `translate(${jitterX}px, ${jitterY}px) rotate(${rotate}deg)`,
              boxShadow: variant === 'background'
                ? '0 2px 6px rgba(0,0,0,.04)'
                : '0 6px 16px rgba(0,0,0,.05)',
            }}
          >
            <img
              src={it.src}
              alt=""
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                filter: FILTER,
                opacity: 0.9,
              }}
            />
            {/* rosa tint ovanpå bara bilden */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background: TINT,
                mixBlendMode: 'multiply',
                pointerEvents: 'none',
                borderRadius: RADIUS,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
