import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import PageBanner from "../components/PageBanner";
import college from "../config";

export default function Contact() {
  const q = encodeURIComponent(`${college.name} ${college.address}`);
  return (
    <>
      <PageBanner title="Contact us" subtitle="Find the campus and reach the college office." />
      <div className="two-col">
        <div>
          <div className="card contact-line"><Icon name="pin" /><div><h3>Address</h3>
            <p>{college.name}</p><p className="muted">{college.address}</p></div></div>
          <div className="card contact-line"><Icon name="phone" /><div><h3>Phone</h3>
            <p className="muted">{college.phone || "Please check the official college website or visit the college office."}</p></div></div>
          <div className="card contact-line"><Icon name="mail" /><div><h3>Email</h3>
            <p className="muted">{college.email || "Use the admission enquiry or feedback form and we will reply."}</p></div></div>
          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn" to="/admission">Admission enquiry</Link>
            <Link className="btn ghost" to="/feedback">Give feedback</Link>
          </div>
        </div>
        <div className="card map-card">
          <iframe title="Campus map" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${q}&output=embed`} />
        </div>
      </div>
    </>
  );
}