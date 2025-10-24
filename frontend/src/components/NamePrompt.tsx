import React, { useState } from 'react'
import { t } from '../i18n'
import type { Lang } from '../types'

export default function NamePrompt({ lang, onDone }: { lang: Lang, onDone: (name: string) => void }) {
  const [name, setName] = useState(localStorage.getItem('player_name') || '')
  const tt = t(lang)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    localStorage.setItem('player_name', name.trim())
    onDone(name.trim())
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2 style={{ marginTop: 0 }}>{tt.enterNameTitle}</h2>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder={tt.enterNamePlaceholder}
        style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 12, border: '1px solid #f1d5e2', margin: '0.6rem 0 1rem' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn primary" type="submit">{tt.startQuiz}</button>
      </div>
    </form>
  )
}
