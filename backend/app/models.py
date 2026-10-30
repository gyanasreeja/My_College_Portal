from sqlalchemy import (Boolean, Date, DateTime, Enum, Float, ForeignKey,
                        Integer, String, Text, UniqueConstraint)
import enum
from datetime import date, datetime

from sqlalchemy import (Boolean, Date, DateTime, Enum, Float, ForeignKey,
                        Integer, String, Text, UniqueConstraint)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Role(str, enum.Enum):
    admin = "admin"
    faculty = "faculty"   # department-level: publishes results, announcements
    teacher = "teacher"   # subject-level: attendance + marks for assigned subjects
    student = "student"   # own data only


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(Enum(Role))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    code: Mapped[str] = mapped_column(String(10), unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class Batch(Base):
    __tablename__ = "batches"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(20))  # e.g. "2022-2026"
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"))
    __table_args__ = (UniqueConstraint("name", "department_id"),)


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    roll_no: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"))
    batch_id: Mapped[int] = mapped_column(ForeignKey("batches.id"))
    current_year: Mapped[int] = mapped_column(Integer, default=1)
    section: Mapped[str | None] = mapped_column(String(5), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    guardian_name: Mapped[str | None] = mapped_column(String(120), nullable=True)

    department = relationship("Department")
    batch = relationship("Batch")


class Teacher(Base):
    __tablename__ = "teachers"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"))


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"))
    semester: Mapped[int] = mapped_column(Integer)
    credits: Mapped[int] = mapped_column(Integer, default=3)


class TeacherSubject(Base):
    __tablename__ = "teacher_subjects"

    id: Mapped[int] = mapped_column(primary_key=True)
    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"))
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"))
    __table_args__ = (UniqueConstraint("teacher_id", "subject_id"),)


class Result(Base):
    __tablename__ = "results"

    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), index=True)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"))
    semester: Mapped[int] = mapped_column(Integer)
    academic_year: Mapped[str] = mapped_column(String(9))  # "2024-2025"
    internal: Mapped[float] = mapped_column(Float, default=0)  # out of 40
    external: Mapped[float] = mapped_column(Float, default=0)  # out of 60
    total: Mapped[float] = mapped_column(Float, default=0)
    grade: Mapped[str] = mapped_column(String(3), default="F")
    published: Mapped[bool] = mapped_column(Boolean, default=False)

    subject = relationship("Subject")
    __table_args__ = (UniqueConstraint("student_id", "subject_id", "semester", "academic_year"),)


class Attendance(Base):
    __tablename__ = "attendance"

    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), index=True)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"))
    date: Mapped[date] = mapped_column(Date)
    present: Mapped[bool] = mapped_column(Boolean)

    subject = relationship("Subject")
    __table_args__ = (UniqueConstraint("student_id", "subject_id", "date"),)


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50), default="academic")
    date: Mapped[date] = mapped_column(Date, default=date.today)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)

    student = relationship("Student")


class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class CollegeInfo(Base):
    """Public knowledge base that the guest chatbot answers from."""
    __tablename__ = "college_info"

    id: Mapped[int] = mapped_column(primary_key=True)
    topic: Mapped[str] = mapped_column(String(120))
    content: Mapped[str] = mapped_column(Text)
class Activity(Base):
    """College events and activities. Shown to everyone on the public site."""
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50), default="General")
    department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    event_date: Mapped[date] = mapped_column(Date)
    venue: Mapped[str | None] = mapped_column(String(120), nullable=True)


class PlacementDrive(Base):
    """Login required. department_id empty means open to every department."""
    __tablename__ = "placement_drives"

    id: Mapped[int] = mapped_column(primary_key=True)
    company: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(120))
    package_lpa: Mapped[float | None] = mapped_column(Float, nullable=True)
    eligibility: Mapped[str | None] = mapped_column(Text, nullable=True)
    drive_date: Mapped[date] = mapped_column(Date)
    last_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)


class TrainingSession(Base):
    """Login required."""
    __tablename__ = "training_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    trainer: Mapped[str | None] = mapped_column(String(120), nullable=True)
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    timing: Mapped[str | None] = mapped_column(String(60), nullable=True)
    mode: Mapped[str] = mapped_column(String(30), default="Offline")
    venue: Mapped[str | None] = mapped_column(String(120), nullable=True)
    department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class Lab(Base):
    """Login required."""
    __tablename__ = "labs"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"))
    location: Mapped[str | None] = mapped_column(String(120), nullable=True)
    incharge: Mapped[str | None] = mapped_column(String(120), nullable=True)
    timings: Mapped[str | None] = mapped_column(String(80), nullable=True)
    equipment: Mapped[str | None] = mapped_column(Text, nullable=True)
        
class Registration(Base):
    """Self-registration request. Becomes a real login only after approval."""
    __tablename__ = "registrations"

    id: Mapped[int] = mapped_column(primary_key=True)
    role: Mapped[str] = mapped_column(String(10))  # student or teacher
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"))
    batch_id: Mapped[int | None] = mapped_column(ForeignKey("batches.id"), nullable=True)
    roll_no: Mapped[str | None] = mapped_column(String(30), nullable=True)
    current_year: Mapped[int] = mapped_column(Integer, default=1)
    section: Mapped[str | None] = mapped_column(String(5), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    guardian_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    status: Mapped[str] = mapped_column(String(10), default="pending", index=True)  # pending/approved/rejected
    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    decided_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)


class Feedback(Base):
    """Public feedback form."""
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    rating: Mapped[int] = mapped_column(Integer)
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AdmissionEnquiry(Base):
    """Public admission enquiry form."""
    __tablename__ = "admission_enquiries"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(20))
    department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(10), default="new")  # new / handled
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
