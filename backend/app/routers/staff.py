from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_roles, staff_profile
from ..grading import grade_for
from ..models import (Achievement, Attendance, Result, Role, Student, Subject,
                      TeacherSubject, User)
from ..schemas import AchievementIn, AttendanceIn, PublishIn, ResultIn

router = APIRouter(prefix="/staff", tags=["staff"])
staff_roles = require_roles(Role.admin, Role.faculty, Role.teacher)


def _check_subject_access(db: Session, user: User, subject_id: int):
    """Admin: any subject. Faculty: own department. Teacher: only assigned subjects."""
    subject = db.get(Subject, subject_id)
    if not subject:
        raise HTTPException(404, "Subject not found")
    if user.role == Role.admin:
        return subject
    profile = staff_profile(user, db)
    if not profile:
        raise HTTPException(403, "Staff profile missing")
    if user.role == Role.faculty:
        if subject.department_id != profile.department_id:
            raise HTTPException(403, "Subject belongs to another department")
        return subject
    assigned = db.query(TeacherSubject).filter_by(teacher_id=profile.id, subject_id=subject_id).first()
    if not assigned:
        raise HTTPException(403, "You are not assigned to this subject")
    return subject


@router.get("/students")
def students_for_subject(subject_id: int, batch_id: int | None = None,
                         db: Session = Depends(get_db), user: User = Depends(staff_roles)):
    subject = _check_subject_access(db, user, subject_id)
    q = db.query(Student).filter(Student.department_id == subject.department_id)
    if batch_id:
        q = q.filter(Student.batch_id == batch_id)
    return [{"id": s.id, "roll_no": s.roll_no, "name": s.name} for s in q.order_by(Student.roll_no).all()]


@router.post("/attendance")
def mark_attendance(body: AttendanceIn, db: Session = Depends(get_db), user: User = Depends(staff_roles)):
    _check_subject_access(db, user, body.subject_id)
    for rec in body.records:
        row = db.query(Attendance).filter_by(student_id=rec.student_id, subject_id=body.subject_id, date=body.date).first()
        if row:
            row.present = rec.present
        else:
            db.add(Attendance(student_id=rec.student_id, subject_id=body.subject_id, date=body.date, present=rec.present))
    db.commit()
    return {"saved": len(body.records)}


@router.post("/results")
def enter_result(body: ResultIn, db: Session = Depends(get_db), user: User = Depends(staff_roles)):
    _check_subject_access(db, user, body.subject_id)
    total = body.internal + body.external
    row = db.query(Result).filter_by(student_id=body.student_id, subject_id=body.subject_id,
                                     semester=body.semester, academic_year=body.academic_year).first()
    if row and row.published and user.role == Role.teacher:
        raise HTTPException(409, "Result already published; ask faculty to change it")
    if not row:
        row = Result(student_id=body.student_id, subject_id=body.subject_id,
                     semester=body.semester, academic_year=body.academic_year)
        db.add(row)
    row.internal, row.external, row.total, row.grade = body.internal, body.external, total, grade_for(total)
    db.commit()
    return {"total": total, "grade": row.grade, "published": row.published}


@router.post("/results/publish")
def publish_results(body: PublishIn, db: Session = Depends(get_db),
                    user: User = Depends(require_roles(Role.admin, Role.faculty))):
    if user.role == Role.faculty:
        profile = staff_profile(user, db)
        if not profile or profile.department_id != body.department_id:
            raise HTTPException(403, "You can only publish for your own department")
    rows = (db.query(Result).join(Student, Student.id == Result.student_id)
            .filter(Student.department_id == body.department_id, Student.batch_id == body.batch_id,
                    Result.semester == body.semester, Result.academic_year == body.academic_year).all())
    for r in rows:
        r.published = True
    db.commit()
    return {"published": len(rows)}


@router.post("/achievements")
def add_achievement(body: AchievementIn, db: Session = Depends(get_db),
                    user: User = Depends(require_roles(Role.admin, Role.faculty))):
    data = body.model_dump()
    data["date"] = data["date"] or date.today()
    ach = Achievement(**data)
    db.add(ach)
    db.commit()
    return {"id": ach.id}

