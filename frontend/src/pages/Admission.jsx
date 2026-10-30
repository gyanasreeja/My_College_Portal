import { useState } from "react";
import api, { errorText } from "../api/client";
import Msg from "../components/Message";
import PageBanner from "../components/PageBanner";
import useFetch from "../hooks/fetch";

export default function Admission() {
  const depts = useFetch("/public/departments");
  const [f, setF] = useState({ name: "", email: "", phone: "", department_id: "", message: "" });
  const [msg, setMsg] = useState(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      await api.post("/public/admission-enquiry", {
        name: f.name, email: f.email.trim(), phone: f.phone,
        department_id: f.department_id ? Number(f.department_id) : undefined,
        message: f.message || undefined,
      });
      setDone(true);
    } catch (err) {
      setMsg({ ok: false, text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageBanner title="Admissions" subtitle="Send an enquiry and the admissions office will contact you." />
      {done ? (
        <div className="card notice">
          <h3>Thank you</h3>
          <p>Your enquiry has been received. The admissions office will contact you soon.</p>
        </div>
      ) : (
        <div className="two-col">
          <form className="card form" onSubmit={submit}>
            <h3>Admission enquiry</h3>
            <label><span>Your name</span>
              <input value={f.name} required minLength={2} onChange={(e) => set("name", e.target.value)} /></label>
            <label><span>Email</span>
              <input type="email" value={f.email} required onChange={(e) => set("email", e.target.value)} /></label>
            <label><span>Phone</span>
              <input value={f.phone} required placeholder="9876543210" onChange={(e) => set("phone", e.target.value)} /></label>
            <label><span>Department you are interested in</span>
              <select value={f.department_id} onChange={(e) => set("department_id", e.target.value)}>
                <option value="">Not sure yet</option>
                {depts.data?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select></label>
            <label><span>Your question (optional)</span>
              <textarea rows={4} maxLength={1000} value={f.message} onChange={(e) => set("message", e.target.value)} /></label>
            <button className="btn" disabled={busy}>{busy ? "Sending..." : "Send enquiry"}</button>
            <Msg msg={msg} />
          </form>
          <div className="card">
            <h3>How it works</h3>
            <ol className="steps">
              <li>Send your enquiry with a phone number we can reach.</li>
              <li>The admissions office reviews it and calls or emails you.</li>
              <li>You get the details on courses, eligibility and dates.</li>
            </ol>
            <p className="muted small-text">Already admitted? Use Register in the top bar to create your portal account.</p>
          </div>
        </div>
      )}
    </>
  );
}