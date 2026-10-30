import { useState } from "react";
import api from "../../api/client";
import useFetch from "../../hooks/fetch";
import PostForm, { toOptions } from "../../components/postform";

export default function Publish() {
  const depts = useFetch("/public/departments");
  const batches = useFetch("/public/batches");
  const subjects = useFetch("/staff/subjects");
  const [subjectId, setSubjectId] = useState("");
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");

  const loadStudents = async (id) => {
    setSubjectId(id);
    setStudentId("");
    setStudents([]);
    if (!id) return;
    const { data } = await api.get("/staff/students", { params: { subject_id: id } });
    setStudents(data);
  };

  return (
    <>
      <h2>Publish & Announce</h2>

      <PostForm
        title="Publish results to students"
        path="/staff/results/publish"
        button="Publish"
        initial={{ academic_year: "2024-2025" }}
        fields={[
          { name: "department_id", label: "Department", type: "select", number: true, required: true, options: toOptions(depts.data, (d) => d.name) },
          { name: "batch_id", label: "Batch", type: "select", number: true, required: true, options: toOptions(batches.data, (b) => b.name) },
          { name: "semester", label: "Semester", type: "number", required: true },
          { name: "academic_year", label: "Academic year", required: true },
        ]}
      />

      <PostForm
        title="Post an announcement"
        path="/admin/announcements"
        initial={{ is_public: true }}
        fields={[
          { name: "title", label: "Title", required: true },
          { name: "body", label: "Message", type: "textarea", required: true },
          { name: "is_public", label: "Show on public page", type: "checkbox" },
        ]}
      />

      <div className="card row">
        <strong>Add achievement for:</strong>
        <select value={subjectId} onChange={(e) => loadStudents(e.target.value)}>
          <option value="">Pick a subject to list students</option>
          {subjects.data?.map((s) => (
            <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
          ))}
        </select>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          <option value="">Select student</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.roll_no} - {s.name}</option>
          ))}
        </select>
      </div>
      <PostForm
        title="Achievement details"
        path="/staff/achievements"
        disabled={!studentId}
        initial={{ is_public: true, category: "academic" }}
        transform={(b) => ({ ...b, student_id: Number(studentId) })}
        fields={[
          { name: "title", label: "Title", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "category", label: "Category (academic, sports, technical...)" },
          { name: "is_public", label: "Show on public page", type: "checkbox" },
        ]}
      />
    </>
  );
}