import { useState } from "react";
import api, { errorText } from "../../api/client";
import Msg from "../../components/Message";
import useFetch from "../../hooks/fetch";
import { useAuth } from "../../context/AuthContext";
import { fmtStamp } from "../../utils";

// Approve or reject people who registered themselves.
// Admin sees students and teachers. Faculty see students of their own department only.
export default function Registrations() {
  const { role } = useAuth();
  const [status, setStatus] = useState("pending");
  const [reload, setReload] = useState(0);
  const [msg, setMsg] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");
  const list = useFetch("/registrations", { status }, reload);

  const act = async (id, kind, body) => {
    setMsg(null);
    try {
      await api.post(`/registrations/${id}/${kind}`, body || {});
      setRejecting(null);
      setReason("");
      setReload((n) => n + 1);
      setMsg({ ok: true, text: kind === "approve" ? "Approved. The person can log in now." : "Rejected." });
    } catch (err) {
      setMsg({ ok: false, text: errorText(err) });
    }
  };

  return (
    <>
      <h2>Registrations</h2>
      <p className="muted">
        {role === "admin" ? "All students and teachers who registered." : "Students of your department who registered."}{" "}
        The registration date is kept as the account's start date.
      </p>
      <div className="tabs">
        {["pending", "approved", "rejected"].map((k) => (
          <button key={k} className={`tab ${status === k ? "on" : ""}`} onClick={() => setStatus(k)}>{k}</button>
        ))}
      </div>
      <Msg msg={msg} />
      {list.error && <p className="error">{list.error}</p>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Registered</th><th>Name</th><th>Role</th><th>Dept</th><th>Roll / Year</th><th>Email</th><th>Phone</th><th>{status === "pending" ? "Action" : "Result"}</th></tr>
          </thead>
          <tbody>
            {list.data?.map((r) => (
              <tr key={r.id}>
                <td>{fmtStamp(r.registered_at)}</td>
                <td>{r.name}</td>
                <td><span className="badge">{r.role}</span></td>
                <td>{r.department}</td>
                <td>{r.role === "student" ? `${r.roll_no} / Yr ${r.year}${r.section ? ` ${r.section}` : ""}${r.batch ? ` (${r.batch})` : ""}` : "-"}</td>
                <td>{r.email}</td>
                <td>{r.phone || "-"}</td>
                <td>
                  {status === "pending" ? (
                    rejecting === r.id ? (
                      <div className="row">
                        <input placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
                        <button className="btn small" onClick={() => act(r.id, "reject", { reason: reason || null })}>Confirm</button>
                        <button className="btn small ghost" onClick={() => setRejecting(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div className="row">
                        <button className="btn small" onClick={() => act(r.id, "approve")}>Approve</button>
                        <button className="btn small ghost" onClick={() => { setRejecting(r.id); setReason(""); }}>Reject</button>
                      </div>
                    )
                  ) : (
                    <span className="muted small-text">{r.status}{r.reason ? `: ${r.reason}` : ""}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.data?.length === 0 && <p className="muted">Nothing here.</p>}
      </div>
    </>
  );
}