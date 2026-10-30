import httpx

from .config import settings

# Questions touching these need a logged-in user, so the public bot never answers them
PRIVATE_KEYWORDS = [
    "result", "marks", "grade", "gpa", "cgpa", "backlog", "attendance", "absent",
    "present", "assignment", "task", "deadline", "fee", "my ", "timetable",
]


def needs_login(question: str) -> bool:
    q = question.lower()
    return any(k in q for k in PRIVATE_KEYWORDS)


def _ollama_chat(system: str, user: str) -> str | None:
    """Call a local open model through Ollama. Returns None if Ollama isn't running."""
    try:
        r = httpx.post(
            f"{settings.ollama_url}/api/chat",
            json={
                "model": settings.ollama_model,
                "stream": False,
                "options": {"temperature": 0.4},
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
            },
            timeout=90,
        )
        r.raise_for_status()
        return r.json()["message"]["content"].strip()
    except Exception:
        return None


def public_chat(question: str, docs: list[tuple[str, str]]) -> dict:
    if needs_login(question):
        return {
            "requires_login": True,
            "answer": "That information is private. Please log in to see your results, attendance or tasks.",
        }

    context = "\n\n".join(f"{t}: {c}" for t, c in docs)
    system = (
        "You are the helpful assistant on a college website. Answer only from the college "
        "information below. If the answer is not there, say you don't know and suggest "
        "contacting the college office. Keep answers short.\n\n" + context
    )
    answer = _ollama_chat(system, question)
    source = "ai"
    if not answer:
        source = "search"
        words = {w for w in question.lower().split() if len(w) > 3}
        hits = [c for t, c in docs if words & set((t + " " + c).lower().split())]
        answer = hits[0] if hits else "Sorry, I don't have that information. Please contact the college office."
    return {"requires_login": False, "answer": answer, "source": source}


def study_advice(name: str, subjects: list[dict], attendance: list[dict]) -> dict:
    """subjects: [{name, total, grade}], attendance: [{subject, percent}]"""
    weak = [s for s in subjects if s["total"] < 50]
    low_att = [a for a in attendance if a["percent"] < 75]

    summary = "\n".join(f"- {s['name']}: {s['total']}/100 (grade {s['grade']})" for s in subjects) or "- no published results yet"
    att_summary = "\n".join(f"- {a['subject']}: {a['percent']}%" for a in attendance) or "- no attendance yet"

    system = (
        "You are a supportive academic mentor. Using ONLY the data given, write a short study "
        "plan: 1) one line of encouragement, 2) what to focus on in weak subjects, 3) a simple "
        "weekly routine, 4) a note if attendance is below 75%. Do not invent marks or subjects. "
        "Use simple English and keep it under 180 words."
    )
    user = f"Student: {name}\n\nMarks:\n{summary}\n\nAttendance:\n{att_summary}"
    text = _ollama_chat(system, user)
    source = "ai"

    if not text:
        source = "rules"
        parts = []
        if weak:
            parts.append("Focus first on: " + ", ".join(s["name"] for s in weak) + ". Revise one topic daily and solve previous papers.")
        else:
            parts.append("Your scores look healthy. Keep revising regularly and aim to move up a grade.")
        if low_att:
            parts.append("Attendance is below 75% in: " + ", ".join(a["subject"] for a in low_att) + ". Attend every class from now on.")
        parts.append("Weekly routine: 2 hours on your weakest subject, 1 hour on each other subject, 1 revision day.")
        text = " ".join(parts)

    return {
        "source": source,
        "advice": text,
        "weak_subjects": [s["name"] for s in weak],
        "low_attendance": [a["subject"] for a in low_att],
    }

