import { useState } from "react";
import api, { errorText } from "../../api/client";
import useFetch from "../../hooks/fetch";
import Msg from "../../components/Message";

export default function MarkAttendance() {
  const subjects = useFetch("/staff/subjects");
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [students, setStudents] = useState([]);
  const [present, setPresent] = useState({});
  const [msg, setMsg] = useState(null);

  const load = async () => {
    setMsg(null);
    try {
      const { data } = await api.get("/staff/students", { params: { subject_id: subjectId } });
      setStudents(data);
      setPresent(Object.fromEntries(data.map((s) => [s.id, true])));
    } catch (err) {
      setMsg({ ok: false, text: errorText(err) });
    }
  };

  const save = async () => {
    try {
      await api.post("/staff/attendance", {
        subject_id: Number(subjectId),
        date,
        records: students.map((s) => ({ student_id: s.id, present: !!present[s.id] })),
      });
      setMsg({ ok: true, text: `Attendance saved for ${students.length} students` });
    } catch (err) {
      setMsg({ ok: false, text: errorText(err) });
    }
  };

  return (
    <>
      <h2>Mark Attendance</h2>
      {subjects.error && <p className="error">{subjects.error}</p>}
      <div className="card row">
        <select value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setStudents([]); }}>
          <option value="">Select subject</option>
          {subjects.data?.map((s) => (
            <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
          ))}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button className="btn" onClick={load} disabled={!subjectId}>Load students</button>
      </div>

      {students.length > 0 && (
        <div className="card">
          <table>
            <thead><tr><th>Roll No</th><th>Name</th><th>Present</th></tr></thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.roll_no}</td>
                  <td>{s.name}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!present[s.id]}
                      onChange={(e) => setPresent((p) => ({ ...p, [s.id]: e.target.checked }))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn" onClick={save}>Save attendance</button>
        </div>
      )}
      <Msg msg={msg} />
    </>
  );
}