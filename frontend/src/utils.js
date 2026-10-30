// dates from the API look like "2026-07-11"
export const fmtDate = (d) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

export const dayMonth = (d) => {
  const x = new Date(`${d}T00:00:00`);
  return [x.getDate(), x.toLocaleString("en", { month: "short" })];
};

export const todayIso = () => new Date().toLocaleDateString("en-CA");

// "2026-10-26T05:30:00" from the server is UTC without a "Z"
export const fmtStamp = (iso) => {
  if (!iso) return "";
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
};