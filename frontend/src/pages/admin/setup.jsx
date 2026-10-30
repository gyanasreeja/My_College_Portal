import { useState } from "react";
import useFetch from "../../hooks/fetch";
import PostForm, { toOptions } from "../../components/postform";

export default function Setup() {
  const [reload, setReload] = useState(0);
  const refresh = () => setReload((n) => n + 1);
  const depts = useFetch("/public/departments", {}, reload);
  const deptOptions = toOptions(depts.data, (d) => `${d.name} (${d.code})`);

  return (
    <>
      <h2>Setup</h2>
      <div className="grid">
        <PostForm
          title="Add department"
          path="/admin/departments"
          onDone={refresh}
          fields={[
            { name: "name", label: "Name", required: true },
            { name: "code", label: "Code (e.g. IT)", required: true },
            { name: "description", label: "Description", type: "textarea" },
          ]}
        />
        <PostForm
          title="Add batch"
          path="/admin/batches"
          fields={[
            { name: "name", label: "Batch (e.g. 2022-2026)", required: true },
            { name: "department_id", label: "Department", type: "select", number: true, required: true, options: deptOptions },
          ]}
        />
        <PostForm
          title="Add subject"
          path="/admin/subjects"
          initial={{ credits: 3 }}
          fields={[
            { name: "code", label: "Subject code", required: true },
            { name: "name", label: "Subject name", required: true },
            { name: "department_id", label: "Department", type: "select", number: true, required: true, options: deptOptions },
            { name: "semester", label: "Semester (1-8)", type: "number", required: true },
            { name: "credits", label: "Credits", type: "number" },
          ]}
        />
        <PostForm
          title="Add college info (for the public chatbot)"
          path="/admin/college-info"
          fields={[
            { name: "topic", label: "Topic (e.g. Fees)", required: true },
            { name: "content", label: "Answer text", type: "textarea", required: true },
          ]}
        />
      </div>
    </>
  );
}