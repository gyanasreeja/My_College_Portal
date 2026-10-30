import { Link } from "react-router-dom";
import useFetch from "../../hooks/fetch";

export default function StudentDashboard() {
  const profile = useFetch("/student/profile");
  const att = useFetch("/student/attendance");
  const ach = useFetch("/student/achievements");

  const p = profile.data;
  const low = att.data?.filter((a) => a.percent < 75) || [];

  return (
    <>
      <h2>My Dashboard</h2>
      {profile.error && <p className="error">{profile.error}</p>}
      {p && (
        <div className="card">
          <h3>{p.name}</h3>
          <p className="muted">
            {p.roll_no} | {p.department} | Batch {p.batch} | Year {p.year}
            {p.section && ` | Section ${p.section}`}
          </p>
        </div>
      )}

      {low.length > 0 && (
        <div className="card warn">
          <strong>Low attendance:</strong>{" "}
          {low.map((a) => `${a.subject} (${a.percent}%)`).join(", ")}. Attend every class to
          stay above 75%.
        </div>
      )}

      <div className="grid">
        <Link className="card tile" to="/student/results">My Results</Link>
        <Link className="card tile" to="/student/attendance">My Attendance</Link>
        <Link className="card tile" to="/student/advice">AI Study Advice</Link>
      </div>

      <h3>My Achievements</h3>
      {ach.data?.length === 0 && <p className="muted">No achievements yet.</p>}
      {ach.data?.map((a) => (
        <div className="card" key={a.id}>
          <span className="badge">{a.category}</span> {a.title}
        </div>
      ))}
    </>
  );
}