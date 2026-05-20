import { useState, useEffect } from "react";
import { FiBell, FiSend, FiAlertTriangle, FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/common/PageHeader";
import SearchFilter from "../components/common/SearchFilter";
import Modal from "../components/layout/Modal";
import StatCard from "../components/dashboard/StatCard";
import Toast from "../components/common/Toast";
import { useAppData } from "../context/AppDataContext";
import { useFilteredData, normalizeNotifications } from "../utils/hooks";
function NotificationsPage() {
  const { notifications, apiRequest, reloadAdminData } = useAppData();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(0);
  const [items, setItems] = useState(notifications);
  const [showComposer, setShowComposer] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    title: "",
    body: "",
    priority: "Medium",
    audience: "All Students",
  });
  const filtered = useFilteredData(items, search, [
    "title",
    "priority",
    "body",
  ]);
  useEffect(() => setItems(notifications), [notifications]);
  const sendNotification = async (event) => {
    event.preventDefault();
    const result = await apiRequest("/api/admin/notifications", {
      method: "POST",
      body: {
        title: form.title,
        body: form.body,
        priority: form.priority,
        audience: form.audience,
        unread: true,
      },
    });
    if (result?.data) {
      setItems([normalizeNotifications([result.data])[0], ...items]);
    }
    await reloadAdminData();
    setForm({
      title: "",
      body: "",
      priority: "Medium",
      audience: "All Students",
    });
    setShowComposer(false);
    setToast("Notification sent successfully");
    window.setTimeout(() => setToast(""), 2200);
  };
  return (
    <>
      <PageHeader
        eyebrow="Alerts"
        title="Notification center"
        text="Compact collapsible admin notifications with priority, read state, timestamp, and clear sender context."
        action={
          <button
            className="primary-button"
            onClick={() => setShowComposer(true)}
          >
            <FiSend /> Send notification
          </button>
        }
      />
      <SearchFilter
        search={search}
        setSearch={setSearch}
        placeholder="Search notifications..."
      />
      <div className="notification-summary">
        <StatCard
          icon={FiBell}
          label="Unread alerts"
          value={String(items.filter((note) => note.unread).length)}
          change="Visible now"
          tone="violet"
        />
        <StatCard
          icon={FiSend}
          label="Sent today"
          value="18"
          change="+4 this hour"
          tone="green"
        />
        <StatCard
          icon={FiAlertTriangle}
          label="High priority"
          value={String(
            items.filter((note) => note.priority === "High").length,
          )}
          change="Needs attention"
          tone="amber"
        />
      </div>
      <div className="notification-stack">
        {filtered.map((note, index) => (
          <motion.article
            className={`notification-card ${note.unread ? "unread" : ""}`}
            key={note.title}
            layout
          >
            <button onClick={() => setOpen(open === index ? -1 : index)}>
              <span>
                <b>{note.title}</b>
                <small>
                  <i className="unread-dot" /> Sent by Admin - {note.time}
                </small>
              </span>
              <em className={`priority ${note.priority.toLowerCase()}`}>
                {note.priority}
              </em>
              <motion.span animate={{ rotate: open === index ? 180 : 0 }}>
                <FiChevronDown />
              </motion.span>
            </button>
            <AnimatePresence>
              {open === index && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  {note.body}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.article>
        ))}
      </div>
      <motion.button
        className="fab-button"
        onClick={() => setShowComposer(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
      >
        <motion.span
          animate={{ rotate: [0, -12, 12, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.8 }}
        >
          <FiBell />
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {showComposer && (
          <Modal onClose={() => setShowComposer(false)}>
            <form className="notification-form" onSubmit={sendNotification}>
              <h2>Send notification</h2>
              <label>
                Title
                <input
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="Enter notification title"
                />
              </label>
              <label>
                Description
                <textarea
                  required
                  value={form.body}
                  onChange={(event) =>
                    setForm({ ...form, body: event.target.value })
                  }
                  placeholder="Write a compact admin message"
                />
              </label>
              <label>
                Priority
                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm({ ...form, priority: event.target.value })
                  }
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
              <label>
                Audience
                <select
                  value={form.audience}
                  onChange={(event) =>
                    setForm({ ...form, audience: event.target.value })
                  }
                >
                  <option>All Students</option>
                  <option>Final Year</option>
                  <option>Club Admins</option>
                  <option>Marketplace Sellers</option>
                </select>
              </label>
              <button className="primary-button" type="submit">
                <FiSend /> Send now
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
      <Toast message={toast} />
    </>
  );
}
export default NotificationsPage;
