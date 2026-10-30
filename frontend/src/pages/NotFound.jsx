import { Link } from "react-router-dom";
import PageBanner from "../components/PageBanner";

export default function NotFound() {
  return (
    <>
      <PageBanner title="Page not found" subtitle="The page you are looking for does not exist or has moved." />
      <div className="card notice">
        <p>Try one of these instead:</p>
        <div className="row">
          <Link className="btn" to="/">Home</Link>
          <Link className="btn ghost" to="/departments">Departments</Link>
          <Link className="btn ghost" to="/activities">Activities</Link>
          <Link className="btn ghost" to="/contact">Contact</Link>
        </div>
      </div>
    </>
  );
}