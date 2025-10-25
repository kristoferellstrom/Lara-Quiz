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

  // Språkberoende etiketter med emojis enligt önskemål
  const bestFriendLabel =
    lang === 'pl'
      ? '❤️ 🏆 Najlepszy przyjaciel Lary ❤️ 🏆'
      : '❤️ 🏆 Laras bästa vän ❤️ 🏆'

  const leastFriendLabel =
    lang === 'pl'
      ? '❤️ lary... znajomy... ;) ❤️'
      : '❤️ laras... vän...;) ❤️'

  // Beräkna högsta och lägsta poäng
  const maxScore = items.length ? Math.max(...items.map(i => i.score)) : null
  const minScore = items.length ? Math.min(...items.map(i => i.score)) : null

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>{tt.leaderboard}</h2>

      {items.length === 0 ? (
        <div>–</div>
      ) : (
        <ol style={{ fontSize: '1.15rem' }}>
          {items.map((it, idx) => {
            const isMax = maxScore !== null && it.score === maxScore
            const isMin = minScore !== null && it.score === minScore

            return (
              <li
                key={`${it.name}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.5rem',
                  marginBottom: '.35rem'
                }}
              >
                {/* Vänster: namn — poäng (enradig med ellipsis) */}
                <span
                  title={`${it.name} — ${it.score}`}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  <strong>{it.name}</strong> — {it.score}
                </span>

                {/* Höger: etiketter (hålls på en rad längst till höger) */}
                <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                  {isMax && <span>{bestFriendLabel}</span>}
                  {isMax && isMin && ' '}
                  {isMin && <span>{leastFriendLabel}</span>}
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
