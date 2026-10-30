import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Departments from "./pages/Departments";
import Activities from "./pages/Activities";
import Achievements from "./pages/Achievements";
import Contact from "./pages/Contact";
import Placements from "./pages/Placements";
import Training from "./pages/Training";
import Labs from "./pages/Labs";
import Content from "./pages/staff/Content";
import Register from "./pages/Register";
import Admission from "./pages/Admission";
import Feedback from "./pages/Feedback";
import NotFound from "./pages/NotFound";
import Registrations from "./pages/staff/Registrations";
import Inbox from "./pages/admin/Inbox";
import Directory from "./pages/admin/Directory";
import BackToTop from "./components/BackToTop";
import Login from "./pages/Login";
import StudentDashboard from "./pages/student/Dashboard";
import Results from "./pages/student/Results";
import Attendance from "./pages/student/Attendance";
import AiAdvice from "./pages/student/AiAdvice";
import MarkAttendance from "./pages/staff/MarkAttendance";
import EnterMarks from "./pages/staff/EnterMarks";
import Publish from "./pages/staff/Publish";
import StaffStudents from "./pages/staff/Students";
import Footer from "./components/Footer";
import AdminDashboard from "./pages/admin/Dashboard";
import Setup from "./pages/admin/setup";
import Students from "./pages/admin/Students";
import Staff from "./pages/admin/Staff";
const STUDENT = ["student"];
const STAFF = ["teacher", "faculty", "admin"];
const HEADS = ["faculty", "admin"];
const ADMIN = ["admin"];
const ANY_LOGIN = ["student", "teacher", "faculty", "admin"];

const guard = (roles, page) => <ProtectedRoute roles={roles}>{page}</ProtectedRoute>;

export default function App() {
  const { pathname } = useLocation();
  return (
    <>
      <Navbar />
      <main className={pathname === "/" ? "home-main" : "container"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admission" element={<Admission />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/about" element={<About />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/placements" element={guard(ANY_LOGIN, <Placements />)} />
          <Route path="/training" element={guard(ANY_LOGIN, <Training />)} />
          <Route path="/labs" element={guard(ANY_LOGIN, <Labs />)} />

          <Route path="/student" element={guard(STUDENT, <StudentDashboard />)} />
          <Route path="/student/results" element={guard(STUDENT, <Results />)} />
          <Route path="/student/attendance" element={guard(STUDENT, <Attendance />)} />
          <Route path="/student/advice" element={guard(STUDENT, <AiAdvice />)} />

          <Route path="/staff/students" element={guard(STAFF, <StaffStudents />)} />
          <Route path="/staff/attendance" element={guard(STAFF, <MarkAttendance />)} />
          <Route path="/staff/marks" element={guard(STAFF, <EnterMarks />)} />
          <Route path="/staff/publish" element={guard(HEADS, <Publish />)} />
          <Route path="/staff/content" element={guard(HEADS, <Content />)} />
          <Route path="/staff/registrations" element={guard(HEADS, <Registrations />)} />

          <Route path="/admin" element={guard(ADMIN, <AdminDashboard />)} />
          <Route path="/admin/setup" element={guard(ADMIN, <Setup />)} />
          <Route path="/admin/students" element={guard(ADMIN, <Students />)} />
          <Route path="/admin/staff" element={guard(ADMIN, <Staff />)} />
          <Route path="/admin/inbox" element={guard(ADMIN, <Inbox />)} />
          <Route path="/admin/directory" element={guard(ADMIN, <Directory />)} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}