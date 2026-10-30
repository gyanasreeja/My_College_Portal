import { useEffect, useRef, useState } from "react";

// Fades a block in when it scrolls into view.
export default function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(
    () => typeof window === "undefined" || !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (shown || !ref.current) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShown(true);
        io.disconnect();
      }
    }, { threshold: 0.1 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [shown]);

  return (
    <div ref={ref} className={`reveal ${shown ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
