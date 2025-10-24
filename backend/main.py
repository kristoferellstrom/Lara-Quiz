from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, constr
from typing import List, Literal, Optional
import os, json
from datetime import datetime
from dotenv import load_dotenv
from db import init_db, insert_score, top_scores


load_dotenv()

app = FastAPI(title="PersonQuiz API", version="1.3.0")

# --- CORS: tillåt dev-origins + valfria origin(s) via FRONTEND_ORIGIN ---
# Standard-dev (Vite) på localhost/127.0.0.1 (5173/5174 etc.)
DEFAULT_DEV_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]
# Stöd kommaseparerad lista i env, t.ex.
# FRONTEND_ORIGIN="https://dittdomän.se,https://annat.exempel.com"
ENV_ORIGINS = []
frontend_origin = os.getenv("FRONTEND_ORIGIN")
if frontend_origin:
    ENV_ORIGINS = [o.strip() for o in frontend_origin.split(",") if o.strip()]

ALLOW_ORIGINS = list(dict.fromkeys(DEFAULT_DEV_ORIGINS + ENV_ORIGINS))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    # Dessutom: acceptera alla portar för localhost/127.0.0.1
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- /CORS ---

BASE_DIR = os.path.dirname(__file__)
QUESTIONS_PATH_FALLBACK = os.path.join(BASE_DIR, "questions.json")
CHALLENGE_PATH_FALLBACK = os.path.join(BASE_DIR, "challenge.json")

def load_questions(lang: Optional[str] = None):
    if lang:
        candidates = [
            os.path.join(BASE_DIR, f"questions.{lang}.json"),
            os.path.join(BASE_DIR, f"questions_{lang}.json"),
        ]
        for p in candidates:
            if os.path.exists(p):
                with open(p, "r", encoding="utf-8") as f:
                    return json.load(f)
    with open(QUESTIONS_PATH_FALLBACK, "r", encoding="utf-8") as f:
        return json.load(f)

def load_challenge(lang: Optional[str] = None):
    if lang:
        candidates = [
            os.path.join(BASE_DIR, f"challenge.{lang}.json"),
            os.path.join(BASE_DIR, f"challenge_{lang}.json"),
        ]
        for p in candidates:
            if os.path.exists(p):
                with open(p, "r", encoding="utf-8") as f:
                    return json.load(f)
    if os.path.exists(CHALLENGE_PATH_FALLBACK):
        with open(CHALLENGE_PATH_FALLBACK, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

class AnswerIn(BaseModel):
    id: int
    selected: Literal["1","X","2"]

class SubmitIn(BaseModel):
    name: constr(strip_whitespace=True, min_length=1, max_length=40) = Field(...)
    answers: List[AnswerIn]
    extra: Optional[List[int]] = Field(default_factory=list)

class LeaderboardItem(BaseModel):
    name: str
    score: int
    created_at: datetime

class SubmitOut(BaseModel):
    score: int
    total: int
    leaderboard: List[LeaderboardItem]

class CheckIn(BaseModel):
    id: int
    selected: Literal["1","X","2"]

class CheckOut(BaseModel):
    correct: Literal["1","X","2"]
    is_correct: bool

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/questions")
def get_questions(lang: str = "sv"):
    data = load_questions(lang)
    public = []
    for q in data:
        public.append({
            "id": q["id"],
            "text": q["text"],
            "options": q["options"],
            "media": q.get("media")
        })
    return {"questions": public}

@app.get("/api/challenge")
def get_challenge(lang: str = "sv"):
    items = load_challenge(lang)
    public = [{"id": it["id"], "label": it["label"]} for it in items]
    return {"items": public}

@app.post("/api/check", response_model=CheckOut)
def check(payload: CheckIn, lang: str = "sv"):
    data = load_questions(lang)
    correct_map = {q["id"]: q["correct"] for q in data}
    if payload.id not in correct_map:
        raise HTTPException(status_code=404, detail="Question not found")
    correct = correct_map[payload.id]
    return CheckOut(correct=correct, is_correct=(payload.selected == correct))

@app.get("/api/leaderboard")
def get_leaderboard(limit: int = 20):
    rows = top_scores(limit=limit)
    return {"leaderboard": rows}


@app.post("/api/submit", response_model=SubmitOut)
def submit(payload: SubmitIn, lang: str = "sv"):
    data = load_questions(lang)
    answers_map = {a.id: a.selected for a in payload.answers}
    correct_map = {q["id"]: q["correct"] for q in data}
    total = len(correct_map)

    # Räkna poäng för 1/X/2-frågorna
    score = 0
    for qid, corr in correct_map.items():
        sel = answers_map.get(qid)
        if sel and sel == corr:
            score += 1

    # Extra-knappar: +1 för rätt, -1 för fel
    chosen = set(payload.extra or [])
    challenge = load_challenge(lang) or load_challenge(None)
    corr_by_id = {it["id"]: bool(it.get("correct")) for it in challenge}
    for cid in chosen:
        if cid in corr_by_id:
            score += 1 if corr_by_id[cid] else -1

    # --- Spara i Mongo + hämta topplista ---
    insert_score(payload.name, score)
    lb = top_scores(limit=20)

    return SubmitOut(score=score, total=total, leaderboard=lb)
