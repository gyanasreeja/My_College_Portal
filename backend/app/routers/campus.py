from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user, require_roles, staff_profile
from ..models import (Activity, Department, Lab, PlacementDrive, Role, Student,
                      TrainingSession, User)
from ..schemas import ActivityIn, LabIn, PlacementIn, TrainingIn

router = APIRouter(prefix="/campus", tags=["campus"])
heads = require_roles(Role.admin, Role.faculty)  # who may add content


def _student_department(db: Session, user: User) -> int | None:
    if user.role != Role.student:
        return None
    s = db.query(Student).filter(Student.user_id == user.id).first()
    return s.department_id if s else None


def _dept_codes(db: Session) -> dict[int, str]:
    return {d.id: d.code for d in db.query(Department).all()}


def _scope_check(db: Session, user: User, department_id: int | None):
    """Admin may post for any department or for everyone. Faculty only for their own department."""
    if user.role == Role.admin:
        return
    profile = staff_profile(user, db)
    if not profile:
        raise HTTPException(403, "Staff profile missing")
    if department_id is None:
        raise HTTPException(403, "Only the admin can post for all departments")
    if department_id != profile.department_id:
        raise HTTPException(403, "You can only post for your own department")


# ---------- login required: any signed-in student, teacher, faculty or admin ----------

@router.get("/placements")
def placements(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(PlacementDrive)
    dept = _student_department(db, user)
    if user.role == Role.student:  # students see drives open to everyone or to their own department
        q = q.filter(or_(PlacementDrive.department_id.is_(None), PlacementDrive.department_id == dept))
    codes, today = _dept_codes(db), date.today()
    return [{"id": d.id, "company": d.company, "role": d.role, "package_lpa": d.package_lpa,
             "eligibility": d.eligibility, "drive_date": d.drive_date, "last_date": d.last_date,
             "department": codes.get(d.department_id, "All"), "details": d.details,
             "status": "upcoming" if d.drive_date >= today else "completed"}
            for d in q.order_by(PlacementDrive.drive_date.desc()).all()]


@router.get("/training")
def training(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(TrainingSession)
    dept = _student_department(db, user)
    if user.role == Role.student:
        q = q.filter(or_(TrainingSession.department_id.is_(None), TrainingSession.department_id == dept))
    codes = _dept_codes(db)
    return [{"id": t.id, "title": t.title, "trainer": t.trainer, "start_date": t.start_date,
             "end_date": t.end_date, "timing": t.timing, "mode": t.mode, "venue": t.venue,
             "department": codes.get(t.department_id, "All"), "description": t.description}
            for t in q.order_by(TrainingSession.start_date.desc()).all()]


@router.get("/labs")
def labs(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = (db.query(Lab, Department).join(Department, Department.id == Lab.department_id)
            .order_by(Department.code, Lab.name).all())
    return [{"id": l.id, "name": l.name, "department_id": d.id, "department": d.name, "dept_code": d.code,
             "location": l.location, "incharge": l.incharge, "timings": l.timings,
             "equipment": l.equipment} for l, d in rows]


# ---------- adding content: admin and faculty only ----------

@router.post("/activities")
def add_activity(body: ActivityIn, db: Session = Depends(get_db), user: User = Depends(heads)):
    _scope_check(db, user, body.department_id)
    row = Activity(**body.model_dump())
    db.add(row)
    db.commit()
    return {"id": row.id}


@router.post("/placements")
def add_placement(body: PlacementIn, db: Session = Depends(get_db), user: User = Depends(heads)):
    _scope_check(db, user, body.department_id)
    row = PlacementDrive(**body.model_dump())
    db.add(row)
    db.commit()
    return {"id": row.id}


@router.post("/training")
def add_training(body: TrainingIn, db: Session = Depends(get_db), user: User = Depends(heads)):
    _scope_check(db, user, body.department_id)
    row = TrainingSession(**body.model_dump())
    db.add(row)
    db.commit()
    return {"id": row.id}


@router.post("/labs")
def add_lab(body: LabIn, db: Session = Depends(get_db), user: User = Depends(heads)):
    _scope_check(db, user, body.department_id)
    row = Lab(**body.model_dump())
    db.add(row)
    db.commit()
    return {"id": row.id}