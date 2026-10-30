export default function PageBanner({ title, subtitle }) {
  return (
    <section className="page-banner">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </section>
  );
}