import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import useFetch from "../hooks/fetch";
import { dayMonth, fmtDate } from "../utils";

export default function Activities() {
  const [params, setParams] = useSearchParams();
  const dept = params.get("dept") || "";
  const [cat, setCat] = useState("");
  const depts = useFetch("/public/departments");
  const list = useFetch("/public/activities", dept ? { department_id: dept } : {});

  const codeOf = (id) => depts.data?.find((d) => d.id === id)?.code;
  const cats = [...new Set((list.data || []).map((a) => a.category))].sort();
  const shown = (list.data || []).filter((a) => !cat || a.category === cat);

  return (
    <>
      <PageBanner title="Activities and events" subtitle="Workshops, hackathons, guest lectures and more. Open to everyone." />

      <div className="card filters">
        <label>Department
          <select value={dept} onChange={(e) => { setCat(""); e.target.value ? setParams({ dept: e.target.value }) : setParams({}); }}>
            <option value="">All departments</option>
            {depts.data?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>
      </div>
      <div className="chips">
        <button className={`chip ${cat === "" ? "on" : ""}`} onClick={() => setCat("")}>All</button>
        {cats.map((c) => (
          <button key={c} className={`chip ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {list.error && <p className="error">{list.error}</p>}
      <div className="card bulletin">
        {shown.map((a) => {
          const [d, m] = dayMonth(a.event_date);
          return (
            <div className="bulletin-item" key={a.id}>
              <div className="bulletin-date"><strong>{d}</strong><span>{m}</span></div>
              <div>
                <h3>{a.title}</h3>
                <p>
                  <span className="badge">{a.category}</span>
                  {codeOf(a.department_id) && <span className="badge gold">{codeOf(a.department_id)}</span>}
                  <span className="muted small-text">{a.venue} | {fmtDate(a.event_date)}</span>
                </p>
                {a.description && <p className="muted">{a.description}</p>}
              </div>
            </div>
          );
        })}
        {list.data && shown.length === 0 && <p className="muted">No activities found.</p>}
      </div>
    </>
  );
}