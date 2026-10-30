import { useState } from "react";
import api, { errorText } from "../../api/client";
import useFetch from "../../hooks/fetch";
import PostForm, { toOptions } from "../../components/postform";
import Msg from "../../components/Message";

// Add students (one or many) and browse student records.
// Teachers and faculty only ever see and manage their own department; the server enforces this too.
export default function StaffStudents() {
  const me = useFetch("/staff/me");
  const depts = useFetch("/public/departments");
  const batches = useFetch("/public/batches");
  const [tab, setTab] = useState("list");
  const [reload, setReload] = useState(0);

  if (me.error) return <p className="error">{me.error}</p>;
  if (!me.data || !depts.data || !batches.data) return <p className="muted">Loading...</p>;

  const isAdmin = me.data.role === "admin";
  const myDept = me.data.department_id;
  const allowedDepts = isAdmin ? depts.data : depts.data.filter((d) => d.id === myDept);
  const allowedBatches = batches.data.filter((b) => allowedDepts.some((d) => d.id === b.department_id));
  const deptCode = (id) => depts.data.find((d) => d.id === id)?.code || id;
  const batchLabel = (b) => `${deptCode(b.department_id)} ${b.name}`;
  const refresh = () => setReload((n) => n + 1);

  return (
    <>
      <h2>Student Records</h2>
      <p className="muted">
        {isAdmin ? "All departments." : `Department: ${allowedDepts[0]?.name || "-"}.`} New students get a
        login automatically (they sign in with the email and password you set).
      </p>

      <div className="tabs">
        {[["list", "Student list"], ["one", "Add one student"], ["bulk", "Add many (paste)"]].map(([k, label]) => (
          <button key={k} className={`tab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {tab === "list" && (
        <RosterList isAdmin={isAdmin} depts={allowedDepts} batches={allowedBatches}
                    deptCode={deptCode} batchLabel={batchLabel} reload={reload} />
      )}

      {tab === "one" && (
        <PostForm
          title="Add one student"
          path="/staff/students"
          onDone={refresh}
          initial={{ current_year: 1, department_id: allowedDepts.length === 1 ? allowedDepts[0].id : "" }}
          fields={[
            { name: "name", label: "Full name", required: true },
            { name: "roll_no", label: "Roll number", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "password", label: "Temporary password (min 8)", type: "password", required: true },
            { name: "department_id", label: "Department", type: "select", number: true, required: true, options: toOptions(allowedDepts, (d) => d.name) },
            { name: "batch_id", label: "Batch", type: "select", number: true, required: true, options: toOptions(allowedBatches, batchLabel) },
            { name: "current_year", label: "Year (1-4)", type: "number" },
            { name: "section", label: "Section (A, B, C...)" },
            { name: "phone", label: "Phone" },
            { name: "guardian_name", label: "Guardian name" },
          ]}
        />
      )}

      {tab === "bulk" && (
        <BulkAdd depts={allowedDepts} batches={allowedBatches} batchLabel={batchLabel} onDone={refresh} />
      )}
    </>
  );
}

function RosterList({ isAdmin, depts, batches, deptCode, batchLabel, reload }) {
  const [f, setF] = useState({ department_id: "", batch_id: "", year: "", section: "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const params = {};
  Object.entries(f).forEach(([k, v]) => { if (v !== "") params[k] = v; });
  const list = useFetch("/staff/roster", params, reload);
  const batchOptions = f.department_id ? batches.filter((b) => String(b.department_id) === f.department_id) : batches;

  return (
    <>
      <div className="card filters">
        {isAdmin && (
          <label>Department
            <select value={f.department_id} onChange={(e) => setF({ ...f, department_id: e.target.value, batch_id: "" })}>
              <option value="">All</option>
              {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </label>
        )}
        <label>Batch
          <select value={f.batch_id} onChange={(e) => set("batch_id", e.target.value)}>
            <option value="">All</option>
            {batchOptions.map((b) => <option key={b.id} value={b.id}>{batchLabel(b)}</option>)}
          </select>
        </label>
        <label>Year
          <select value={f.year} onChange={(e) => set("year", e.target.value)}>
            <option value="">All</option>
            {[1, 2, 3, 4].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label>Section
          <input style={{ width: 90 }} placeholder="All" value={f.section} onChange={(e) => set("section", e.target.value)} />
        </label>
      </div>

      {list.error && <p className="error">{list.error}</p>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Roll No</th><th>Name</th><th>Dept</th><th>Batch</th><th>Year</th><th>Section</th><th>Email</th></tr>
          </thead>
          <tbody>
            {list.data?.map((s) => (
              <tr key={s.id}>
                <td>{s.roll_no}</td>
                <td>{s.name}</td>
                <td>{deptCode(s.department_id)}</td>
                <td>{batches.find((b) => b.id === s.batch_id)?.name || s.batch_id}</td>
                <td>{s.year}</td>
                <td>{s.section || "-"}</td>
                <td>{s.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.data?.length === 0 && <p className="muted">No students match these filters.</p>}
        {list.data && <p className="muted small-text">{list.data.length} student(s)</p>}
      </div>
    </>
  );
}

function BulkAdd({ depts, batches, batchLabel, onDone }) {
  const [f, setF] = useState({
    department_id: depts.length === 1 ? String(depts[0].id) : "",
    batch_id: "", current_year: "1", section: "", default_password: "",
  });
  const [text, setText] = useState("");
  const [msg, setMsg] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  // each line: roll_no, name, email, section (section is optional). Commas or tabs (pasted from Excel) work.
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split(/[,\t]/).map((x) => x.trim()))
    .filter((p) => !/^roll/i.test(p[0])); // ignore a header line
  const isGood = (p) => p.length >= 3 && p[0] && p[1] && /^\S+@\S+\.\S+$/.test(p[2]);
  const rows = lines.filter(isGood).map(([roll_no, name, email, section]) => ({ roll_no, name, email, section: section || null }));
  const badLines = lines.filter((p) => !isGood(p)).map((p) => p[0] || "(blank)");

  const batchOptions = batches.filter((b) => String(b.department_id) === f.department_id);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setResult(null);
    if (badLines.length > 0) {
      return setMsg({ ok: false, text: `Fix these lines first (need roll_no, name and a valid email): ${badLines.join(", ")}` });
    }
    if (rows.length === 0) return setMsg({ ok: false, text: "Paste at least one line: roll_no, name, email" });
    setBusy(true);
    try {
      const { data } = await api.post("/staff/students/bulk", {
        department_id: Number(f.department_id),
        batch_id: Number(f.batch_id),
        current_year: Number(f.current_year),
        section: f.section || null,
        default_password: f.default_password,
        students: rows,
      });
      setResult(data);
      onDone();
    } catch (err) {
      setMsg({ ok: false, text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h3>Add many students at once</h3>
      <p className="muted small-text">
        Pick the group first (department, batch, year, section), then paste one student per line as:
        <br /><code>roll_no, name, email</code> or <code>roll_no, name, email, section</code>.
        A section on a line overrides the common section.
      </p>
      <div className="filters">
        <label>Department
          <select required value={f.department_id} onChange={(e) => setF({ ...f, department_id: e.target.value, batch_id: "" })}>
            <option value="">Select...</option>
            {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>
        <label>Batch
          <select required value={f.batch_id} onChange={(e) => set("batch_id", e.target.value)}>
            <option value="">Select...</option>
            {batchOptions.map((b) => <option key={b.id} value={b.id}>{batchLabel(b)}</option>)}
          </select>
        </label>
        <label>Year
          <select value={f.current_year} onChange={(e) => set("current_year", e.target.value)}>
            {[1, 2, 3, 4].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label>Common section
          <input style={{ width: 100 }} value={f.section} onChange={(e) => set("section", e.target.value)} />
        </label>
        <label>Default password (min 8)
          <input type="text" required minLength={8} value={f.default_password} onChange={(e) => set("default_password", e.target.value)} />
        </label>
      </div>

      <textarea rows={8} placeholder={"22IT101, Asha Rao, asha@example.com\n22IT102, Kiran Kumar, kiran@example.com, B"}
                value={text} onChange={(e) => setText(e.target.value)} />
      <div className="row">
        <button className="btn" disabled={busy}>{busy ? "Adding..." : `Add ${rows.length} student(s)`}</button>
      </div>
      <Msg msg={msg} />

      {result && (
        <div>
          <p className="success">Created {result.created} student(s).</p>
          {result.skipped.length > 0 && (
            <>
              <p className="error">Skipped {result.skipped.length}:</p>
              <ul>
                {result.skipped.map((s, i) => <li key={i}>{s.roll_no || "(blank)"}: {s.reason}</li>)}
              </ul>
            </>
          )}
        </div>
      )}
    </form>
  );
}