import React from "react";

export default function Progress({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="progress" aria-hidden>
      <i style={{ width: `${pct}%` }} />
      <b>{pct}%</b>
    </div>
  );
}
