import {
  Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import useFetch from "../../hooks/fetch";

export default function Attendance() {
  const { data, error } = useFetch("/student/attendance");

  return (
    <>
      <h2>My Attendance</h2>
      {error && <p className="error">{error}</p>}
      {data?.length === 0 && <p className="muted">No attendance recorded yet.</p>}
      {data?.length > 0 && (
        <>
          <div className="card" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <ReferenceLine y={75} stroke="#b91c1c" strokeDasharray="4 4" label="75%" />
                <Bar dataKey="percent" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <table>
              <thead>
                <tr><th>Subject</th><th>Attended</th><th>Total</th><th>%</th></tr>
              </thead>
              <tbody>
                {data.map((a) => (
                  <tr key={a.subject}>
                    <td>{a.subject}</td>
                    <td>{a.attended}</td>
                    <td>{a.total}</td>
                    <td className={a.percent < 75 ? "bad" : "good"}>{a.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}