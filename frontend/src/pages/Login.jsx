import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { homeFor, rolePrefix, useAuth } from "../context/AuthContext";
import { errorText } from "../api/client";
import college from "../config";
import Logo from "../components/Logo";
import Msg from "../components/Message";

const SHARED_PAGES = ["/placements", "/training", "/labs"]; // every logged-in role may open these

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const role = await login(email.trim(), password);
      const from = location.state?.from;
      const allowed = from && (SHARED_PAGES.includes(from) || from.startsWith(rolePrefix(role)));
      navigate(allowed ? from : homeFor(role), { replace: true });
    } catch (err) {
      setMsg({ ok: false, text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  const side = {
    backgroundImage: `linear-gradient(160deg, rgba(10,22,70,0.88), rgba(10,22,70,0.6)), url(${college.heroImage})`,
  };

  return (
    <div className="login-wrap">
      <div className="login-side" style={side}>
        <Logo size={72} />
        <h2>{college.name}</h2>
        <p>{college.portalTitle}</p>
        <ul>
          <li>Students: results, attendance, AI study advice</li>
          <li>Teachers: student records and marks</li>
          <li>Faculty and admin: publish and manage</li>
        </ul>
      </div>

      <form className="login-form" onSubmit={submit}>
        <h2>Sign in</h2>
        {location.state?.from && (
          <p className="muted">Please log in to continue.</p>
        )}
        <label>
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="btn" disabled={busy}>{busy ? "Signing in..." : "Login"}</button>
        <Msg msg={msg} />
        <p className="muted small-text">New here? <Link to="/register">Create an account</Link></p>
        <p className="muted small-text">
          Demo logins: student@college.edu, teacher@college.edu, faculty@college.edu,
          admin@college.edu (password: Password@123)
        </p>
      </form>
    </div>
  );
}