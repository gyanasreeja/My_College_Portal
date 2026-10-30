import { useState } from "react";
import api, { errorText } from "../../api/client";
import Msg from "../../components/Message";
import useFetch from "../../hooks/fetch";
import { fmtStamp } from "../../utils";

// Messages from the public Admission and Feedback forms.
export default function Inbox() {
  const [tab, setTab] = useState("enquiries");
  const [reload, setReload] = useState(0);
  const [msg, setMsg] = useState(null);
  const enquiries = useFetch("/admin/enquiries", {}, reload);
  const feedback = useFetch("/admin/feedback", {}, reload);

  const handled = async (id) => {
    try {
      await api.post(`/admin/enquiries/${id}/handled`);
      setReload((n) => n + 1);
    } catch (err) {
      setMsg({ ok: false, text: errorText(err) });
    }
  };

  const newCount = enquiries.data?.filter((e) => e.status === "new").length ?? 0;
  const avg = feedback.data?.length
    ? (feedback.data.reduce((s, f) => s + f.rating, 0) / feedback.data.length).toFixed(1)
    : "-";

  return (
    <>
      <h2>Inbox</h2>
      <div className="tabs">
        <button className={`tab ${tab === "enquiries" ? "on" : ""}`} onClick={() => setTab("enquiries")}>
          Admission enquiries {newCount > 0 && `(${newCount} new)`}
        </button>
        <button className={`tab ${tab === "feedback" ? "on" : ""}`} onClick={() => setTab("feedback")}>
          Feedback (average {avg})
        </button>
      </div>
      <Msg msg={msg} />

      {tab === "enquiries" && (
        <div className="card table-wrap">
          {enquiries.error && <p className="error">{enquiries.error}</p>}
          <table>
            <thead><tr><th>Received</th><th>Name</th><th>Phone</th><th>Email</th><th>Interested in</th><th>Question</th><th>Status</th></tr></thead>
            <tbody>
              {enquiries.data?.map((e) => (
                <tr key={e.id}>
                  <td>{fmtStamp(e.created_at)}</td><td>{e.name}</td><td>{e.phone}</td><td>{e.email}</td>
                  <td>{e.department}</td><td>{e.message || "-"}</td>
                  <td>{e.status === "new"
                    ? <button className="btn small" onClick={() => handled(e.id)}>Mark handled</button>
                    : <span className="badge">handled</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {enquiries.data?.length === 0 && <p className="muted">No enquiries yet.</p>}
        </div>
      )}

      {tab === "feedback" && (
        <div className="card table-wrap">
          {feedback.error && <p className="error">{feedback.error}</p>}
          <table>
            <thead><tr><th>Received</th><th>Name</th><th>Rating</th><th>Feedback</th><th>Email</th></tr></thead>
            <tbody>
              {feedback.data?.map((f) => (
                <tr key={f.id}>
                  <td>{fmtStamp(f.created_at)}</td><td>{f.name}</td>
                  <td><span className="badge gold">{f.rating} / 5</span></td>
                  <td>{f.message}</td><td>{f.email || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {feedback.data?.length === 0 && <p className="muted">No feedback yet.</p>}
        </div>
      )}
    </>
  );
}