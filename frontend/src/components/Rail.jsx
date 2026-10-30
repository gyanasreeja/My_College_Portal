import { useRef } from "react";
import Icon from "./Icon";

// A row that scrolls sideways (touch, mouse wheel, scroll bar or the arrow buttons).
export default function Rail({ children, label = "items" }) {
  const ref = useRef(null);
  const go = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };
  return (
    <div className="rail-wrap">
      <button type="button" className="rail-btn left" aria-label={`Scroll ${label} left`} onClick={() => go(-1)}>
        <Icon name="left" />
      </button>
      <div className="rail" ref={ref} tabIndex={0} aria-label={label}>{children}</div>
      <button type="button" className="rail-btn right" aria-label={`Scroll ${label} right`} onClick={() => go(1)}>
        <Icon name="right" />
      </button>
    </div>
  );
}