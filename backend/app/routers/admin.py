from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_roles
from ..models import (Announcement, Batch, CollegeInfo, Department, Role, Student,
                      Subject, Teacher, TeacherSubject, User)
from ..schemas import (AnnouncementIn, BatchIn, CollegeInfoIn, DepartmentIn,
                       StaffCreate, StudentCreate, SubjectIn)
from ..security import hash_password
from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/admin", tags=["admin"])
admin_only = require_roles(Role.admin)


def _ensure_new_email(db: Session, email: str):
    if db.query(User).filter(User.email == email.lower()).first():
        raise HTTPException(409, "Email already registered")


@router.post("/departments")
def create_department(body: DepartmentIn, db: Session = Depends(get_db), _=Depends(admin_only)):
    dept = Department(**body.model_dump())
    db.add(dept)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="A department with this code already exists")
    db.refresh(dept)
    return dept
    


@router.post("/batches")
def create_batch(body: BatchIn, db: Session = Depends(get_db), _=Depends(admin_only)):
    batch = Batch(**body.model_dump())
    db.add(batch)
    db.commit()
    return {"id": batch.id}


@router.post("/subjects")
def create_subject(body: SubjectIn, db: Session = Depends(get_db), _=Depends(admin_only)):
    subject = Subject(**body.model_dump())
    db.add(subject)
    db.commit()
    return {"id": subject.id}


@router.post("/students")
def create_student(body: StudentCreate, db: Session = Depends(get_db), _=Depends(admin_only)):
    _ensure_new_email(db, body.email)
    user = User(email=body.email.lower(), hashed_password=hash_password(body.password), role=Role.student)
    db.add(user)
    db.flush()
    data = body.model_dump(exclude={"email", "password"})
    student = Student(user_id=user.id, **data)
    db.add(student)
    db.commit()
    return {"id": student.id, "user_id": user.id}


@router.post("/staff")
def create_staff(body: StaffCreate, db: Session = Depends(get_db), _=Depends(admin_only)):
    if body.role not in (Role.teacher, Role.faculty):
        raise HTTPException(400, "role must be teacher or faculty")
    _ensure_new_email(db, body.email)
    user = User(email=body.email.lower(), hashed_password=hash_password(body.password), role=body.role)
    db.add(user)
    db.flush()
    teacher = Teacher(user_id=user.id, name=body.name, department_id=body.department_id)
    db.add(teacher)
    db.flush()
    for sid in body.subject_ids:
        db.add(TeacherSubject(teacher_id=teacher.id, subject_id=sid))
    db.commit()
    return {"id": teacher.id, "user_id": user.id}


@router.get("/students")
def list_students(department_id: int | None = None, batch_id: int | None = None,
                  db: Session = Depends(get_db), _=Depends(admin_only)):
    q = db.query(Student)
    if department_id:
        q = q.filter(Student.department_id == department_id)
    if batch_id:
        q = q.filter(Student.batch_id == batch_id)
    return [{"id": s.id, "roll_no": s.roll_no, "name": s.name, "year": s.current_year,
             "department_id": s.department_id, "batch_id": s.batch_id} for s in q.all()]


@router.post("/announcements")
def create_announcement(body: AnnouncementIn, db: Session = Depends(get_db),
                        user: User = Depends(require_roles(Role.admin, Role.faculty))):
    ann = Announcement(**body.model_dump(), created_by=user.id)
    db.add(ann)
    db.commit()
    return {"id": ann.id}


@router.post("/college-info")
def add_college_info(body: CollegeInfoIn, db: Session = Depends(get_db), _=Depends(admin_only)):
    info = CollegeInfo(**body.model_dump())
    db.add(info)
    db.commit()
    return {"id": info.id}


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), _=Depends(admin_only)):
    return {
        "students": db.query(Student).count(),
        "teachers": db.query(Teacher).count(),
        "departments": db.query(Department).count(),
        "subjects": db.query(Subject).count(),
    }

