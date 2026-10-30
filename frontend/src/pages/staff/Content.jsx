import { useState } from "react";
import useFetch from "../../hooks/fetch";
import PostForm, { toOptions } from "../../components/postform";

const CATEGORIES = ["Workshop", "Hackathon", "FDP", "Guest Lecture", "Conference", "Cultural", "Sports", "Awareness", "General"]
  .map((c) => ({ value: c, label: c }));
const MODES = ["Offline", "Online", "Hybrid"].map((c) => ({ value: c, label: c }));

// Faculty and admin add what the public and logged-in pages show.
// Faculty can only post for their own department; the server enforces this too.
export default function Content() {
  const me = useFetch("/staff/me");
  const depts = useFetch("/public/departments");
  const [tab, setTab] = useState("activity");

  if (me.error) return <p className="error">{me.error}</p>;
  if (!me.data || !depts.data) return <p className="muted">Loading...</p>;

  const isAdmin = me.data.role === "admin";
  const allowed = isAdmin ? depts.data : depts.data.filter((d) => d.id === me.data.department_id);
  const options = toOptions(allowed, (d) => `${d.name} (${d.code})`);
  const initial = { department_id: isAdmin ? "" : me.data.department_id };

  // admin may leave the department empty (= everyone); faculty must use their own
  const dept = (required) => ({
    name: "department_id", label: isAdmin && !required ? "Department (leave empty for all)" : "Department",
    type: "select", number: true, required: required || !isAdmin, options,
  });

  return (
    <>
      <h2>Website content</h2>
      <p className="muted">
        Activities are public. Placements, training and labs are shown only to logged-in users.
        {!isAdmin && " You can post for your own department."}
      </p>

      <div className="tabs">
        {[["activity", "Activity / event"], ["placement", "Placement drive"], ["training", "Training"], ["lab", "Lab"]].map(([k, label]) => (
          <button key={k} className={`tab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {tab === "activity" && (
        <PostForm title="Add an activity (public)" path="/campus/activities" initial={{ ...initial, category: "Workshop" }}
          fields={[
            { name: "title", label: "Title", required: true },
            { name: "category", label: "Category", type: "select", required: true, options: CATEGORIES },
            dept(false),
            { name: "event_date", label: "Date", type: "date", required: true },
            { name: "venue", label: "Venue" },
            { name: "description", label: "Description", type: "textarea" },
          ]} />
      )}

      {tab === "placement" && (
        <PostForm title="Add a placement drive (login required to view)" path="/campus/placements" initial={initial}
          fields={[
            { name: "company", label: "Company", required: true },
            { name: "role", label: "Role", required: true },
            { name: "package_lpa", label: "Package in LPA (for example 6.5)", number: true },
            { name: "drive_date", label: "Drive date", type: "date", required: true },
            { name: "last_date", label: "Apply by", type: "date" },
            dept(false),
            { name: "eligibility", label: "Eligibility" },
            { name: "details", label: "Details", type: "textarea" },
          ]} />
      )}

      {tab === "training" && (
        <PostForm title="Add a training session (login required to view)" path="/campus/training" initial={{ ...initial, mode: "Offline" }}
          fields={[
            { name: "title", label: "Title", required: true },
            { name: "trainer", label: "Trainer" },
            { name: "start_date", label: "Start date", type: "date", required: true },
            { name: "end_date", label: "End date", type: "date" },
            { name: "timing", label: "Timing (for example 4:00 PM - 6:00 PM)" },
            { name: "mode", label: "Mode", type: "select", options: MODES },
            { name: "venue", label: "Venue" },
            dept(false),
            { name: "description", label: "Description", type: "textarea" },
          ]} />
      )}

      {tab === "lab" && (
        <PostForm title="Add a lab (login required to view)" path="/campus/labs" initial={initial}
          fields={[
            { name: "name", label: "Lab name", required: true },
            dept(true),
            { name: "location", label: "Location (block, room)" },
            { name: "incharge", label: "In-charge" },
            { name: "timings", label: "Timings" },
            { name: "equipment", label: "Equipment", type: "textarea" },
          ]} />
      )}
    </>
  );
}