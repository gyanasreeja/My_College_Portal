import { useEffect, useRef, useState } from "react";

// Counts up to `value` once it is visible.
export default function CountUp({ value }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (typeof value !== "number" || !ref.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      if (reduced) return setN(value);
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / 1200, 1);
        setN(Math.round(value * (1 - (1 - t) ** 3)));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(ref.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return <span ref={ref}>{typeof value === "number" ? n : "-"}</span>;
}