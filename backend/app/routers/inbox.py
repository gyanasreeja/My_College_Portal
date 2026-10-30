from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import rate_limit, require_roles
from ..models import (AdmissionEnquiry, Department, Feedback, Role, Student, Teacher, User)
from ..schemas import EnquiryIn, FeedbackIn

router = APIRouter(tags=["inbox"])
admin_only = require_roles(Role.admin)


# ---------- public forms (no login) ----------

@router.post("/public/feedback", dependencies=[Depends(rate_limit("feedback", 20, 3600))])
def send_feedback(body: FeedbackIn, db: Session = Depends(get_db)):
    db.add(Feedback(name=body.name.strip(), email=body.email, rating=body.rating, message=body.message.strip()))
    db.commit()
    return {"message": "Thank you for your feedback."}


@router.post("/public/admission-enquiry", dependencies=[Depends(rate_limit("enquiry", 20, 3600))])
def send_enquiry(body: EnquiryIn, db: Session = Depends(get_db)):
    if body.department_id and not db.get(Department, body.department_id):
        raise HTTPException(400, "Unknown department")
    db.add(AdmissionEnquiry(name=body.name.strip(), email=body.email, phone=body.phone,
                            department_id=body.department_id, message=body.message))
    db.commit()
    return {"message": "Thank you. The admissions office will contact you soon."}


# ---------- admin inbox ----------

@router.get("/admin/feedback")
def list_feedback(db: Session = Depends(get_db), _=Depends(admin_only)):
    rows = db.query(Feedback).order_by(Feedback.created_at.desc()).limit(300).all()
    return [{"id": f.id, "name": f.name, "email": f.email, "rating": f.rating, "message": f.message,
             "created_at": f.created_at} for f in rows]


@router.get("/admin/enquiries")
def list_enquiries(db: Session = Depends(get_db), _=Depends(admin_only)):
    codes = {d.id: d.code for d in db.query(Department).all()}
    rows = db.query(AdmissionEnquiry).order_by(AdmissionEnquiry.created_at.desc()).limit(300).all()
    return [{"id": e.id, "name": e.name, "email": e.email, "phone": e.phone,
             "department": codes.get(e.department_id, "Not sure"), "message": e.message,
             "status": e.status, "created_at": e.created_at} for e in rows]


@router.post("/admin/enquiries/{enquiry_id}/handled")
def mark_handled(enquiry_id: int, db: Session = Depends(get_db), _=Depends(admin_only)):
    e = db.get(AdmissionEnquiry, enquiry_id)
    if not e:
        raise HTTPException(404, "Enquiry not found")
    e.status = "handled"
    db.commit()
    return {"id": e.id, "status": e.status}


# ---------- admin directory: students by department and year, teachers by department ----------

@router.get("/admin/directory/summary")
def directory_summary(db: Session = Depends(get_db), _=Depends(admin_only)):
    stu = dict()
    for dept_id, year, n in (db.query(Student.department_id, Student.current_year, func.count(Student.id))
                             .group_by(Student.department_id, Student.current_year).all()):
        stu.setdefault(dept_id, {})[year] = n
    tea = dict(db.query(Teacher.department_id, func.count(Teacher.id)).group_by(Teacher.department_id).all())
    return [{"department_id": d.id, "department": d.name, "code": d.code,
             "students_by_year": {str(y): stu.get(d.id, {}).get(y, 0) for y in (1, 2, 3, 4)},
             "students": sum(stu.get(d.id, {}).values()), "teachers": tea.get(d.id, 0)}
            for d in db.query(Department).order_by(Department.code).all()]


@router.get("/admin/directory/students")
def directory_students(department_id: int | None = None, year: int | None = None, batch_id: int | None = None,
                       db: Session = Depends(get_db), _=Depends(admin_only)):
    q = db.query(Student, User).join(User, User.id == Student.user_id)
    if department_id:
        q = q.filter(Student.department_id == department_id)
    if year:
        q = q.filter(Student.current_year == year)
    if batch_id:
        q = q.filter(Student.batch_id == batch_id)
    codes = {d.id: d.code for d in db.query(Department).all()}
    return [{"id": s.id, "roll_no": s.roll_no, "name": s.name, "email": u.email,
             "department": codes.get(s.department_id), "year": s.current_year, "section": s.section,
             "registered_at": u.created_at}
            for s, u in q.order_by(Student.department_id, Student.current_year, Student.roll_no).limit(1000).all()]


@router.get("/admin/directory/teachers")
def directory_teachers(department_id: int | None = None, db: Session = Depends(get_db), _=Depends(admin_only)):
    q = db.query(Teacher, User).join(User, User.id == Teacher.user_id)
    if department_id:
        q = q.filter(Teacher.department_id == department_id)
    codes = {d.id: d.code for d in db.query(Department).all()}
    return [{"id": t.id, "name": t.name, "email": u.email, "role": u.role.value,
             "department": codes.get(t.department_id), "registered_at": u.created_at}
            for t, u in q.order_by(Teacher.department_id, Teacher.name).all()]