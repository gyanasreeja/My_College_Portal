from datetime import date as date_type

from pydantic import BaseModel, EmailStr, Field

from .models import Role

from typing import Optional, Literal


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Role


class DepartmentIn(BaseModel):
    name: str
    code: str
    description: str | None = None


class BatchIn(BaseModel):
    name: str
    department_id: int


class SubjectIn(BaseModel):
    code: str
    name: str
    department_id: int
    semester: int = Field(ge=1, le=8)
    credits: int = 3


class StudentCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    roll_no: str
    name: str
    department_id: int
    batch_id: int
    current_year: int = Field(default=1, ge=1, le=4)
    section: str | None = None
    phone: str | None = None
    guardian_name: str | None = None


class StaffCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str
    department_id: int
    role: Role  # teacher or faculty
    subject_ids: list[int] = []


class AnnouncementIn(BaseModel):
    title: str
    body: str
    is_public: bool = True


class CollegeInfoIn(BaseModel):
    topic: str
    content: str


class AttendanceRecord(BaseModel):
    student_id: int
    present: bool


class AttendanceIn(BaseModel):
    subject_id: int
    date: date_type
    records: list[AttendanceRecord]


class ResultIn(BaseModel):
    student_id: int
    subject_id: int
    semester: int = Field(ge=1, le=8)
    academic_year: str = Field(pattern=r"^\d{4}-\d{4}$")
    internal: float = Field(ge=0, le=40)
    external: float = Field(ge=0, le=60)


class PublishIn(BaseModel):
    department_id: int
    batch_id: int
    semester: int = Field(ge=1, le=8)
    academic_year: str = Field(pattern=r"^\d{4}-\d{4}$")


class AchievementIn(BaseModel):
    student_id: int
    title: str
    description: str | None = None
    category: str = "academic"
    date: date_type | None = None
    is_public: bool = True


class ChatIn(BaseModel):
    question: str = Field(min_length=2, max_length=500)

class BulkStudentRow(BaseModel):
    roll_no: str
    name: str
    email: EmailStr
    section: str | None = None


class BulkStudentsIn(BaseModel):
    department_id: int
    batch_id: int
    current_year: int = Field(default=1, ge=1, le=4)
    section: str | None = None
    default_password: str = Field(min_length=8)
    students: list[BulkStudentRow] = Field(max_length=500)


class ResultRow(BaseModel):
    student_id: int
    internal: float = Field(ge=0, le=40)
    external: float = Field(ge=0, le=60)


class BulkResultsIn(BaseModel):
    subject_id: int
    semester: int = Field(ge=1, le=8)
    academic_year: str = Field(pattern=r"^\d{4}-\d{4}$")
    rows: list[ResultRow] = Field(max_length=500)  
class ActivityIn(BaseModel):
    title: str
    description: str | None = None
    category: str = "General"
    department_id: int | None = None
    event_date: date_type
    venue: str | None = None


class PlacementIn(BaseModel):
    company: str
    role: str
    package_lpa: float | None = Field(default=None, ge=0, le=500)
    eligibility: str | None = None
    drive_date: date_type
    last_date: date_type | None = None
    department_id: int | None = None
    details: str | None = None


class TrainingIn(BaseModel):
    title: str
    trainer: str | None = None
    start_date: date_type
    end_date: date_type | None = None
    timing: str | None = None
    mode: str = "Offline"
    venue: str | None = None
    department_id: int | None = None
    description: str | None = None


class LabIn(BaseModel):
    name: str
    department_id: int
    location: str | None = None
    incharge: str | None = None
    timings: str | None = None
    equipment: str | None = None      
class RegisterIn(BaseModel):
    role: Literal["student", "teacher"]  # nobody can register as faculty or admin
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)  # bcrypt only reads 72 bytes
    department_id: int
    batch_id: int | None = None
    roll_no: str | None = Field(default=None, max_length=30)
    current_year: int = Field(default=1, ge=1, le=4)
    section: str | None = Field(default=None, max_length=5)
    phone: str | None = Field(default=None, pattern=r"^\+?[0-9 \-]{7,15}$")
    guardian_name: str | None = Field(default=None, max_length=120)


class RejectIn(BaseModel):
    reason: str | None = Field(default=None, max_length=255)


class FeedbackIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr | None = None
    rating: int = Field(ge=1, le=5)
    message: str = Field(min_length=5, max_length=1000)


class EnquiryIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(pattern=r"^\+?[0-9 \-]{7,15}$")
    department_id: int | None = None
    message: str | None = Field(default=None, max_length=1000)    

