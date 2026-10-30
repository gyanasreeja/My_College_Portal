import { useState } from "react";
import useFetch from "../hooks/fetch";

export default function Departments() {
  const [reload, setReload] = useState(0);
  const depts = useFetch("/public/departments", {}, reload);

  if (depts.error) return <p className="error">{depts.error}</p>;
  if (!depts.data) return <p className="muted">Loading...</p>;

  return (
    <>
      <h2>Departments</h2>
      <p className="muted">All departments in the institution.</p>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Code</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {depts.data.map((d, i) => (
              <tr key={d.id}>
                <td>{i + 1}</td>
                <td>{d.code}</td>
                <td>{d.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {depts.data.length === 0 && <p className="muted">No departments found.</p>}
        <p className="muted small-text">{depts.data.length} department(s)</p>
        <button className="btn" onClick={() => setReload((n) => n + 1)}>Refresh</button>
      </div>
    </>
  );
}