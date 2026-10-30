import { useEffect, useState } from "react";
import Icon from "./Icon";

export default function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button type="button" className="backtop" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <Icon name="up" />
    </button>
  );
}
