import { useState } from "react";
import useFetch from "../../hooks/fetch";
import PostForm, { toOptions } from "../../components/postform";

export default function Students() {
  const [reload, setReload] = useState(0);
  const [dept, setDept] = useState("");
  const [batch, setBatch] = useState("");

  const depts = useFetch("/public/departments");
  const batches = useFetch("/public/batches");

  const params = {};
  if (dept) params.department_id = dept;
  if (batch) params.batch_id = batch;
  const list = useFetch("/admin/students", params, reload);

  const deptName = (id) => depts.data?.find((d) => d.id === id)?.code || id;
  const batchName = (id) => batches.data?.find((b) => b.id === id)?.name || id;

  return (
    <>
      <h2>Students</h2>

      <PostForm
        title="Add student (creates their login too)"
        path="/admin/students"
        onDone={() => setReload((n) => n + 1)}
        initial={{ current_year: 1 }}
        fields={[
          { name: "name", label: "Full name", required: true },
          { name: "roll_no", label: "Roll number", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "password", label: "Temporary password (min 8)", type: "password", required: true },
          { name: "department_id", label: "Department", type: "select", number: true, required: true, options: toOptions(depts.data, (d) => d.name) },
          { name: "batch_id", label: "Batch", type: "select", number: true, required: true, options: toOptions(batches.data, (b) => b.name) },
          { name: "current_year", label: "Year (1-4)", type: "number" },
          { name: "section", label: "Section" },
          { name: "phone", label: "Phone" },
          { name: "guardian_name", label: "Guardian name" },
        ]}
      />

      <div className="card row">
        <select value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="">All departments</option>
          {depts.data?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={batch} onChange={(e) => setBatch(e.target.value)}>
          <option value="">All batches</option>
          {batches.data?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {list.error && <p className="error">{list.error}</p>}
      <div className="card">
        <table>
          <thead><tr><th>Roll No</th><th>Name</th><th>Dept</th><th>Batch</th><th>Year</th></tr></thead>
          <tbody>
            {list.data?.map((s) => (
              <tr key={s.id}>
                <td>{s.roll_no}</td>
                <td>{s.name}</td>
                <td>{deptName(s.department_id)}</td>
                <td>{batchName(s.batch_id)}</td>
                <td>{s.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.data?.length === 0 && <p className="muted">No students found.</p>}
      </div>
    </>
  );
}