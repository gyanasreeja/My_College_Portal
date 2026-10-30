import { useState } from "react";
import PageBanner from "../components/PageBanner";
import useFetch from "../hooks/fetch";

export default function Labs() {
  const { data, error } = useFetch("/campus/labs");
  const [dept, setDept] = useState("");
  const codes = [...new Set((data || []).map((l) => l.dept_code))].sort();
  const shown = (data || []).filter((l) => !dept || l.dept_code === dept);

  return (
    <>
      <PageBanner title="Labs" subtitle="Timings, locations and equipment. Login required." />
      <div className="chips">
        <button className={`chip ${dept === "" ? "on" : ""}`} onClick={() => setDept("")}>All</button>
        {codes.map((c) => (
          <button key={c} className={`chip ${dept === c ? "on" : ""}`} onClick={() => setDept(c)}>{c}</button>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <div className="grid">
        {shown.map((l) => (
          <div className="card" key={l.id}>
            <span className="badge">{l.dept_code}</span>
            <h3 style={{ marginTop: 8 }}>{l.name}</h3>
            <p className="small-text">
              {l.location && <>Location: {l.location}<br /></>}
              {l.timings && <>Timings: {l.timings}<br /></>}
              {l.incharge && <>In-charge: {l.incharge}</>}
            </p>
            {l.equipment && <p className="muted">{l.equipment}</p>}
          </div>
        ))}
      </div>
      {data && shown.length === 0 && <p className="muted">No labs to show.</p>}
    </>
  );
}