import React, { useState } from "react";
import {
  FiUserCheck,
  FiSliders,
  FiImage,
  FiBell,
  FiLock,
  FiActivity,
  FiShield,
} from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";

function SettingsBlock({ icon: Icon, title, text }) {
  return (
    <div className="settings-block" style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ padding: '12px', background: 'var(--hover)', borderRadius: '12px', height: 'fit-content', color: 'var(--violet)' }}>
        <Icon size={24} />
      </div>
      <div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: 'var(--text)' }}>{title}</h4>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '14px' }}>{text}</p>
      </div>
    </div>
  );
}

function SettingsPage() {
  const tabs = [
    "Profile",
    "Preferences",
    "Appearance",
    "Notifications",
    "Security",
  ];
  const [tab, setTab] = useState("Profile");
  return (
    <>
      <PageHeader
        eyebrow="Control"
        title="Settings"
        text="Professional admin configuration with clean tabbed organization and focused security controls."
      />
      <div className="tabs" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {tabs.map((item) => (
          <button
            className={tab === item ? "active" : ""}
            key={item}
            onClick={() => setTab(item)}
            style={{
              padding: '10px 16px',
              borderRadius: '20px',
              border: tab === item ? '1px solid var(--violet)' : '1px solid var(--border)',
              background: tab === item ? 'var(--violet)' : 'var(--surface-strong)',
              color: tab === item ? 'white' : 'var(--text)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="panel settings-panel">
        {tab === "Profile" && (
          <SettingsBlock
            icon={FiUserCheck}
            title="Admin profile"
            text="Update display name, admin avatar, department ownership, and public support contact."
          />
        )}
        {tab === "Preferences" && (
          <SettingsBlock
            icon={FiSliders}
            title="Workspace preferences"
            text="Default page, compact tables, timezone, export format, and dashboard density."
          />
        )}
        {tab === "Appearance" && (
          <SettingsBlock
            icon={FiImage}
            title="Appearance"
            text="Theme, accent color, chart contrast, reduced motion, and presentation mode."
          />
        )}
        {tab === "Notifications" && (
          <SettingsBlock
            icon={FiBell}
            title="Notification rules"
            text="Digest schedules, priority routing, escalation rules, and moderation reminders."
          />
        )}
        {tab === "Security" && (
          <div className="security-grid">
            <SettingsBlock
              icon={FiLock}
              title="Password change"
              text="Require strong password rotation and update recovery email for admin access."
            />
            <SettingsBlock
              icon={FiActivity}
              title="Login activity"
              text="Last login: 11 May 2026, 12:08 PM from Chrome on Windows. No unusual login pattern found."
            />
            <SettingsBlock
              icon={FiShield}
              title="Security alerts"
              text="Critical alerts are sent instantly to the admin email and notification center."
            />
          </div>
        )}
      </div>
    </>
  );
}
export default SettingsPage;