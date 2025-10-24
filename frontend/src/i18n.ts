import type { Lang } from './types'

type Dict = {
  // Header
  headerTitle: string
  headerSubtitle: string
  welcome: string // ⬅ NYTT: välkomstfras

  // Global / knappar
  leaderboard: string
  startOver: string
  goodLuck: string

  // Start / språk / namn
  chooseLanguage: string
  swedish: string
  polish: string
  enterNameTitle: string
  enterNamePlaceholder: string
  startQuiz: string

  // Quiz
  questionLabel: (i: number, total: number) => string
  next: string
  loading: string
  error: string
  noQuestions: string

  // Extra
  extra: string
  extraInstruction: string
  sendAnswers: string

  // Resultat
  resultTitle: string
  yourScore: (name: string, score: number) => string

  // QR (ifall du återaktiverar den)
  qrCode: string
  scanToPlay: string
}

export const i18n: Record<Lang, Dict> = {
  sv: {
    headerTitle: 'Quiz om Lara Rozalia',
    headerSubtitle: 'ettårsdagen & dopet',
    welcome: 'Varmt välkomna',

    leaderboard: 'Topplista',
    startOver: 'Börja om',
    goodLuck: 'Lycka till!',

    chooseLanguage: 'Välj språk',
    swedish: 'Svenska',
    polish: 'Polska',
    enterNameTitle: 'Vad heter du?',
    enterNamePlaceholder: 'Skriv ditt namn',
    startQuiz: 'Starta quizet',

    questionLabel: (i, total) => `Fråga ${i} / ${total}`,
    next: 'Nästa',
    loading: 'Laddar...',
    error: 'Fel',
    noQuestions: 'Inga frågor hittades.',

    extra: 'Extra',
    extraInstruction: 'Kryssa allt som hör ihop med Lara',
    sendAnswers: 'Skicka svar',

    resultTitle: 'Klart!',
    yourScore: (name, score) => `${name}, din poäng: ${score}`,

    qrCode: 'QR-kod',
    scanToPlay: 'Skanna för att spela:',
  },
  pl: {
    headerTitle: 'Quiz o Larze Rozalii',
    headerSubtitle: 'pierwsze urodziny i chrzest',
    welcome: 'Serdecznie witamy',

    leaderboard: 'Ranking',
    startOver: 'Zacznij od nowa',
    goodLuck: 'Powodzenia!',

    chooseLanguage: 'Wybierz język',
    swedish: 'Szwedzki',
    polish: 'Polski',
    enterNameTitle: 'Jak masz na imię?',
    enterNamePlaceholder: 'Wpisz swoje imię',
    startQuiz: 'Rozpocznij quiz',

    questionLabel: (i, total) => `Pytanie ${i} / ${total}`,
    next: 'Dalej',
    loading: 'Ładowanie...',
    error: 'Błąd',
    noQuestions: 'Nie znaleziono pytań.',

    extra: 'Dodatkowe',
    extraInstruction: 'Zaznacz wszystko, co pasuje do Lary',
    sendAnswers: 'Wyślij odpowiedzi',

    resultTitle: 'Gotowe!',
    yourScore: (name, score) => `${name}, twój wynik: ${score}`,

    qrCode: 'Kod QR',
    scanToPlay: 'Zeskanuj, aby zagrać:',
  }
}

export function t(lang: Lang) {
  return i18n[lang]
}
