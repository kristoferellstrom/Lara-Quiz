export type Lang = 'sv' | 'pl'
export type OptionKey = '1' | 'X' | '2'

export type Question = {
  id: number
  text: string
  options: Record<OptionKey, string>
  media?: { type: 'image' | 'video', src: string, alt?: string } | null
}

export type Answer = { id: number, selected: OptionKey }

export type LeaderboardItem = { name: string; score: number; created_at: string }

export type ChallengeItem = { id: number; label: string }
