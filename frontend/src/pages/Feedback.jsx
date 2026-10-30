import { useState } from "react";
import api, { errorText } from "../api/client";
import Icon from "../components/Icon";
import Msg from "../components/Message";
import PageBanner from "../components/PageBanner";

export default function Feedback() {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const [rating, setRating] = useState(0);
  const [msg, setMsg] = useState(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!rating) return setMsg({ ok: false, text: "Please choose a star rating." });
    setBusy(true);
    try {
      await api.post("/public/feedback", {
        name: f.name, email: f.email.trim() || undefined, rating, message: f.message,
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
      <PageBanner title="Feedback" subtitle="Tell us what is working and what we can do better." />
      {done ? (
        <div className="card notice"><h3>Thank you</h3><p>Your feedback has been sent to the college.</p></div>
      ) : (
        <form className="card form form-narrow" onSubmit={submit}>
          <label><span>Your name</span>
            <input value={f.name} required minLength={2} onChange={(e) => set("name", e.target.value)} /></label>
          <label><span>Email (optional)</span>
            <input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></label>
          <div>
            <span className="label-text">Rating</span>
            <div className="stars" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`}
                        className={n <= rating ? "on" : ""} onClick={() => setRating(n)}>
                  <Icon name="star" size={28} />
                </button>
              ))}
            </div>
          </div>
          <label><span>Your feedback</span>
            <textarea rows={5} required minLength={5} maxLength={1000} value={f.message} onChange={(e) => set("message", e.target.value)} /></label>
          <button className="btn" disabled={busy}>{busy ? "Sending..." : "Send feedback"}</button>
          <Msg msg={msg} />
        </form>
      )}
    </>
  );
}