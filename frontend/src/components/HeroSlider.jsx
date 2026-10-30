import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import college from "../config";
import Icon from "./Icon";

// slides: [{ image, eyebrow, title, text, actions: [{ label, to, kind }] }]
export default function HeroSlider({ slides }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (paused || count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((x) => (x + 1) % count), 6500);
    return () => clearInterval(id);
  }, [paused, count]);

  const go = (n) => setI((n + count) % count);

  return (
    <section className="hero-slider" aria-roledescription="carousel" aria-label="College highlights"
             onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {slides.map((s, n) => (
        <div key={s.title} className={`slide ${n === i ? "on" : ""}`} aria-hidden={n !== i}
             style={{ backgroundImage: `linear-gradient(105deg, rgba(8,18,64,0.92) 12%, rgba(8,18,64,0.35) 70%), url(${s.image}), url(${college.heroImage}), linear-gradient(135deg, #12206b, #1f3a9e)` }}>
          <div className="wrap slide-inner">
            <span className="eyebrow">{s.eyebrow}</span>
            <h1>{s.title}</h1>
            {s.badges && (
              <div className="hero-badges">{s.badges.map((b) => <span key={b}>{b}</span>)}</div>
            )}
            <p>{s.text}</p>
            <div className="hero-actions">
              {s.actions.map((a) => (
                <Link key={a.label} to={a.to} tabIndex={n === i ? 0 : -1}
                      className={`btn ${a.kind === "gold" ? "gold" : "ghost-light"}`}>{a.label}</Link>
              ))}
            </div>
          </div>
        </div>
      ))}
      {count > 1 && (
        <>
          <button type="button" className="slider-arrow left" aria-label="Previous slide" onClick={() => go(i - 1)}><Icon name="left" size={24} /></button>
          <button type="button" className="slider-arrow right" aria-label="Next slide" onClick={() => go(i + 1)}><Icon name="right" size={24} /></button>
          <div className="slider-dots">
            {slides.map((s, n) => (
              <button type="button" key={s.title} aria-label={`Show slide ${n + 1}`} className={n === i ? "on" : ""} onClick={() => setI(n)} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}