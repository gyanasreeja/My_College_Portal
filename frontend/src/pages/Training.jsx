import { useState } from "react";
import PageBanner from "../components/PageBanner";
import useFetch from "../hooks/fetch";
import { fmtDate, todayIso } from "../utils";

function phase(t) {
  const today = todayIso();
  if (t.start_date > today) return "upcoming";
  if ((t.end_date || t.start_date) < today) return "completed";
  return "ongoing";
}

export default function Training() {
  const { data, error } = useFetch("/campus/training");
  const [tab, setTab] = useState("all");
  const shown = (data || []).filter((t) => tab === "all" || phase(t) === tab);

  return (
    <>
      <PageBanner title="Training" subtitle="Aptitude, coding and interview preparation. Login required." />
      <div className="tabs">
        {[["all", "All"], ["ongoing", "Ongoing"], ["upcoming", "Upcoming"], ["completed", "Completed"]].map(([k, label]) => (
          <button key={k} className={`tab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <div className="grid">
        {shown.map((t) => (
          <div className="card" key={t.id}>
            <span className={`badge ${phase(t) === "completed" ? "" : "gold"}`}>{phase(t)}</span>
            <span className="badge">{t.mode}</span>
            <h3 style={{ marginTop: 8 }}>{t.title}</h3>
            {t.description && <p className="muted">{t.description}</p>}
            <p className="small-text">
              <strong>{fmtDate(t.start_date)}</strong>{t.end_date && ` to ${fmtDate(t.end_date)}`}
              {t.timing && <><br />{t.timing}</>}
              {t.venue && <><br />Venue: {t.venue}</>}
              {t.trainer && <><br />Trainer: {t.trainer}</>}
              <br />Open to: {t.department}
            </p>
          </div>
        ))}
      </div>
      {data && shown.length === 0 && <p className="muted">No sessions in this list.</p>}
    </>
  );
}