import { Link } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import college from "../config";

export default function About() {
  return (
    <>
      <PageBanner title="About the college" subtitle={college.name} />
      <div className="card">
        {college.about.map((p) => <p key={p}>{p}</p>)}
        <div className="hero-badges dark">
          {college.accreditations.map((a) => <span key={a}>{a}</span>)}
        </div>
      </div>

      <h2 className="section-title">At a glance</h2>
      <div className="facts">
        {college.facts.map(([n, label]) => (
          <div className="card fact" key={label}>
            <div className="num">{n}</div>
            <div className="muted">{label}</div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Our recruiters</h2>
      <div className="chips">
        {college.recruiters.map((r) => <span className="chip" key={r}>{r}</span>)}
      </div>

      <p style={{ marginTop: 24 }}>
        <Link to="/departments">Explore departments</Link> | <Link to="/activities">See campus activities</Link>
      </p>
    </>
  );
}