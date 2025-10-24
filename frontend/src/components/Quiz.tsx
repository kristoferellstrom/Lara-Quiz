import React, { useEffect, useMemo, useState } from 'react'
import { fetchQuestions, fetchChallenge, submitAnswers, checkAnswer } from '../api'
import { Answer, OptionKey, Question, ChallengeItem, Lang } from '../types'
import Media from './Media'
import { t } from '../i18n'

type Screen = 'loading' | 'quiz' | 'extra' | 'done' | 'error'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = a[i]; a[i] = a[j]; a[j] = t
  }
  return a
}

function uniqueById<T extends { id: number }>(arr: T[]): T[] {
  const seen = new Set<number>()
  return arr.filter(item => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

const REVEAL_MS = 1600

function DecorImage({ path }: { path: string }) {
  const [loaded, setLoaded] = useState(false)

  // Samma rosa-tint som du kör nu
  const TINT_COLOR = 'rgba(236,109,156,0.35)'
  const IMG_OPACITY = 0.88

  return (
    <div
      style={{
        width: '100%',
        height: 300,              // ⬅ var 220 — lite högre = mindre beskärning (känns mer "ut-zoomat")
        position: 'relative',
        marginTop: '1rem',
        borderRadius: 6,
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,.06)',
      }}
    >
      <img
        src={path}
        alt=""
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',       // behåll "cover"-känslan
          objectPosition: 'center', // vill du visa mer av toppen: 'center top'
          display: 'block',
          opacity: loaded ? IMG_OPACITY : 0,
          transition: 'opacity .25s ease',
          filter: 'saturate(100%) hue-rotate(-12deg) contrast(98%)',
        } as React.CSSProperties}
      />
      {/* Rosa toning ovanpå bilden */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: TINT_COLOR,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}



export default function Quiz({ player, onDone, lang }: { player: string, onDone: (score: number) => void, lang: Lang }) {
  const [screen, setScreen] = useState<Screen>('loading')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, OptionKey>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [challenge, setChallenge] = useState<ChallengeItem[]>([])
  const [extraSelected, setExtraSelected] = useState<Set<number>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [reveal, setReveal] = useState<{correct: OptionKey, selected: OptionKey} | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Slumpad lista med dekorbilder (utan upprepning)
  const [decorDeck, setDecorDeck] = useState<string[]>([])

  const tt = t(lang)

  useEffect(() => {
    async function boot() {
      try {
        const [q, ch] = await Promise.all([fetchQuestions(lang), fetchChallenge(lang)])

        const uniqueQs = uniqueById(q.questions)
        setQuestions(shuffle(uniqueQs))
        setChallenge(shuffle(ch.items))

        // Läs manifestet med dina godtyckliga filnamn (ingen namnändring behövs)
        let files: unknown = []
        try {
          const res = await fetch('/img/decor-manifest.json', { cache: 'no-store' })
          if (res.ok) files = await res.json()
        } catch { /* ignore */ }

        if (Array.isArray(files)) {
          // Stötta både ["a.jpg","b.png"] och ["/img/a.jpg", "/img/b.png"]
          const cleaned = files
            .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
            .map(s => s.startsWith('/img/') ? s : `/img/${s}`)
          setDecorDeck(shuffle(cleaned))
        } else {
          setDecorDeck([])
        }

        setScreen('quiz')
      } catch (err: any) {
        setError(err?.message || 'Fel vid laddning')
        setScreen('error')
      }
    }
    boot()
  }, [lang])

  const progress = useMemo(() => {
    const total = questions.length || 0
    const answered = Object.keys(answers).length
    return { total, answered }
  }, [questions, answers])

  function choose(qid: number, opt: OptionKey) {
    setAnswers(a => ({ ...a, [qid]: opt }))
  }

  async function next() {
    const q = questions[currentIndex]
    const selected = answers[q.id]
    if (!selected || reveal) return
    try {
      const res = await checkAnswer(q.id, selected, lang)
      setReveal({ correct: res.correct, selected })
    } catch {
      setReveal(null)
    }
    setTimeout(() => {
      setReveal(null)
      if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1)
      else setScreen('extra')
    }, REVEAL_MS)
  }

  function toggleExtra(id: number) {
    setExtraSelected(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  async function submit() {
    setSubmitting(true)
    try {
      const payload: Answer[] = Object.entries(answers).map(([id, selected]) => ({
        id: Number(id), selected: selected as OptionKey
      }))
      const extra = Array.from(extraSelected)
      const res = await submitAnswers(player, payload, extra, lang)
      onDone(res.score)
      setScreen('done')
    } catch (e: any) {
      setError(e.message || 'Fel vid inskick')
      setScreen('error')
    } finally {
      setSubmitting(false)
    }
  }

  if (screen === 'loading') return <div className="card">{tt.loading}</div>
  if (screen === 'error') return <div className="card">{tt.error}: {error}</div>
  if (!questions.length) return <div className="card">{tt.noQuestions}</div>

  if (screen === 'quiz') {
    const q = questions[currentIndex]
    const selected = answers[q.id]
    const canNext = Boolean(selected) && !reveal

    const decorPath = decorDeck[currentIndex] // ingen upprepning – ett unikt foto per fråga om det finns

    return (
      <div className="card" style={{ paddingTop: '1rem' }}>
        <div className="topbar">
          <strong>{player}</strong>
          <div>{tt.questionLabel(currentIndex + 1, progress.total)}</div>
        </div>

        {/* Mindre luft mellan frågetext och knappar */}
        <div style={{ marginBottom: '.6rem' }}>
          <div style={{ marginBottom: '.35rem' }}>{q.text}</div>
          {/* Media från frågan (om du har satt i JSON) */}
          <Media media={q.media} />
          <div
            className="opt"
            style={{
              pointerEvents: reveal ? 'none' as const : 'auto',
              gap: '.5rem',
              marginTop: '1rem'
            }}
          >
            {(['1','X','2'] as OptionKey[]).map(k => {
              const isSelected = selected === k
              const isCorrect = !!reveal && k === reveal!.correct
              const isSelectedCorrect = !!reveal && isSelected && isCorrect
              const isSelectedWrong = !!reveal && isSelected && !isCorrect
              const base: React.CSSProperties = {
                transition: 'transform .18s ease, background .18s ease, border-color .18s ease, color .18s ease, box-shadow .18s ease',
                position: 'relative'
              }
              const correctStyle: React.CSSProperties = {
                background: '#30b37a', borderColor: '#30b37a', color: '#fff'
              }
              const wrongStyle: React.CSSProperties = {
                background: '#fff0f2', borderColor: '#e05b6b', color: '#e05b6b'
              }
              const selectedWrongExtra: React.CSSProperties = {
                background: '#ffd6db', borderColor: '#e05b6b', color: '#c93c4d',
                borderWidth: 2, outline: '2px solid #e05b6b', transform: 'scale(0.985)'
              }
              const selectedCorrectExtra: React.CSSProperties = {
                transform: 'scale(1.06)',
                boxShadow: '0 10px 28px rgba(48,179,122,.35)',
                borderWidth: 2,
                outline: '3px solid rgba(48,179,122,.6)'
              }
              const style: React.CSSProperties = {
                ...base,
                ...(reveal ? (isCorrect ? correctStyle : wrongStyle) : {}),
                ...(isSelectedWrong ? selectedWrongExtra : {}),
                ...(isSelectedCorrect ? selectedCorrectExtra : {})
              }
              return (
                <button
                  key={k}
                  className={'btn' + (isSelected && !reveal ? ' primary' : '')}
                  onClick={() => !reveal && choose(q.id, k)}
                  aria-label={q.options[k]}
                  disabled={!!reveal}
                  style={style}
                >
                  <span>{q.options[k]}</span>
                  {reveal && isCorrect && <span aria-hidden="true" style={{marginLeft:8, fontWeight:800}}>✓</span>}
                  {isSelectedWrong && <span aria-hidden="true" style={{marginLeft:8, fontWeight:800}}>✕</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Slumpad bild under frågorna (tintad rosa) */}
        {decorPath && <DecorImage path={decorPath} />}

        <div className="row" style={{marginTop:'0.9rem', justifyContent:'flex-end', width:'100%'}}>
          <button className="btn primary" onClick={next} disabled={!canNext}>{tt.next}</button>
        </div>
      </div>
    )
  }

  if (screen === 'extra') {
    return (
      <div className="card">
        <div className="topbar">
          <strong>{player}</strong>
          <div>{tt.extra}</div>
        </div>
        <h2 style={{marginBottom:'.4rem'}}>{tt.extraInstruction}</h2>
        <div className="opt" style={{ gap: '.5rem' }}>
          {challenge.map(it => {
            const checked = extraSelected.has(it.id)
            return (
              <label key={it.id} className={'chip' + (checked ? ' checked' : '')}>
                <input type="checkbox" checked={checked} onChange={() => toggleExtra(it.id)} />
                <span>{it.label}</span>
              </label>
            )
          })}
        </div>
        <div className="row" style={{marginTop:'0.75rem', justifyContent:'flex-end'}}>
          <button className="btn primary" onClick={submit} disabled={submitting}>
            {submitting ? '...' : tt.sendAnswers}
          </button>
        </div>
      </div>
    )
  }

  return null
}
