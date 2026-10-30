import { useState } from "react";
import api, { errorText } from "../../api/client";
import useFetch from "../../hooks/fetch";
import Msg from "../../components/Message";

export default function EnterMarks() {
  const subjects = useFetch("/staff/subjects");
  const [subjectId, setSubjectId] = useState("");
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState("2024-2025");
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [saved, setSaved] = useState({});
  const [msg, setMsg] = useState(null);

  const pickSubject = (id) => {
    setSubjectId(id);
    setStudents([]);
    const s = subjects.data?.find((x) => String(x.id) === id);
    if (s) setSemester(String(s.semester));
  };

  const load = async () => {
    setMsg(null);
    setSaved({});
    try {
      const { data } = await api.get("/staff/students", { params: { subject_id: subjectId } });
      setStudents(data);
      setMarks(Object.fromEntries(data.map((s) => [s.id, { internal: "", external: "" }])));
    } catch (err) {
      setMsg({ ok: false, text: errorText(err) });
    }
  };

  const setMark = (id, field, value) =>
    setMarks((m) => ({ ...m, [id]: { ...m[id], [field]: value } }));

  const saveRow = async (id) => {
    setMsg(null);
    try {
      const { data } = await api.post("/staff/results", {
        student_id: id,
        subject_id: Number(subjectId),
        semester: Number(semester),
        academic_year: year,
        internal: Number(marks[id].internal || 0),
        external: Number(marks[id].external || 0),
      });
      setSaved((s) => ({ ...s, [id]: data }));
    } catch (err) {
      setMsg({ ok: false, text: errorText(err) });
    }
  };

  return (
    <>
      <h2>Enter Marks</h2>
      <p className="muted">Internal is out of 40, external out of 60. Results stay hidden from students until faculty publishes them.</p>
      <div className="card row">
        <select value={subjectId} onChange={(e) => pickSubject(e.target.value)}>
          <option value="">Select subject</option>
          {subjects.data?.map((s) => (
            <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
          ))}
        </select>
        <input type="number" min="1" max="8" placeholder="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} />
        <input placeholder="Academic year" value={year} onChange={(e) => setYear(e.target.value)} />
        <button className="btn" onClick={load} disabled={!subjectId || !semester}>Load students</button>
      </div>

      {students.length > 0 && (
        <div className="card">
          <table>
            <thead>
              <tr><th>Roll No</th><th>Name</th><th>Internal /40</th><th>External /60</th><th></th><th>Saved</th></tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.roll_no}</td>
                  <td>{s.name}</td>
                  <td>
                    <input type="number" min="0" max="40" value={marks[s.id]?.internal ?? ""} onChange={(e) => setMark(s.id, "internal", e.target.value)} />
                  </td>
                  <td>
                    <input type="number" min="0" max="60" value={marks[s.id]?.external ?? ""} onChange={(e) => setMark(s.id, "external", e.target.value)} />
                  </td>
                  <td><button className="btn small" onClick={() => saveRow(s.id)}>Save</button></td>
                  <td>{saved[s.id] ? `${saved[s.id].total} (${saved[s.id].grade})` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Msg msg={msg} />
    </>
  );
}