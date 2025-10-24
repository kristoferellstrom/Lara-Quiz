import type { Lang, OptionKey } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export async function fetchQuestions(lang: Lang) {
  const res = await fetch(`${API_URL}/api/questions?lang=${lang}`)
  if (!res.ok) throw new Error('Kunde inte hämta frågor')
  return res.json() as Promise<{ questions: import('./types').Question[] }>
}

export async function fetchChallenge(lang: Lang) {
  const res = await fetch(`${API_URL}/api/challenge?lang=${lang}`)
  if (!res.ok) throw new Error('Kunde inte hämta extra-uppgiften')
  return res.json() as Promise<{ items: import('./types').ChallengeItem[] }>
}

export async function checkAnswer(id: number, selected: OptionKey, lang: Lang) {
  const res = await fetch(`${API_URL}/api/check?lang=${lang}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, selected })
  })
  if (!res.ok) throw new Error('Kunde inte hämta facit')
  return res.json() as Promise<{ correct: OptionKey; is_correct: boolean }>
}

export async function submitAnswers(
  name: string,
  answers: import('./types').Answer[],
  extra: number[],
  lang: Lang
) {
  const res = await fetch(`${API_URL}/api/submit?lang=${lang}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, answers, extra })
  })
  if (!res.ok) throw new Error('Kunde inte skicka svar')
  return res.json() as Promise<{ score: number; total: number; leaderboard: import('./types').LeaderboardItem[] }>
}

export async function fetchLeaderboard() {
  const res = await fetch(`${API_URL}/api/leaderboard`)
  if (!res.ok) throw new Error('Kunde inte hämta topplista')
  return res.json() as Promise<{ leaderboard: import('./types').LeaderboardItem[] }>
}
