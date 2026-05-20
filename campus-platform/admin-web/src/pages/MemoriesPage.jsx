import { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import {
  FiEye,
  FiHeart,
  FiAlertTriangle,
  FiMessageCircle,
  FiShare2,
} from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "../components/common/PageHeader";
import CrudModal from "../components/common/CrudModal";
import SearchFilter from "../components/common/SearchFilter";
import StatCard from "../components/dashboard/StatCard";
import Toast from "../components/common/Toast";
import Progress from "../components/common/Progress";
import { useAppData } from "../context/AppDataContext";
import { useFilteredData } from "../utils/hooks";
function MemoriesPage() {
  const { memories, apiRequest, reloadAdminData } = useAppData();
  const [items, setItems] = useState(memories);
  const [tab, setTab] = useState("Approved");
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState(null);
  const tabs = ["Approved", "Pending", "AI Flagged", "Reported"];
  useEffect(() => setItems(memories), [memories]);
  const filtered = useFilteredData(items, search, [
    "user",
    "caption",
    "status",
  ]).filter((memory) => memory.status === tab);
  const updateMemory = (caption, patch) =>
    setItems(
      items.map((item) =>
        item.caption === caption ? { ...item, ...patch } : item,
      ),
    );
  const deleteMemory = (caption) =>
    setItems(items.filter((item) => item.caption !== caption));
  const pushMemoryUpdate = async (memory, patch) => {
    const nextPatch = {
      title: memory.caption,
      description: memory.complaint || memory.caption,
      images: [memory.image],
      ...patch,
    };

    await apiRequest(`/api/admin/memories/${memory.id}`, {
      method: "PUT",
      body: nextPatch,
    });
    await reloadAdminData();
  };
  const removeMemory = async (memory) => {
    await apiRequest(`/api/admin/memories/${memory.id}`, {
      method: "DELETE",
    });
    await reloadAdminData();
  };
  const openCreate = () => {
    setEditor({
      mode: "create",
      value: {
        title: "",
        description: "",
        images: "",
        isActive: true,
      },
    });
  };
  const openEdit = (memory) =>
    setEditor({
      mode: "edit",
      value: {
        id: memory.id,
        title: memory.caption,
        description: memory.complaint || "",
        images: memory.image || "",
        isActive: memory.status !== "Reported",
      },
    });
  const saveMemory = async () => {
    const payload = {
      title: editor.value.title,
      description: editor.value.description,
      images: editor.value.images
        ? editor.value.images
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
      isActive: Boolean(editor.value.isActive),
    };
    if (editor.mode === "create") {
      await apiRequest("/api/admin/memories", {
        method: "POST",
        body: payload,
      });
    } else {
      await apiRequest(`/api/admin/memories/${editor.value.id}`, {
        method: "PUT",
        body: payload,
      });
    }
    await reloadAdminData();
    setEditor(null);
  };
  return (
    <>
      <PageHeader
        eyebrow="Social"
        title="Campus memories"
        text="Moderate visual posts, likes, shares, comments, blocked users, and engagement analytics."
        action={
          <button className="primary-button" onClick={openCreate}>
            <FiPlus /> Add memory
          </button>
        }
      />
      <div className="memory-tabs">
        {tabs.map((item) => (
          <button
            className={tab === item ? "active" : ""}
            key={item}
            onClick={() => setTab(item)}
          >
            <span>{item}</span>
            <b>{items.filter((memory) => memory.status === item).length}</b>
          </button>
        ))}
      </div>
      <SearchFilter
        search={search}
        setSearch={setSearch}
        placeholder="Filter memories by user, caption, status..."
      />
      <div className="notification-summary">
        <StatCard
          icon={FiEye}
          label="Views in tab"
          value={filtered
            .reduce((sum, item) => sum + item.views, 0)
            .toLocaleString()}
          change="Dynamic counter"
          tone="blue"
        />
        <StatCard
          icon={FiHeart}
          label="Likes in tab"
          value={filtered
            .reduce((sum, item) => sum + item.likes, 0)
            .toLocaleString()}
          change="Live social signal"
          tone="green"
        />
        <StatCard
          icon={FiAlertTriangle}
          label="Reports in tab"
          value={String(filtered.reduce((sum, item) => sum + item.reports, 0))}
          change="Moderation queue"
          tone="amber"
        />
      </div>
      <div className="memory-grid">
        <AnimatePresence>
          {filtered.map((memory) => (
            <motion.article
              className="memory-card"
              key={memory.caption}
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              whileHover={{ y: -8 }}
            >
              <img src={memory.image} alt="" />
              <div>
                <div className="split">
                  <b>{memory.user}</b>
                  <span
                    className={`status ${memory.status === "AI Flagged" || memory.blocked ? "danger" : ""}`}
                  >
                    {memory.blocked ? "Blocked" : memory.status}
                  </span>
                </div>
                <p>{memory.caption}</p>
                {(memory.status === "AI Flagged" ||
                  memory.status === "Reported") && (
                  <div className="ai-panel">
                    <span>
                      <FiAlertTriangle />{" "}
                      {memory.status === "AI Flagged"
                        ? "AI moderation indicator"
                        : `${memory.reports} user reports`}
                    </span>
                    <Progress value={memory.risk} />
                    <small>{memory.complaint}</small>
                  </div>
                )}
                <div className="memory-actions">
                  <button>
                    <FiHeart /> Like
                  </button>
                  <button>
                    <FiMessageCircle /> Comment
                  </button>
                  <button>
                    <FiShare2 /> Share
                  </button>
                </div>
                <div className="metric-row">
                  <span>
                    <FiEye /> {memory.views.toLocaleString()} views
                  </span>
                  <span>
                    <FiHeart /> {memory.likes.toLocaleString()} likes
                  </span>
                  <span>{memory.reports} reports</span>
                </div>
                <div className="button-row">
                  <button
                    className="soft-button"
                    onClick={() => openEdit(memory)}
                  >
                    <FiEdit /> Edit
                  </button>
                  <button
                    className="primary-button"
                    onClick={() =>
                      pushMemoryUpdate(memory, {
                        status: "Approved",
                        blocked: false,
                      })
                    }
                  >
                    Approve
                  </button>
                  <button
                    className="danger-button"
                    onClick={() => pushMemoryUpdate(memory, { blocked: true })}
                  >
                    Block User
                  </button>
                  <button
                    className="soft-button"
                    onClick={() => pushMemoryUpdate(memory, { blocked: false })}
                  >
                    Unblock
                  </button>
                  <button
                    className="danger-button ghost-danger"
                    onClick={() => removeMemory(memory)}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
      <div className="panel moderation-panel">
        <h3>Content moderation panel</h3>
        <p>
          AI review confidence: 92% - Copyright flags: 1 - Reported comments: 7
        </p>
      </div>
      <AnimatePresence>
        {editor && (
          <CrudModal
            title={editor.mode === "create" ? "Create memory" : "Edit memory"}
            description="Map memory fields to the Memory model."
            fields={[
              { name: "title", label: "Title" },
              { name: "description", label: "Description", type: "textarea" },
              {
                name: "images",
                label: "Images (comma separated URLs)",
                required: false,
              },
              {
                name: "isActive",
                label: "Active",
                type: "checkbox",
                required: false,
              },
            ]}
            value={editor.value}
            onChange={(value) => setEditor({ ...editor, value })}
            onSubmit={saveMemory}
            onClose={() => setEditor(null)}
            submitLabel={
              editor.mode === "create" ? "Create memory" : "Save memory"
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}
export default MemoriesPage;
