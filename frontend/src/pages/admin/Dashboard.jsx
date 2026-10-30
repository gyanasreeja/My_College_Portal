import { Link } from "react-router-dom";
import useFetch from "../../hooks/fetch";

export default function AdminDashboard() {
  const { data, error } = useFetch("/admin/dashboard");

  const stats = [
    ["Students", data?.students],
    ["Teachers & faculty", data?.teachers],
    ["Departments", data?.departments],
    ["Subjects", data?.subjects],
  ];

  return (
    <>
      <h2>Admin Dashboard</h2>
      {error && <p className="error">{error}</p>}
      <div className="grid">
        {stats.map(([label, value]) => (
          <div className="card stat" key={label}>
            <div className="num">{value ?? "-"}</div>
            <div className="muted">{label}</div>
          </div>
        ))}
      </div>
      <p>
        First time? Go to <Link to="/admin/setup">Setup</Link> to add departments, batches and
        subjects, then add <Link to="/admin/staff">staff</Link> and{" "}
        <Link to="/admin/students">students</Link>.
      </p>
    </>
  );
}