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
    fetchLeaderboard().then(r => setItems(r.leaderboard)).catch(e => setError(e.message))
  }, [])

  if (error) return <div className="card">{tt.error}: {error}</div>

  return (
    <div className="card">
      <h2 style={{marginTop:0}}>{tt.leaderboard}</h2>

      {items.length === 0 ? (
        <div>–</div>
      ) : (
        <ol style={{ fontSize: '1.15rem' }}>
          {items.map((it, idx) => (
            <li key={`${it.name}-${idx}`} style={{marginBottom:'.35rem'}}>
              <strong>{it.name}</strong> — {it.score}
            </li>
          ))}
        </ol>
      )}

      <div className="row" style={{ justifyContent: 'flex-start', marginTop: '1rem' }}>
      </div>
    </div>
  )
}
