# Backend (FastAPI)

Kör lokalt:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```
Standard-URL: http://127.0.0.1:8000

Miljövariabler (`.env`):
- `DATABASE_URL` – lämna tomt för SQLite lokalt, eller peka mot Postgres (t.ex. Supabase). Ex: `postgresql+psycopg://user:pass@host:5432/db`
- `FRONTEND_ORIGIN` – t.ex. `http://localhost:5173`

Frågor redigeras i `questions.json`. Fält:
```json
[
  {
    "id": 1,
    "text": "Din fråga",
    "options": { "1": "Alt 1", "X": "Alt X", "2": "Alt 2" },
    "correct": "X",
    "media": { "type": "image", "src": "/media/bild.jpg", "alt": "Beskrivning" }
  }
]
```
`correct` skickas **inte** till frontend. Poäng räknas på servern vid `/api/submit`.
