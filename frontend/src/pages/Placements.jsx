import { useState } from "react";
import PageBanner from "../components/PageBanner";
import college from "../config";
import useFetch from "../hooks/fetch";
import { fmtDate } from "../utils";

export default function Placements() {
  const { data, error } = useFetch("/campus/placements");
  const [tab, setTab] = useState("all");
  const drives = data || [];
  const upcoming = drives.filter((d) => d.status === "upcoming").length;
  const best = Math.max(0, ...drives.map((d) => d.package_lpa || 0));
  const shown = drives.filter((d) => tab === "all" || d.status === tab);

  return (
    <>
      <PageBanner title="Placements" subtitle="Campus drives, packages and eligibility. Login required." />
      {error && <p className="error">{error}</p>}

      <div className="facts">
        <div className="card fact"><div className="num">{drives.length}</div><div className="muted">Drives listed</div></div>
        <div className="card fact"><div className="num">{upcoming}</div><div className="muted">Upcoming</div></div>
        <div className="card fact"><div className="num">{best ? `${best} LPA` : "-"}</div><div className="muted">Highest package listed</div></div>
      </div>

      <div className="tabs">
        {[["all", "All drives"], ["upcoming", "Upcoming"], ["completed", "Completed"]].map(([k, label]) => (
          <button key={k} className={`tab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Company</th><th>Role</th><th>Package</th><th>Drive date</th><th>Apply by</th><th>For</th><th>Eligibility</th><th>Status</th></tr>
          </thead>
          <tbody>
            {shown.map((d) => (
              <tr key={d.id}>
                <td><strong>{d.company}</strong></td>
                <td>{d.role}</td>
                <td>{d.package_lpa ? `${d.package_lpa} LPA` : "-"}</td>
                <td>{fmtDate(d.drive_date)}</td>
                <td>{d.last_date ? fmtDate(d.last_date) : "-"}</td>
                <td>{d.department}</td>
                <td>{d.eligibility || "-"}</td>
                <td><span className={`badge ${d.status === "upcoming" ? "gold" : ""}`}>{d.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && shown.length === 0 && <p className="muted">No drives in this list.</p>}
      </div>

      <h2 className="section-title">Our recruiters</h2>
      <div className="chips">
        {college.recruiters.map((r) => <span className="chip" key={r}>{r}</span>)}
      </div>
    </>
  );
}