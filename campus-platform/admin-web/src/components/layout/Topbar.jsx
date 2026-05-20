import React from "react";
import { FiMenu, FiSearch, FiPlus, FiMoon, FiSun, FiBell } from "react-icons/fi";

function Topbar({ title, onMenu, theme, setTheme }) {
  return (
    <header className="topbar">
      <button
        className="icon-button mobile-only"
        onClick={onMenu}
        aria-label="Open menu"
      >
        <FiMenu />
      </button>
      <div>
        <p>Admin Workspace</p>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <label className="global-search">
          <FiSearch />
          <input placeholder="Search campus data..." />
        </label>
        <button
          className="icon-button"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label="Toggle theme"
        >
          {theme === "light" ? <FiMoon /> : <FiSun />}
        </button>

        <button className="icon-button badge-dot" aria-label="Notifications">
          <FiBell />
        </button>
      </div>
    </header>
  );
}

export default Topbar;