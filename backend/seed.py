"""Demo data and logins.

  python seed.py            first time (does nothing if data already exists)
  python seed.py --reset    wipes ALL tables and loads the demo data again
"""
import sys
from datetime import date, timedelta

from app.database import Base, SessionLocal, engine
from app.grading import grade_for
from app.models import (Achievement, Activity, AdmissionEnquiry, Announcement, Attendance, Batch,
                        CollegeInfo, Department, Feedback, Lab, PlacementDrive, Registration, Result,
                        Role, Student, Subject, Teacher, TeacherSubject, TrainingSession, User)
from app.security import hash_password

if "--reset" in sys.argv:
    Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
db = SessionLocal()

if db.query(User).first():
    print("Database already has data. Run  python seed.py --reset  to start fresh.")
    raise SystemExit

PW = "Password@123"
PW_HASH = hash_password(PW)  # same demo password for everyone, hashed once


def user(email, role):
    u = User(email=email, hashed_password=PW_HASH, role=role)
    db.add(u)
    db.flush()
    return u


admin = user("admin@college.edu", Role.admin)

# ---- departments and batches ----
DEPARTMENTS = [
    ("Chemical Engineering", "CHEM"),
    ("Civil Engineering", "CIVIL"),
    ("Computer Science and Engineering", "CSE"),
    ("Computer Science and Engineering (AI&ML)", "CSM"),
    ("Computer Science and Engineering (DS)", "CSD"),
    ("Electrical & Electronics Engineering", "EEE"),
    ("Electronics & Communication Engineering", "ECE"),
    ("Information Technology", "IT"),
    ("Mechanical Engineering", "MECH"),
    ("Management Studies", "MBA"),
    ("Basic Sciences & Humanities", "BSH"),
]
depts, batches = {}, {}
for name, code in DEPARTMENTS:
    d = Department(name=name, code=code, description=f"Department of {name}")
    db.add(d)
    db.flush()
    depts[code] = d
    for b in ("2022-2026", "2023-2027"):
        batch = Batch(name=b, department_id=d.id)
        db.add(batch)
        db.flush()
        batches[(code, b)] = batch

# ---- subjects ----
def subjects_for(code, rows):
    out = []
    for c, n, cr in rows:
        s = Subject(code=c, name=n, department_id=depts[code].id, semester=3, credits=cr)
        db.add(s)
        out.append(s)
    db.flush()
    return out


it_subjects = subjects_for("IT", [("IT301", "Data Structures", 4), ("IT302", "DBMS", 3),
                                  ("IT303", "Operating Systems", 3)])
cse_subjects = subjects_for("CSE", [("CSE301", "Discrete Mathematics", 3), ("CSE302", "Computer Organization", 3)])

# ---- staff ----
faculty = Teacher(user_id=user("faculty@college.edu", Role.faculty).id, name="Dr. Rao",
                  department_id=depts["IT"].id)
teacher = Teacher(user_id=user("teacher@college.edu", Role.teacher).id, name="Ms. Priya",
                  department_id=depts["IT"].id)
db.add_all([faculty, teacher])
db.flush()
# the demo teacher works in IT and also teaches one CSE subject
for s in (it_subjects[0], it_subjects[1], cse_subjects[0]):
    db.add(TeacherSubject(teacher_id=teacher.id, subject_id=s.id))

# ---- students: different departments, years and sections ----
def student(email, roll, name, dept, batch, year, section):
    s = Student(user_id=user(email, Role.student).id, roll_no=roll, name=name,
                department_id=depts[dept].id, batch_id=batches[(dept, batch)].id,
                current_year=year, section=section)
    db.add(s)
    db.flush()
    return s


demo = student("student@college.edu", "22IT001", "Demo Student", "IT", "2022-2026", 3, "A")
roster = [
    ("22IT002", "Anitha K", "IT", "2022-2026", 3, "A"),
    ("22IT003", "Ravi Teja", "IT", "2022-2026", 3, "A"),
    ("22IT004", "Sneha P", "IT", "2022-2026", 3, "B"),
    ("22IT005", "Kiran M", "IT", "2022-2026", 3, "B"),
    ("23IT001", "Divya S", "IT", "2023-2027", 2, "A"),
    ("23IT002", "Harsha V", "IT", "2023-2027", 2, "A"),
    ("22CSE001", "Meghana R", "CSE", "2022-2026", 3, "A"),
    ("22CSE002", "Vamsi D", "CSE", "2022-2026", 3, "A"),
    ("22CSE003", "Lakshmi N", "CSE", "2022-2026", 3, "B"),
]
others = [student(f"{r[0].lower()}@college.edu", *r) for r in roster]

# ---- marks and attendance for the demo student (published) ----
marks = {"IT301": (30, 52), "IT302": (18, 20), "IT303": (25, 40)}
for s in it_subjects:
    i, e = marks[s.code]
    db.add(Result(student_id=demo.id, subject_id=s.id, semester=3, academic_year="2024-2025",
                  internal=i, external=e, total=i + e, grade=grade_for(i + e), published=True))
    for d in range(10):
        db.add(Attendance(student_id=demo.id, subject_id=s.id, date=date.today() - timedelta(days=d),
                          present=(d % 4 != 0) if s.code == "IT302" else True))

# ---- public content ----
db.add(Achievement(student_id=demo.id, title="Won college hackathon", category="technical"))
db.add(Achievement(student_id=others[0].id, title="First prize in paper presentation", category="academic"))
db.add(Achievement(student_id=others[6].id, title="Inter-college chess runner-up", category="sports"))
for title, body in [
    ("Semester exams timetable", "The exam timetable is available on the notice board and will be shared here."),
    ("Hackathon for third-year students", "A 6-hour department hackathon is open to all third-year students."),
    ("Guest lecture: academia and industry", "A guest lecture on careers and industry skills for final-year students."),
]:
    db.add(Announcement(title=title, body=body, created_by=admin.id))

for t, c in [
    ("About", "ANITS is located at Sangivalasa, Bheemunipatnam Mandal, Visakhapatnam, Andhra Pradesh. "
              "It is NAAC A+ accredited, UGC autonomous and recognised by AICTE and Andhra University."),
    ("Departments", "Chemical, Civil, Computer Science and Engineering, CSE (AI&ML), CSE (DS), "
                    "Electrical & Electronics, Electronics & Communication, Information Technology, "
                    "Mechanical, Management Studies, and Basic Sciences & Humanities."),
    ("Placements", "Recruiters include Capgemini, Tech Mahindra, Verizon, Comtec, Amazon, IBM, Deloitte and Infosys."),
    ("Contact", "For phone numbers and email, please check the official college website or visit the college office."),
]:
    db.add(CollegeInfo(topic=t, content=c))

# ---- activities (public) ----
D = lambda code: depts[code].id
for title, cat, code, when, venue, text in [
    ("Hack Arena 2K26", "Hackathon", "CSD", date(2026, 7, 11), "CSD Block", "A 6-hour hackathon for third-year students."),
    ("FDP on Resilient Energy Ecosystems", "FDP", "EEE", date(2026, 7, 27), "Online", "Five-day faculty development programme."),
    ("International Conference on Intelligent Manufacturing", "Conference", "MECH", date(2026, 9, 5), "Seminar Hall", "Hybrid conference on manufacturing and energy sustainability."),
    ("Educate the Educator on Gen AI and Agentic AI", "FDP", "IT", date(2025, 12, 27), "IT Block", "Practical use of agentic AI in teaching and research."),
    ("Bridging Academia and Industry", "Guest Lecture", "IT", date(2025, 10, 10), "Auditorium", "Career guidance from industry speakers."),
    ("Hands-on workshop on Agentic AI", "Workshop", "IT", date(2025, 9, 11), "Computer Lab 2", "Building automation workflows with AI agents."),
    ("Technova 2025 coding quest", "Hackathon", "CSD", date(2025, 9, 19), "CSD Block", "National level 12-hour hackathon and coding quest."),
    ("World Earth Day poster presentation", "Awareness", "BSH", date(2026, 4, 22), "Physics Block", "Poster and elocution competition on the Earth Day theme."),
]:
    db.add(Activity(title=title, category=cat, department_id=D(code), event_date=when, venue=venue, description=text))

# ---- placements, training, labs (login required) ----
today = date.today()
for company, role_, lpa, days, code, text in [
    ("Capgemini", "Software Engineer", 6.0, 12, None, "Open to all branches. Online test followed by interviews."),
    ("Infosys", "Systems Engineer", 5.0, 25, None, "Aptitude test and technical interview."),
    ("Amazon", "SDE Intern", 8.0, 40, "IT", "Coding round and two technical interviews."),
    ("Tech Mahindra", "Associate Engineer", 5.5, -20, "CSE", "Drive completed. Results announced."),
]:
    db.add(PlacementDrive(company=company, role=role_, package_lpa=lpa, drive_date=today + timedelta(days=days),
                          last_date=today + timedelta(days=days - 3), department_id=D(code) if code else None,
                          eligibility="60% or above, no active backlogs", details=text))

for title, trainer, start, end, timing, mode, venue, code, text in [
    ("Python and SQL bootcamp", "Training cell", 5, 15, "4:00 PM - 6:00 PM", "Offline", "Computer Lab 1", "IT", "Hands-on Python, SQL and problem solving."),
    ("Aptitude and reasoning", "External trainer", 8, 30, "9:30 AM - 11:00 AM", "Offline", "Seminar Hall", None, "Quantitative aptitude and logical reasoning for placements."),
    ("Soft skills and interview prep", "Training cell", 15, 25, "2:00 PM - 4:00 PM", "Online", "Online", None, "Communication, group discussion and mock interviews."),
]:
    db.add(TrainingSession(title=title, trainer=trainer, start_date=today + timedelta(days=start),
                           end_date=today + timedelta(days=end), timing=timing, mode=mode, venue=venue,
                           department_id=D(code) if code else None, description=text))

for name, code, loc, incharge, timing, eq in [
    ("Programming Lab", "IT", "IT Block, Room 201", "Ms. Priya", "9:00 AM - 4:30 PM", "60 desktop PCs, Python, Java and C compilers"),
    ("Database Lab", "IT", "IT Block, Room 203", "Dr. Rao", "9:00 AM - 4:30 PM", "40 PCs with PostgreSQL and MySQL"),
    ("Networks Lab", "CSE", "CSE Block, Room 105", "Dept. staff", "9:00 AM - 4:30 PM", "Routers, switches and Packet Tracer"),
    ("Machine Learning Lab", "CSM", "CSM Block, Room 310", "Dept. staff", "9:00 AM - 4:30 PM", "GPU workstations with Python ML stack"),
    ("Embedded Systems Lab", "ECE", "ECE Block, Room 112", "Dept. staff", "9:00 AM - 4:30 PM", "Microcontroller kits and oscilloscopes"),
    ("CAD/CAM Lab", "MECH", "Mechanical Block, Room 20", "Dept. staff", "9:00 AM - 4:30 PM", "CAD workstations and a 3D printer"),
]:
    db.add(Lab(name=name, department_id=D(code), location=loc, incharge=incharge, timings=timing, equipment=eq))
# ---- a few waiting registrations, feedback and enquiries so the admin pages are not empty ----
db.add(Registration(role="student", name="Pavan Kumar", email="pavan@example.com", hashed_password=PW_HASH,
                    department_id=D("IT"), batch_id=batches[("IT", "2023-2027")].id, roll_no="23IT050",
                    current_year=2, section="B", phone="9876543210"))
db.add(Registration(role="teacher", name="Mr. Suresh", email="suresh@example.com", hashed_password=PW_HASH,
                    department_id=D("CSE")))
db.add(Feedback(name="A visitor", rating=5, message="The new website is easy to use and the results page is quick."))
db.add(AdmissionEnquiry(name="Rohit S", email="rohit@example.com", phone="9000000000", department_id=D("CSM"),
                        message="What is the admission process for B.Tech CSE (AI&ML)?"))    

db.commit()
print(f"Seeded. Password for all demo logins: {PW}")
print("  admin@college.edu | faculty@college.edu | teacher@college.edu | student@college.edu")