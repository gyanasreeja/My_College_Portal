import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import college from "../config";
import { useAuth } from "../context/AuthContext";
import { GUEST_LINKS, PORTAL_LINKS, SITE_LINKS } from "../menus";
import Icon from "./Icon";
import Logo from "./Logo";
import Lock from "./Lock";

export default function Navbar() {
  const { token, role, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const onLogout = () => {
    close();
    logout();
    navigate("/");
  };

  // visitors also see Results and Attendance (locked) before Contact
  const site = token
    ? SITE_LINKS
    : [...SITE_LINKS.slice(0, -1), ...GUEST_LINKS, SITE_LINKS[SITE_LINKS.length - 1]];

  return (
    <>
      <div className="utility">
        <div className="utility-inner">
          <div className="utility-left">
            {college.phone && <span><Icon name="phone" size={14} /> {college.phone}</span>}
            {college.email && <span><Icon name="mail" size={14} /> {college.email}</span>}
            {!college.phone && !college.email && <span><Icon name="pin" size={14} /> Visakhapatnam, Andhra Pradesh</span>}
          </div>
          <div className="utility-right">
            <Link to="/admission">Admissions</Link>
            <Link to="/feedback">Feedback</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>

      <header className="topbar">
        <Link to="/" className="brand-block" onClick={close}>
          <Logo />
          <div>
            <div className="college-name">{college.name}</div>
            <div className="college-sub">{college.portalTitle}</div>
          </div>
        </Link>
        {token ? (
          <div className="who">
            <span className="role-chip">{role}</span>
            <button className="btn small gold" onClick={onLogout}>Logout</button>
          </div>
        ) : (
          <div className="who">
            <Link className="btn small ghost-light" to="/register">Register</Link>
            <Link className="btn small gold" to="/login">Login</Link>
          </div>
        )}
      </header>

      <div className="sticky-nav">
        <nav className={`nav ${open ? "open" : ""}`} aria-label="Main">
          <button type="button" className="nav-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <Icon name={open ? "close" : "menu"} /> Menu
          </button>
          <div className="nav-links">
            {site.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} onClick={close}>
                {l.label}
                {l.locked && !token && <Lock />}
              </NavLink>
            ))}
          </div>
        </nav>

        {token && (
          <div className="portal-bar">
            <span className="portal-label">{role} tools</span>
            {(PORTAL_LINKS[role] || []).map(([to, label]) => (
              <NavLink key={to} to={to} end onClick={close}>{label}</NavLink>
            ))}
          </div>
        )}
      </div>
    </>
  );
}