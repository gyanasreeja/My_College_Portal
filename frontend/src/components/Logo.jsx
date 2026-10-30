import { useState } from "react";
import college from "../config";

// Shows /logo.png if it exists, otherwise a round text badge.
export default function Logo({ size = 52 }) {
  const [broken, setBroken] = useState(false);
  const style = { width: size, height: size };

  if (!broken) {
    return (
      <img
        className="logo-img"
        style={style}
        src={college.logo}
        alt={`${college.shortName} logo`}
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <div className="logo-badge" style={{ ...style, fontSize: size / 4.2 }}>
      {college.shortName}
    </div>
  );
}