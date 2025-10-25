// frontend/src/components/Leaderboard.tsx
import React, { useEffect, useState } from 'react'
import { fetchLeaderboard } from '../api'
import type { LeaderboardItem, Lang } from '../types'
import { t } from '../i18n'

export default function Leaderboard({
  lang,
  onBackToStart
}: {
  lang: Lang
  onBackToStart: () => void
}) {
  const [items, setItems] = useState<LeaderboardItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const tt = t(lang)

  useEffect(() => {
    fetchLeaderboard()
      .then(r => setItems(r.leaderboard))
      .catch(e => setError(e.message))
  }, [])

  if (error) return <div className="card">{tt.error}: {error}</div>

  // Rubriktext enligt önskemål (utan "Topplista")
  const headerText =
    lang === 'pl'
      ? '❤️ Najlepszy przyjaciel Lary ❤️'
      : '❤️ Laras bästa vän ❤️'

  // Mindre rubrik på polska så att den får plats på en rad oftare
  const headerStyle: React.CSSProperties =
    lang === 'pl'
      ? { marginTop: 0, fontSize: '1rem', lineHeight: 1.1 }
      : { marginTop: 0 }

  // Beräkna högsta och lägsta poäng
  const maxScore = items.length ? Math.max(...items.map(i => i.score)) : null
  const minScore = items.length ? Math.min(...items.map(i => i.score)) : null

  return (
    <div className="card">
      <h2 style={headerStyle}>{headerText}</h2>

      {items.length === 0 ? (
        <div>–</div>
      ) : (
        <ol style={{ fontSize: '1.15rem' }}>
          {items.map((it, idx) => {
            const isMax = maxScore !== null && it.score === maxScore
            const isMin = minScore !== null && it.score === minScore

            // Emojis runt NAMNET (samma ordning på båda sidor om båda gäller)
            let prefix = ''
            let suffix = ''
            if (isMax && isMin) {
              prefix = '❤️ 🏆 '
              suffix = ' ❤️ 🏆'
            } else if (isMax) {
              prefix = '🏆 '
              suffix = ' 🏆'
            } else if (isMin) {
              prefix = '❤️ '
              suffix = ' ❤️'
            }

            return (
              <li key={`${it.name}-${idx}`} style={{ marginBottom: '.35rem' }}>
                <span>
                  {prefix}<strong>{it.name}</strong>{suffix} — {it.score}
                </span>
              </li>
            )
          })}
        </ol>
      )}

      <div className="row" style={{ justifyContent: 'flex-start', marginTop: '1rem' }} />
    </div>
  )
}
