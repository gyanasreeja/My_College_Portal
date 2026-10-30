import useFetch from "../../hooks/fetch";

export default function Results() {
  const { data, error } = useFetch("/student/results");

  return (
    <>
      <h2>My Results</h2>
      {error && <p className="error">{error}</p>}
      {data?.length === 0 && <p className="muted">No published results yet.</p>}
      {data?.map((sem) => (
        <div className="card" key={sem.semester}>
          <h3>
            Semester {sem.semester} <span className="badge">SGPA {sem.sgpa}</span>
          </h3>
          <table>
            <thead>
              <tr>
                <th>Code</th><th>Subject</th><th>Internal</th><th>External</th><th>Total</th><th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {sem.subjects.map((s) => (
                <tr key={s.code}>
                  <td>{s.code}</td>
                  <td>{s.subject}</td>
                  <td>{s.internal}</td>
                  <td>{s.external}</td>
                  <td>{s.total}</td>
                  <td className={s.grade === "F" ? "bad" : "good"}>{s.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}