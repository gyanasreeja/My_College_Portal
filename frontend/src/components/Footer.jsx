import { Link } from "react-router-dom";
import college from "../config";
import Icon from "./Icon";
import Lock from "./Lock";

export default function Footer() {
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(college.name + " " + college.address)}`;
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h4>{college.name}</h4>
          <p className="foot-line"><Icon name="pin" size={16} /> <span>{college.address}</span></p>
          {college.phone && <p className="foot-line"><Icon name="phone" size={16} /> <span>{college.phone}</span></p>}
          {college.email && <p className="foot-line"><Icon name="mail" size={16} /> <span>{college.email}</span></p>}
          <p><a href={map} target="_blank" rel="noreferrer">View on map</a></p>
          {college.social.length > 0 && (
            <p className="social">
              {college.social.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.label}</a>)}
            </p>
          )}
        </div>
        <div>
          <h4>Explore</h4>
          <p><Link to="/about">About</Link></p>
          <p><Link to="/departments">Departments</Link></p>
          <p><Link to="/activities">Activities</Link></p>
          <p><Link to="/achievements">Achievements</Link></p>
          <p><Link to="/contact">Contact</Link></p>
        </div>
        <div>
          <h4>Students and staff</h4>
          <p><Link to="/student/results">Results <Lock /></Link></p>
          <p><Link to="/student/attendance">Attendance <Lock /></Link></p>
          <p><Link to="/placements">Placements <Lock /></Link></p>
          <p><Link to="/training">Training <Lock /></Link></p>
          <p><Link to="/labs">Labs <Lock /></Link></p>
        </div>
        <div>
          <h4>Admissions and feedback</h4>
          <p className="muted-light">Interested in joining us, or want to tell us how we are doing?</p>
          <p><Link className="btn small gold" to="/admission">Admission enquiry</Link></p>
          <p><Link className="btn small ghost-light" to="/feedback">Give feedback</Link></p>
          <p><Link className="btn small ghost-light" to="/register">Register an account</Link></p>
        </div>
      </div>
      <div className="footer-note">
        {college.disclaimer} &copy; {new Date().getFullYear()}
      </div>
    </footer>
  );
}