import React, { useEffect, useState } from 'react'
import NamePrompt from './components/NamePrompt'
import Quiz from './components/Quiz'
import Leaderboard from './components/Leaderboard'
import BrandHeader from './components/BrandHeader'
import LanguageSelect from './components/LanguageSelect'
import PhotoCloud from './components/PhotoCloud' // bakgrund + inline-collage
import type { Lang } from './types'
import { t } from './i18n'

export default function App() {
  const [route, setRoute] = useState<'lang'|'name'|'quiz'|'result'|'leaderboard'>('lang')
  const [player, setPlayer] = useState(localStorage.getItem('player_name') || '')
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'sv')
  const [lastScore, setLastScore] = useState<number | null>(null)

  useEffect(() => {
    if (!localStorage.getItem('lang')) setRoute('lang')
    else if (!player) setRoute('name')
    else setRoute('quiz')
  }, [])

  const tt = t(lang)

  function chooseLang(l: Lang) {
    setLang(l)
    localStorage.setItem('lang', l)
    setRoute('name')
  }

  function backToStart() {
    localStorage.removeItem('lang')
    localStorage.removeItem('player_name')
    setPlayer('')
    setLang('sv')
    setLastScore(null)
    setRoute('lang')
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* FLAGGSIDAN med collage som bakgrund (fixerad till viewporten, ingen scroll) */}
      {route === 'lang' ? (
        <div
          style={{
            position: 'relative',
            height: '100vh',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            paddingTop: '4.2rem'
          }}
        >
          {/* Bakgrunds-collage */}
          <PhotoCloud variant="background" />

          {/* Innehåll ovanpå bakgrunden */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
            <BrandHeader
              title={'LARA ROZALIA\nQUIZ'}
              subtitle=""
              welcome={undefined}
              padY={28}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
            <LanguageSelect onSelect={chooseLang} />
          </div>
        </div>
      ) : (
        <>
          {/* Övriga sidor */}
          <div style={{ marginTop: '2.2rem' }}>
            <BrandHeader title={tt.headerTitle} subtitle={tt.headerSubtitle} welcome={tt.welcome} />
          </div>

          {/* Knapparna – nedflyttade och med mellanrum ovan/under */}
          <div
            className="chips"
            style={{
              display: 'flex',
              gap: '.6rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: '1.25rem',    // ⬅ nedflyttad från headern
              marginBottom: '1rem'     // ⬅ tydligt mellanrum till frågorna
            }}
          >
            <button
              className="btn"
              onClick={() => setRoute('leaderboard')}
              style={{
                fontSize: '1.15rem',
                padding: '0.9rem 1.4rem',
                borderRadius: '999px',
                lineHeight: 1.1
              }}
            >
              {tt.leaderboard}
            </button>

            <button
              className="btn"
              onClick={backToStart}
              style={{
                fontSize: '1.05rem',
                padding: '0.85rem 1.25rem',
                borderRadius: '999px',
                lineHeight: 1.1,
                opacity: 0.95
              }}
            >
              {tt.startOver}
            </button>
          </div>

          {/* Innehåll nära knapparna (ingen extra padding-top så mellanrummet styrs av knapparnas margin-bottom) */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', width: '100%' }}>
            {route === 'name' && (
              <div style={{ width: '100%', maxWidth: 640 }}>
                <NamePrompt lang={lang} onDone={(n)=>{ setPlayer(n); setRoute('quiz') }} />
              </div>
            )}

            {route === 'quiz' && player && (
              <div style={{ width: '100%', maxWidth: 960 }}>
                <Quiz lang={lang} player={player} onDone={(s)=>{ setLastScore(s); setRoute('result') }} />
              </div>
            )}

            {route === 'result' && (
              <div style={{ width: '100%', maxWidth: 960 }}>
                {/* Resultatkortet */}
                <div className="card">
                  <h2>{tt.resultTitle}</h2>
                  <p>{tt.yourScore(player, Number(lastScore ?? 0))}</p>
                  <div className="row" style={{justifyContent:'flex-end'}}>
                    <button className="btn" onClick={()=>setRoute('leaderboard')}>{tt.leaderboard}</button>
                    <button className="btn primary" onClick={()=>setRoute('quiz')}>{tt.startQuiz}</button>
                  </div>
                </div>

                {/* Collage under resultatkortet */}
                <PhotoCloud variant="inline" />
              </div>
            )}

            {route === 'leaderboard' && (
              <div style={{ width: '100%', maxWidth: 900 }}>
                <Leaderboard lang={lang} onBackToStart={backToStart} />
              </div>
            )}
          </div>

          <footer className="note">{tt.goodLuck}</footer>
        </>
      )}
    </main>
  )
}
