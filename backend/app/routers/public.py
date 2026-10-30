from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..aiservices import public_chat
from ..database import get_db
from ..models import (Achievement, Activity, Announcement, Batch, CollegeInfo, Department,
                      Student, Teacher)
from ..schemas import ChatIn

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/departments")
def departments(db: Session = Depends(get_db)):
    return [{"id": d.id, "name": d.name, "code": d.code, "description": d.description}
            for d in db.query(Department).all()]


@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    """Only totals, so it is safe to show to everyone."""
    return {
        "students": db.query(Student).count(),
        "teachers": db.query(Teacher).count(),
        "departments": db.query(Department).count(),
        "achievements": db.query(Achievement).filter(Achievement.is_public.is_(True)).count(),
    }


@router.get("/batches")
def batches(db: Session = Depends(get_db)):
    return [{"id": b.id, "name": b.name, "department_id": b.department_id}
            for b in db.query(Batch).order_by(Batch.name).all()]


@router.get("/announcements")
def announcements(db: Session = Depends(get_db)):
    rows = (db.query(Announcement).filter(Announcement.is_public.is_(True))
            .order_by(Announcement.created_at.desc()).limit(20).all())
    return [{"id": a.id, "title": a.title, "body": a.body, "created_at": a.created_at} for a in rows]


@router.get("/activities")
def activities(category: str | None = None, department_id: int | None = None,
               db: Session = Depends(get_db)):
    q = db.query(Activity)
    if category:
        q = q.filter(Activity.category == category)
    if department_id:
        q = q.filter(Activity.department_id == department_id)
    return [{"id": a.id, "title": a.title, "description": a.description, "category": a.category,
             "department_id": a.department_id, "event_date": a.event_date, "venue": a.venue}
            for a in q.order_by(Activity.event_date.desc()).limit(200).all()]


@router.get("/achievements")
def achievements(db: Session = Depends(get_db)):
    rows = (db.query(Achievement, Student).join(Student, Student.id == Achievement.student_id)
            .filter(Achievement.is_public.is_(True)).order_by(Achievement.date.desc()).limit(30).all())
    return [{"id": a.id, "title": a.title, "category": a.category, "date": a.date,
             "student_name": s.name} for a, s in rows]


@router.post("/chat")
def chat(body: ChatIn, db: Session = Depends(get_db)):
    docs = [(i.topic, i.content) for i in db.query(CollegeInfo).all()]
    return public_chat(body.question, docs)