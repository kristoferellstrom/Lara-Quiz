# PersonQuiz – färdigt skal (Python + React)

## Snabbstart
1) Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```
Backend körs på `http://127.0.0.1:8000`

2) Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend körs på `http://localhost:5173`

## Redigera frågor
Ändra `backend/questions.json`. Koden exponerar **inte** rätt svar till klienten.

## Topplista
Poäng sparas i SQLite-lokalfil som standard (`backend/data.db`). Sätt `DATABASE_URL` i `backend/.env` för att använda gratis moln-Postgres (t.ex. Supabase).

## QR-kod
Fliken “QR-kod” visar en QR för aktuell URL. När du publicerar på GitHub Pages/Netlify anger du bara den publika URL:en.

## GitHub
Lägg hela mappen i ett repo. Du kan deploya backend till t.ex. Railway/Render gratis och frontend till GitHub Pages/Netlify/Vercel.
