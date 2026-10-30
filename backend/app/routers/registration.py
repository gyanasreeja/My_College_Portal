from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import rate_limit, require_roles, staff_profile
from ..models import Batch, Department, Registration, Role, Student, Teacher, User
from ..schemas import RegisterIn, RejectIn
from ..security import hash_password

router = APIRouter(tags=["registration"])
heads = require_roles(Role.admin, Role.faculty)
MAX_PENDING = 1000  # stops a flood of fake sign-ups


@router.post("/auth/register", dependencies=[Depends(rate_limit("register", 30, 3600))])
def register(body: RegisterIn, db: Session = Depends(get_db)):
    email = body.email.lower()
    if not db.get(Department, body.department_id):
        raise HTTPException(400, "Unknown department")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(409, "This email is already registered. Try logging in.")
    if db.query(Registration).filter(Registration.email == email, Registration.status == "pending").first():
        raise HTTPException(409, "A registration for this email is already waiting for approval.")
    if db.query(Registration).filter(Registration.status == "pending").count() >= MAX_PENDING:
        raise HTTPException(503, "Registrations are paused. Please contact the college office.")

    roll = None
    if body.role == "student":
        if not body.roll_no or not body.batch_id:
            raise HTTPException(400, "Students must give a roll number and a batch")
        batch = db.get(Batch, body.batch_id)
        if not batch or batch.department_id != body.department_id:
            raise HTTPException(400, "That batch does not belong to the chosen department")
        roll = body.roll_no.strip().upper()
        if (db.query(Student).filter(Student.roll_no == roll).first()
                or db.query(Registration).filter(Registration.roll_no == roll, Registration.status == "pending").first()):
            raise HTTPException(409, "This roll number is already registered.")

    db.add(Registration(
        role=body.role, name=body.name.strip(), email=email, hashed_password=hash_password(body.password),
        department_id=body.department_id, batch_id=body.batch_id if body.role == "student" else None,
        roll_no=roll, current_year=body.current_year, section=(body.section or None) and body.section.strip().upper(),
        phone=body.phone, guardian_name=body.guardian_name))
    db.commit()
    return {"message": "Registration received. You can log in after the college approves it."}


def _scope(db: Session, user: User):
    """Admin sees everything. Faculty only see students of their own department."""
    q = db.query(Registration)
    if user.role == Role.faculty:
        prof = staff_profile(user, db)
        q = q.filter(Registration.role == "student", Registration.department_id == (prof.department_id if prof else -1))
    return q


@router.get("/registrations")
def list_registrations(status: str = "pending", db: Session = Depends(get_db), user: User = Depends(heads)):
    q = _scope(db, user)
    if status != "all":
        q = q.filter(Registration.status == status)
    depts = {d.id: d.code for d in db.query(Department).all()}
    batches = {b.id: b.name for b in db.query(Batch).all()}
    return [{"id": r.id, "role": r.role, "name": r.name, "email": r.email, "department": depts.get(r.department_id),
             "batch": batches.get(r.batch_id), "roll_no": r.roll_no, "year": r.current_year if r.role == "student" else None,
             "section": r.section, "phone": r.phone, "status": r.status, "reason": r.reason,
             "registered_at": r.created_at, "decided_at": r.decided_at}
            for r in q.order_by(Registration.created_at.desc()).limit(500).all()]


def _get_for_decision(db: Session, user: User, reg_id: int) -> Registration:
    reg = _scope(db, user).filter(Registration.id == reg_id).first()
    if not reg:
        raise HTTPException(404, "Registration not found")
    if reg.status != "pending":
        raise HTTPException(409, f"Already {reg.status}")
    return reg


@router.post("/registrations/{reg_id}/approve")
def approve(reg_id: int, db: Session = Depends(get_db), user: User = Depends(heads)):
    reg = _get_for_decision(db, user, reg_id)
    if db.query(User).filter(User.email == reg.email).first():
        raise HTTPException(409, "That email already has an account")
    if reg.role == "student" and db.query(Student).filter(Student.roll_no == reg.roll_no).first():
        raise HTTPException(409, "That roll number already exists")
    role = Role.student if reg.role == "student" else Role.teacher
    # registration day is kept as the account's created_at
    new_user = User(email=reg.email, hashed_password=reg.hashed_password, role=role, created_at=reg.created_at)
    db.add(new_user)
    db.flush()
    if role == Role.student:
        db.add(Student(user_id=new_user.id, roll_no=reg.roll_no, name=reg.name, department_id=reg.department_id,
                       batch_id=reg.batch_id, current_year=reg.current_year, section=reg.section,
                       phone=reg.phone, guardian_name=reg.guardian_name))
    else:
        db.add(Teacher(user_id=new_user.id, name=reg.name, department_id=reg.department_id))
    reg.status, reg.decided_at, reg.decided_by = "approved", datetime.utcnow(), user.id
    db.commit()
    return {"approved": reg.id}


@router.post("/registrations/{reg_id}/reject")
def reject(reg_id: int, body: RejectIn, db: Session = Depends(get_db), user: User = Depends(heads)):
    reg = _get_for_decision(db, user, reg_id)
    reg.status, reg.reason, reg.decided_at, reg.decided_by = "rejected", body.reason, datetime.utcnow(), user.id
    db.commit()
    return {"rejected": reg.id}