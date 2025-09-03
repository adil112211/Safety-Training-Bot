import os, json
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ===== Models =====
class UserRegistration(BaseModel):
    telegram_id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo_url: Optional[str] = None
    language_code: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    experience_level: Optional[str] = None
    industry: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

# ===== App =====
app = FastAPI(title="Safety Training API")

# CORS: set your GitHub Pages origin, or allow all for quick start
GHPAGES_ORIGIN = os.getenv("GHPAGES_ORIGIN")  # e.g. https://yourname.github.io
allow_origins = ["*"] if not GHPAGES_ORIGIN else [GHPAGES_ORIGIN]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load courses once
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "courses.json")
with open(DATA_PATH, "r", encoding="utf-8") as f:
    COURSES = json.load(f)

_registered_users: Dict[int, UserRegistration] = {}

@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}

@app.post("/register")
def register_user(user: UserRegistration) -> Dict[str, str]:
    _registered_users[user.telegram_id] = user
    return {"status": "ok", "message": "Пользователь зарегистрирован"}

@app.get("/courses")
def get_courses() -> List[Dict]:
    return [{"id": c["id"], "title": c["title"], "description": c["description"], "lessons": c["lessons"]} for c in COURSES]

@app.get("/courses/{course_id}")
def get_course(course_id: int) -> Dict:
    for c in COURSES:
        if c["id"] == course_id:
            return c
    raise HTTPException(status_code=404, detail="Курс не найден")

@app.get("/lessons/{course_id}/{lesson_id}")
def get_lesson(course_id: int, lesson_id: int) -> Dict:
    for c in COURSES:
        if c["id"] == course_id:
            for l in c["lessons"]:
                if l["id"] == lesson_id:
                    return {
                        "course_id": course_id,
                        "lesson_id": lesson_id,
                        "title": l["title"],
                        "lesson_type": l["type"],
                        "content": l.get("content", {}),
                    }
    raise HTTPException(status_code=404, detail="Урок не найден")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
