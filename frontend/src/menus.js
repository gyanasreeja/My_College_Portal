// Pages anyone can open. "locked" ones ask visitors to log in first.
export const SITE_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/departments", label: "Departments" },
  { to: "/activities", label: "Activities" },
  { to: "/achievements", label: "Achievements" },
  { to: "/placements", label: "Placements", locked: true },
  { to: "/training", label: "Training", locked: true },
  { to: "/labs", label: "Labs", locked: true },
  { to: "/admission", label: "Admissions" },
  { to: "/contact", label: "Contact" },
];

// Extra items for visitors who have not logged in yet
export const GUEST_LINKS = [
  { to: "/student/results", label: "Results", locked: true },
  { to: "/student/attendance", label: "Attendance", locked: true },
];

// Tools shown after login, per role
export const PORTAL_LINKS = {
  student: [
    ["/student", "Dashboard"],
    ["/student/results", "My Results"],
    ["/student/attendance", "My Attendance"],
    ["/student/advice", "AI Study Advice"],
  ],
  teacher: [
    ["/staff/students", "Students"],
    ["/staff/attendance", "Attendance"],
    ["/staff/marks", "Enter Marks"],
  ],
  faculty: [
    ["/staff/students", "Students"],
    ["/staff/attendance", "Attendance"],
    ["/staff/marks", "Enter Marks"],
    ["/staff/publish", "Publish"],
    ["/staff/registrations", "Approvals"],
    ["/staff/content", "Content"],
  ],
  admin: [
    ["/admin", "Dashboard"],
    ["/staff/registrations", "Approvals"],
    ["/admin/directory", "Directory"],
    ["/admin/inbox", "Inbox"],
    ["/admin/setup", "Setup"],
    ["/admin/staff", "Staff"],
    ["/staff/students", "Students"],
    ["/staff/attendance", "Attendance"],
    ["/staff/marks", "Marks"],
    ["/staff/publish", "Publish"],
    ["/staff/content", "Content"],
  ],
};