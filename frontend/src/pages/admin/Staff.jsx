import useFetch from "../../hooks/fetch";
import PostForm, { toOptions } from "../../components/postform";

export default function Staff() {
  const depts = useFetch("/public/departments");
  const subjects = useFetch("/admin/subjects");

  return (
    <>
      <h2>Teachers & Faculty</h2>
      <p className="muted">
        Teachers can only mark attendance and enter marks for the subjects you tick here.
        Faculty manage their whole department and publish results.
      </p>
      <PostForm
        title="Add staff member (creates their login too)"
        path="/admin/staff"
        initial={{ role: "teacher" }}
        fields={[
          { name: "name", label: "Full name", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "password", label: "Temporary password (min 8)", type: "password", required: true },
          { name: "department_id", label: "Department", type: "select", number: true, required: true, options: toOptions(depts.data, (d) => d.name) },
          {
            name: "role", label: "Role", type: "select", required: true,
            options: [{ value: "teacher", label: "Teacher" }, { value: "faculty", label: "Faculty (department head)" }],
          },
          { name: "subject_ids", label: "Assigned subjects (for teachers)", type: "multi", options: toOptions(subjects.data, (s) => `${s.code} - ${s.name}`) },
        ]}
      />
    </>
  );
}