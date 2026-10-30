// msg = { ok: true/false, text: "..." } or null
export default function Msg({ msg }) {
  if (!msg) return null;
  return <p className={msg.ok ? "success" : "error"}>{msg.text}</p>;
}