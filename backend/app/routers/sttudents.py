from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..aiservices import study_advice
from ..database import get_db
from ..deps import current_student
from ..grading import GRADE_POINTS
from ..models import Achievement, Attendance, Result, Student, Subject

router = APIRouter(prefix="/student", tags=["student"])


def _results(db: Session, student: Student, semester: int | None = None):
    q = (db.query(Result, Subject).join(Subject, Subject.id == Result.subject_id)
         .filter(Result.student_id == student.id, Result.published.is_(True)))
    if semester:
        q = q.filter(Result.semester == semester)
    return q.order_by(Result.semester, Subject.name).all()


def _attendance_summary(db: Session, student: Student):
    rows = (db.query(Attendance, Subject).join(Subject, Subject.id == Attendance.subject_id)
            .filter(Attendance.student_id == student.id).all())
    stats = defaultdict(lambda: [0, 0, ""])
    for a, s in rows:
        stats[s.id][0] += 1 if a.present else 0
        stats[s.id][1] += 1
        stats[s.id][2] = s.name
    return [{"subject": name, "attended": p, "total": t, "percent": round(p * 100 / t, 1)}
            for p, t, name in stats.values()]


@router.get("/profile")
def profile(student: Student = Depends(current_student)):
    return {"id": student.id, "roll_no": student.roll_no, "name": student.name,
            "year": student.current_year, "section": student.section,
            "department": student.department.name, "batch": student.batch.name}


@router.get("/results")
def results(semester: int | None = None, db: Session = Depends(get_db),
            student: Student = Depends(current_student)):
    rows = _results(db, student, semester)
    by_sem = defaultdict(list)
    for r, s in rows:
        by_sem[r.semester].append({"subject": s.name, "code": s.code, "credits": s.credits,
                                   "internal": r.internal, "external": r.external,
                                   "total": r.total, "grade": r.grade})
    out = []
    for sem, items in sorted(by_sem.items()):
        credits = sum(i["credits"] for i in items)
        points = sum(GRADE_POINTS[i["grade"]] * i["credits"] for i in items)
        out.append({"semester": sem, "sgpa": round(points / credits, 2) if credits else 0, "subjects": items})
    return out


@router.get("/attendance")
def attendance(db: Session = Depends(get_db), student: Student = Depends(current_student)):
    return _attendance_summary(db, student)


@router.get("/achievements")
def my_achievements(db: Session = Depends(get_db), student: Student = Depends(current_student)):
    rows = db.query(Achievement).filter(Achievement.student_id == student.id).all()
    return [{"id": a.id, "title": a.title, "category": a.category, "date": a.date} for a in rows]


@router.get("/ai-advice")
def ai_advice(db: Session = Depends(get_db), student: Student = Depends(current_student)):
    subjects = [{"name": s.name, "total": r.total, "grade": r.grade} for r, s in _results(db, student)]
    return study_advice(student.name, subjects, _attendance_summary(db, student))

