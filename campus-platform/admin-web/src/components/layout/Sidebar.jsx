import React from "react";
import { FiActivity } from "react-icons/fi";
import { motion } from "framer-motion";
import { sidebarItems } from "../../data/sidebarItems";

function Sidebar({ activePage, setActivePage, open, close }) {
  return (
    <>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">C</div>
          <div>
            <strong>CampusAdmin</strong>
            <span>Command center</span>
          </div>
        </div>
        <nav>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                className={`nav-item ${isActive ? "active" : ""}`}
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  close();
                }}
              >
                {isActive && (
                  <motion.span layoutId="active-pill" className="active-pill" />
                )}
                <Icon />
                <span>{item.label}</span>
                {item.badge && <em>{item.badge}</em>}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-card">
          <FiActivity />
          <strong>Live campus pulse</strong>
          <span>94% systems healthy</span>
        </div>
      </aside>
      {open && (
        <button className="scrim" onClick={close} aria-label="Close sidebar" />
      )}
    </>
  );
}

export default Sidebar;
