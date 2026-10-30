export default function Lock({ size = 13 }) {
  return (
    <svg className="lock" role="img" aria-label="Login required" width={size} height={size} viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}