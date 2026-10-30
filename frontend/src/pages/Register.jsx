import { useState } from "react";
import { Link } from "react-router-dom";
import api, { errorText } from "../api/client";
import Msg from "../components/Message";
import PageBanner from "../components/PageBanner";
import useFetch from "../hooks/fetch";

const blank = { name: "", email: "", phone: "", department_id: "", batch_id: "", current_year: "1",
  section: "", roll_no: "", guardian_name: "", password: "", confirm: "" };

export default function Register() {
  const depts = useFetch("/public/departments");
  const batches = useFetch("/public/batches");
  const [role, setRole] = useState("student");
  const [f, setF] = useState(blank);
  const [msg, setMsg] = useState(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const isStudent = role === "student";
  const batchOptions = (batches.data || []).filter((b) => String(b.department_id) === f.department_id);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (f.password !== f.confirm) return setMsg({ ok: false, text: "The two passwords do not match." });
    const body = {
      role, name: f.name, email: f.email.trim(), password: f.password, department_id: Number(f.department_id),
      phone: f.phone || undefined,
    };
    if (isStudent) {
      Object.assign(body, {
        batch_id: Number(f.batch_id), roll_no: f.roll_no, current_year: Number(f.current_year),
        section: f.section || undefined, guardian_name: f.guardian_name || undefined,
      });
    }
    setBusy(true);
    try {
      await api.post("/auth/register", body);
      setDone(true);
    } catch (err) {
      setMsg({ ok: false, text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <>
        <PageBanner title="Registration received" subtitle="Thank you for registering." />
        <div className="card notice">
          <h3>What happens next</h3>
          <p>
            Your request has been sent for approval. {isStudent ? "Your department faculty or the admin" : "The admin"} will
            review it. After it is approved you can log in with the email and password you just chose.
          </p>
          <p className="muted small-text">If you try to log in before approval, the page will tell you it is still waiting.</p>
          <Link className="btn" to="/login">Go to login</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner title="Create your account" subtitle="Students and teachers can register. Staff roles above teacher are created by the admin." />
      <div className="tabs">
        {[["student", "I am a student"], ["teacher", "I am a teacher"]].map(([k, label]) => (
          <button key={k} type="button" className={`tab ${role === k ? "on" : ""}`} onClick={() => setRole(k)}>{label}</button>
        ))}
      </div>

      <form className="card form form-wide" onSubmit={submit}>
        <div className="field-grid">
          <label><span>Full name</span>
            <input value={f.name} required minLength={2} onChange={(e) => set("name", e.target.value)} /></label>
          <label><span>Email</span>
            <input type="email" value={f.email} required onChange={(e) => set("email", e.target.value)} /></label>
          <label><span>Phone (optional)</span>
            <input value={f.phone} placeholder="9876543210" onChange={(e) => set("phone", e.target.value)} /></label>
          <label><span>Department</span>
            <select value={f.department_id} required onChange={(e) => setF({ ...f, department_id: e.target.value, batch_id: "" })}>
              <option value="">Select...</option>
              {depts.data?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select></label>

          {isStudent && (
            <>
              <label><span>Roll number</span>
                <input value={f.roll_no} required onChange={(e) => set("roll_no", e.target.value)} /></label>
              <label><span>Batch</span>
                <select value={f.batch_id} required onChange={(e) => set("batch_id", e.target.value)}>
                  <option value="">{f.department_id ? "Select..." : "Choose a department first"}</option>
                  {batchOptions.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select></label>
              <label><span>Current year</span>
                <select value={f.current_year} onChange={(e) => set("current_year", e.target.value)}>
                  {[1, 2, 3, 4].map((y) => <option key={y} value={y}>{y}</option>)}
                </select></label>
              <label><span>Section</span>
                <input value={f.section} maxLength={5} placeholder="A" onChange={(e) => set("section", e.target.value)} /></label>
              <label><span>Guardian name (optional)</span>
                <input value={f.guardian_name} onChange={(e) => set("guardian_name", e.target.value)} /></label>
            </>
          )}

          <label><span>Password (8 or more characters)</span>
            <input type="password" value={f.password} required minLength={8} maxLength={72} onChange={(e) => set("password", e.target.value)} /></label>
          <label><span>Confirm password</span>
            <input type="password" value={f.confirm} required onChange={(e) => set("confirm", e.target.value)} /></label>
        </div>
        <div className="row">
          <button className="btn" disabled={busy}>{busy ? "Sending..." : "Register"}</button>
          <span className="muted small-text">Already registered? <Link to="/login">Log in</Link></span>
        </div>
        <Msg msg={msg} />
      </form>
    </>
  );
}