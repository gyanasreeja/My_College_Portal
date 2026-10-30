import { useState } from "react";
import PageBanner from "../components/PageBanner";
import useFetch from "../hooks/fetch";
import { fmtDate } from "../utils";

export default function Achievements() {
  const { data, error } = useFetch("/public/achievements");
  const [cat, setCat] = useState("");
  const cats = [...new Set((data || []).map((a) => a.category))].sort();
  const shown = (data || []).filter((a) => !cat || a.category === cat);

  return (
    <>
      <PageBanner title="Student achievements" subtitle="Proud moments from our students. Open to everyone." />
      <div className="chips">
        <button className={`chip ${cat === "" ? "on" : ""}`} onClick={() => setCat("")}>All</button>
        {cats.map((c) => (
          <button key={c} className={`chip ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <div className="grid">
        {shown.map((a) => (
          <div className="card" key={a.id}>
            <span className="badge">{a.category}</span>
            <h3>{a.title}</h3>
            <p className="muted">{a.student_name} | {fmtDate(a.date)}</p>
          </div>
        ))}
      </div>
      {data && shown.length === 0 && <p className="muted">No achievements to show.</p>}
    </>
  );
}