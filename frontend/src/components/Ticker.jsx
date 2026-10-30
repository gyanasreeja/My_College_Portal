import useFetch from "../hooks/fetch";

// Scrolling strip of the latest announcements, like a college notice ticker
export default function Ticker() {
  const { data } = useFetch("/public/announcements");
  if (!data || data.length === 0) return null;
  const items = data.slice(0, 8);
  return (
    <div className="ticker">
      <span className="ticker-label">Latest</span>
      <div className="ticker-track">
        <div className="ticker-move">
          {[...items, ...items].map((a, i) => <span key={i}>{a.title}</span>)}
        </div>
      </div>
    </div>
  );
}