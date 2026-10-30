import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ChatWidget from "../components/ChatWidget";
import CountUp from "../components/CountUp";
import Icon from "../components/Icon";
import Lock from "../components/Lock";
import Rail from "../components/Rail";
import Reveal from "../components/Reveal";
import HeroSlider from "../components/HeroSlider";
import Ticker from "../components/Ticker";
import college from "../config";
import { useAuth } from "../context/AuthContext";
import useFetch from "../hooks/fetch";
import { PORTAL_LINKS } from "../menus";
import { dayMonth, fmtDate } from "../utils";

// Shortcuts visitors see before login. Each one asks for a login first.
const GUEST_CARDS = [
  ["/student/results", "results", "Exam results", "Semester-wise marks, grades and SGPA"],
  ["/student/attendance", "attendance", "Attendance", "Subject-wise percentage and low-attendance alerts"],
  ["/placements", "placements", "Placements", "Upcoming drives, packages and eligibility"],
  ["/training", "training", "Training", "Aptitude, coding and interview preparation"],
  ["/labs", "labs", "Labs", "Lab timings, locations and equipment"],
  ["/student/advice", "ai", "AI study advice", "A personal study plan based on your marks"],
];
const SHARED_CARDS = [
  ["/placements", "placements", "Placements", "Upcoming drives, packages and eligibility"],
  ["/training", "training", "Training", "Aptitude, coding and interview preparation"],
  ["/labs", "labs", "Labs", "Lab timings, locations and equipment"],
];
const ICONS = { "/student": "results", "/student/results": "results", "/student/attendance": "attendance",
  "/student/advice": "ai", "/staff/marks": "results", "/staff/attendance": "attendance" };

export default function Home() {
  const { hash } = useLocation();
  const { token, role } = useAuth();
  const depts = useFetch("/public/departments");
  const news = useFetch("/public/announcements");
  const acts = useFetch("/public/activities");
  const ach = useFetch("/public/achievements");
  const stats = useFetch("/public/stats");
  const offline = depts.error && news.error && ach.error;

  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash, depts.data]);

  const img = college.slideImages;
  const slides = [
    {
      image: img[0], eyebrow: "Welcome to", title: college.name, badges: college.accreditations,
      text: "Anyone can explore our departments, activities and achievements. Log in for results, attendance, placements, training and labs.",
      actions: token
        ? [{ label: "Go to my portal", to: PORTAL_LINKS[role]?.[0]?.[0] || "/", kind: "gold" }, { label: "Explore departments", to: "/departments" }]
        : [{ label: "Student / staff login", to: "/login", kind: "gold" }, { label: "Explore departments", to: "/departments" }],
    },
    {
      image: img[1], eyebrow: "Admissions", title: "Start your journey with us",
      text: "Ask about courses, eligibility and the admission process. Our admissions office will get back to you.",
      actions: [{ label: "Admission enquiry", to: "/admission", kind: "gold" }, { label: "See departments", to: "/departments" }],
    },
    {
      image: img[2], eyebrow: "One portal", title: "Results, attendance and more in one login",
      text: "Students check marks and attendance, teachers enter records, and faculty publish results, all with role-based access.",
      actions: token
        ? [{ label: "Open my tools", to: PORTAL_LINKS[role]?.[0]?.[0] || "/", kind: "gold" }]
        : [{ label: "Create an account", to: "/register", kind: "gold" }, { label: "Login", to: "/login" }],
    },
    {
      image: img[3], eyebrow: "Careers", title: "Placements, training and labs",
      text: "Follow campus drives, join training sessions and find lab timings. Sign in to see the details.",
      actions: [{ label: "View placements", to: "/placements", kind: "gold" }, { label: "Latest activities", to: "/activities" }],
    },
  ];

  const cards = token
    ? [...(PORTAL_LINKS[role] || []).map(([to, label]) => [to, ICONS[to] || "check", label, null]), ...SHARED_CARDS]
    : GUEST_CARDS;

  return (
    <>
      <div className="wrap"><Ticker /></div>
      <HeroSlider slides={slides} />

      {offline && <div className="wrap"><p className="error">{depts.error}</p></div>}

      <section className="glance">
        {[
          ["Students", stats.data?.students],
          ["Teachers & faculty", stats.data?.teachers],
          ["Departments", stats.data?.departments],
          ["Achievements", stats.data?.achievements],
        ].map(([label, n]) => (
          <div key={label}>
            <div className="num"><CountUp value={n} /></div>
            <div>{label}</div>
          </div>
        ))}
      </section>

      <section className="band">
        <div className="wrap">
          <Reveal>
            <h2 className="section-title">{token ? "Your tools" : "Student corner"}</h2>
            {!token && (
              <p className="muted">
                These sections need a login. <Link to="/login">Log in</Link> or <Link to="/register">register</Link> to continue.
              </p>
            )}
            <div className="grid">
              {cards.map(([to, icon, title, text]) => (
                <Link key={to + title} to={to} className="card quick feature">
                  <span className="feature-icon"><Icon name={icon} size={22} /></span>
                  <div>
                    <h3>{title} {!token && <Lock />}</h3>
                    {text && <p className="muted">{text}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band alt">
        <div className="wrap about-grid">
          <Reveal>
            <h2 className="section-title">About us</h2>
            {college.about.map((p) => <p key={p}>{p}</p>)}
            <div className="hero-badges dark">
              {college.accreditations.map((a) => <span key={a}>{a}</span>)}
            </div>
            <p style={{ marginTop: 18 }}><Link className="btn" to="/about">Read more</Link></p>
          </Reveal>
          <Reveal delay={120}>
            <div className="about-photo" style={{ backgroundImage: `url(${college.aboutImage}), url(${college.heroImage}), linear-gradient(135deg, #1f3a9e, #12206b)` }}>
              <div className="about-facts">
                {college.facts.slice(0, 4).map(([n, label]) => (
                  <div key={label}><strong>{n}</strong><span>{label}</span></div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band" id="departments">
        <div className="wrap">
          <Reveal>
            <div className="section-head">
              <h2 className="section-title">Departments</h2>
              <Link to="/departments">View all</Link>
            </div>
            <Rail label="departments">
              {depts.data?.map((d) => (
                <Link to={`/activities?dept=${d.id}`} className="card dept quick rail-item" key={d.id}>
                  <div className="dept-code">{d.code}</div>
                  <div>
                    <h3>{d.name}</h3>
                    <p className="muted small-text">See activities</p>
                  </div>
                </Link>
              ))}
            </Rail>
          </Reveal>
        </div>
      </section>

      <section className="band alt">
        <div className="wrap">
          <Reveal>
            <div className="section-head">
              <h2 className="section-title">Latest activities</h2>
              <Link to="/activities">See all</Link>
            </div>
            <Rail label="activities">
              {acts.data?.slice(0, 10).map((a) => {
                const [d, m] = dayMonth(a.event_date);
                return (
                  <div className="card rail-item event-card" key={a.id}>
                    <div className="row">
                      <div className="bulletin-date"><strong>{d}</strong><span>{m}</span></div>
                      <span className="badge">{a.category}</span>
                    </div>
                    <h3 style={{ marginTop: 12 }}>{a.title}</h3>
                    <p className="muted small-text">{a.venue} | {fmtDate(a.event_date)}</p>
                  </div>
                );
              })}
            </Rail>
            {acts.data?.length === 0 && <p className="muted">No activities yet.</p>}
          </Reveal>
        </div>
      </section>

      <section className="band navy">
        <div className="wrap">
          <Reveal>
            <h2 className="section-title light">Our recruiters</h2>
            <div className="marquee" aria-label="Recruiters">
              <div className="marquee-move">
                {[...college.recruiters, ...college.recruiters].map((r, i) => <span key={i}>{r}</span>)}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <Reveal>
            <h2 className="section-title">Campus life</h2>
            <Rail label="gallery">
              {college.gallery.map((g, i) => (
                <figure className="photo rail-item" key={g.caption}
                        style={{ backgroundImage: `url(${g.image}), linear-gradient(${120 + i * 25}deg, #12206b, #3552c9)` }}>
                  <figcaption>{g.caption}</figcaption>
                </figure>
              ))}
            </Rail>
          </Reveal>
        </div>
      </section>

      <section className="band alt" id="bulletin">
        <div className="wrap two-col">
          <Reveal>
            <h2 className="section-title">Bulletin board</h2>
            <div className="card bulletin scroll-panel">
              {news.data?.map((a) => (
                <div className="bulletin-item" key={a.id}>
                  <div className="bulletin-date">
                    <strong>{new Date(a.created_at).getDate()}</strong>
                    <span>{new Date(a.created_at).toLocaleString("en", { month: "short" })}</span>
                  </div>
                  <div>
                    <h3>{a.title}</h3>
                    <p className="muted small-text">{a.body}</p>
                  </div>
                </div>
              ))}
              {news.data?.length === 0 && <p className="muted">No announcements right now.</p>}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="section-title">Student achievements</h2>
            <div className="card bulletin scroll-panel">
              {ach.data?.map((a) => (
                <div className="bulletin-item" key={a.id}>
                  <span className="feature-icon small"><Icon name="results" size={18} /></span>
                  <div>
                    <h3>{a.title}</h3>
                    <p className="muted small-text"><span className="badge">{a.category}</span> {a.student_name}</p>
                  </div>
                </div>
              ))}
              {ach.data?.length === 0 && <p className="muted">No achievements yet.</p>}
            </div>
            <p><Link to="/achievements">See all achievements</Link></p>
          </Reveal>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap cta-inner">
          <div>
            <h2>Admissions are open</h2>
            <p>Have a question about courses or eligibility? Send an enquiry and the admissions office will reply.</p>
          </div>
          <div className="row">
            <Link className="btn gold" to="/admission">Admission enquiry</Link>
            <Link className="btn ghost-light" to="/register">Register</Link>
          </div>
        </div>
      </section>

      <ChatWidget />
    </>
  );
}