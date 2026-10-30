import { useState } from "react";
import useFetch from "../../hooks/fetch";
import { fmtStamp } from "../../utils";

// Students grouped by department and year, teachers grouped by department.
export default function Directory() {
  const [dept, setDept] = useState("");
  const [year, setYear] = useState("");
  const summary = useFetch("/admin/directory/summary");
  const sp = {};
  if (dept) sp.department_id = dept;
  if (year) sp.year = year;
  const students = useFetch("/admin/directory/students", sp);
  const teachers = useFetch("/admin/directory/teachers", dept ? { department_id: dept } : {});

  const pick = (id, y = "") => {
    setDept(String(id));
    setYear(String(y));
  };

  return (
    <>
      <h2>Directory</h2>
      <p className="muted">Student numbers by department and year. Click a number to list those students.</p>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Department</th><th>Year 1</th><th>Year 2</th><th>Year 3</th><th>Year 4</th><th>Students</th><th>Teachers</th></tr>
          </thead>
          <tbody>
            {summary.data?.map((r) => (
              <tr key={r.department_id}>
                <td><strong>{r.code}</strong> <span className="muted small-text">{r.department}</span></td>
                {["1", "2", "3", "4"].map((y) => (
                  <td key={y}>
                    {r.students_by_year[y]
                      ? <button className="link-num" onClick={() => pick(r.department_id, y)}>{r.students_by_year[y]}</button>
                      : <span className="muted">0</span>}
                  </td>
                ))}
                <td><button className="link-num" onClick={() => pick(r.department_id)}>{r.students}</button></td>
                <td>{r.teachers}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {summary.error && <p className="error">{summary.error}</p>}
      </div>

      <div className="card filters">
        <label>Department
          <select value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">All</option>
            {summary.data?.map((r) => <option key={r.department_id} value={r.department_id}>{r.code}</option>)}
          </select>
        </label>
        <label>Year
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">All</option>
            {[1, 2, 3, 4].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <button className="btn small ghost" onClick={() => pick("", "")}>Clear</button>
      </div>

      <h3>Students ({students.data?.length ?? 0})</h3>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Roll No</th><th>Name</th><th>Dept</th><th>Year</th><th>Section</th><th>Email</th><th>Registered</th></tr></thead>
          <tbody>
            {students.data?.map((s) => (
              <tr key={s.id}>
                <td>{s.roll_no}</td><td>{s.name}</td><td>{s.department}</td><td>{s.year}</td>
                <td>{s.section || "-"}</td><td>{s.email}</td><td>{fmtStamp(s.registered_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.data?.length === 0 && <p className="muted">No students match.</p>}
      </div>

      <h3>Teachers and faculty ({teachers.data?.length ?? 0})</h3>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Role</th><th>Dept</th><th>Email</th><th>Registered</th></tr></thead>
          <tbody>
            {teachers.data?.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td><td><span className="badge">{t.role}</span></td><td>{t.department}</td>
                <td>{t.email}</td><td>{fmtStamp(t.registered_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {teachers.data?.length === 0 && <p className="muted">No teachers match.</p>}
      </div>
    </>
  );
}