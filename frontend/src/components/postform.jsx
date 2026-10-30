/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import api, { errorText } from "../api/client";
import Msg from "./Message";

export const toOptions = (list, label) =>
  (list || []).map((x) => ({ value: x.id, label: label(x) }));

/*
  A small reusable form that POSTs JSON to `path`.
  fields: [{ name, label, type?, options?, number?, required? }]
  type: text | password | email | number | date | textarea | select | checkbox | multi
*/
export default function PostForm({
  title, path, fields, initial = {}, onDone, transform, disabled, button = "Save",
}) {
  const [values, setValues] = useState({ ...initial });
  const [msg, setMsg] = useState(null);

  const set = (name, value) => setValues((p) => ({ ...p, [name]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    const body = {};
    fields.forEach((f) => {
      let v = values[f.name];
      if (f.type === "checkbox") v = !!v;
      else if (f.type === "multi") v = v || [];
      else if (v === undefined || v === "") return;
      else if (f.type === "number" || f.number) v = Number(v);
      body[f.name] = v;
    });
    try {
      await api.post(path, transform ? transform(body) : body);
      setMsg({ ok: true, text: "Saved successfully" });
      setValues({ ...initial });
      onDone?.();
    } catch (err) {
      setMsg({ ok: false, text: errorText(err) });
    }
  };

  const renderField = (f) => {
    const value = values[f.name] ?? "";
    switch (f.type) {
      case "textarea":
        return <textarea rows={3} value={value} required={f.required} onChange={(e) => set(f.name, e.target.value)} />;
      case "select":
        return (
          <select value={value} required={f.required} onChange={(e) => set(f.name, e.target.value)}>
            <option value="">Select...</option>
            {f.options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        );
      case "checkbox":
        return <input type="checkbox" checked={!!values[f.name]} onChange={(e) => set(f.name, e.target.checked)} />;
      case "multi": {
        const chosen = values[f.name] || [];
        return (
          <div className="multi">
            {f.options?.map((o) => (
              <label key={o.value} className="inline">
                <input
                  type="checkbox"
                  checked={chosen.includes(o.value)}
                  onChange={(e) =>
                    set(f.name, e.target.checked ? [...chosen, o.value] : chosen.filter((x) => x !== o.value))
                  }
                />
                {o.label}
              </label>
            ))}
          </div>
        );
      }
      default:
        return (
          <input type={f.type || "text"} value={value} required={f.required} onChange={(e) => set(f.name, e.target.value)} />
        );
    }
  };

  return (
    <form className="card form" onSubmit={submit}>
      {title && <h3>{title}</h3>}
      {fields.map((f) => (
        <label key={f.name}>
          <span>{f.label}</span>
          {renderField(f)}
        </label>
      ))}
      <button className="btn" disabled={disabled}>{button}</button>
      <Msg msg={msg} />
    </form>
  );
}