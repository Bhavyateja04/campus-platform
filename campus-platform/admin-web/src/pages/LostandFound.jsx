import { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "../components/common/PageHeader";
import SearchFilter from "../components/common/SearchFilter";
import CrudModal from "../components/common/CrudModal";
import Modal from "../components/layout/Modal";
import { FiUserCheck, FiMail, FiPhone, FiCompass } from "react-icons/fi";
import Toast from "../components/common/Toast";
import { useAppData } from "../context/AppDataContext";
import { useFilteredData } from "../utils/hooks";

function LostFoundPage() {
  const { lostFoundItems, apiRequest, reloadAdminData } = useAppData();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [posts, setPosts] = useState(lostFoundItems);
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, setToast] = useState("");
  useEffect(() => setPosts(lostFoundItems), [lostFoundItems]);
  const filtered = useFilteredData(posts, search, [
    "title",
    "name",
    "user",
    "location",
  ]).filter((item) => {
    const itemType = item.type || item.category || "Lost";
    return type === "All" || itemType === type;
  });
  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };
  const deletePost = async (item) => {
    await apiRequest(`/api/admin/lost-found/${item.id}`, {
      method: "DELETE",
    });
    await reloadAdminData();
    showToast("Lost & Found post deleted");
  };
  const markResolved = async (item) => {
    await apiRequest(`/api/admin/lost-found/${item.id}`, {
      method: "PUT",
      body: { status: "resolved" },
    });
    await reloadAdminData();
    showToast("Marked as resolved");
  };
  const openCreate = () => {
    setEditor({
      mode: "create",
      value: {
        itemName: "",
        category: "Lost",
        location: "",
        status: "active",
        description: "",
      },
    });
  };
  const openEdit = (item) => {
    const itemName = item.itemName || item.title || item.name || "";
    const itemType = item.category || item.type || "Lost";
    setEditor({
      mode: "edit",
      value: {
        id: item.id,
        itemName,
        category: itemType,
        location: item.location || "",
        status: String(item.status || "active").toLowerCase(),
        description: item.details || item.description || "",
      },
    });
  };
  const savePost = async () => {
    const payload = {
      itemName: editor.value.itemName,
      category: editor.value.category,
      location: editor.value.location,
      status: editor.value.status,
      description: editor.value.description,
    };
    if (editor.mode === "create") {
      await apiRequest("/api/admin/lost-found", {
        method: "POST",
        body: payload,
      });
    } else {
      await apiRequest(`/api/admin/lost-found/${editor.value.id}`, {
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
        eyebrow="Moderation"
        title="Lost & Found command desk"
        text="Manage posts, claims, contact details, fake reports, and user moderation from one polished workflow."
        action={
          <button className="primary-button" onClick={openCreate}>
            <FiPlus /> Add post
          </button>
        }
      />
      <SearchFilter
        search={search}
        setSearch={setSearch}
        placeholder="Search lost and found posts..."
        filters={["All", "Lost", "Found"]}
        selected={type}
        setSelected={setType}
      />
      <div className="card-grid">
        <AnimatePresence>
          {filtered.map((item) => {
            const itemName =
              item.title || item.name || item.itemName || "Untitled post";
            const itemType = String(item.type || item.category || "Lost");
            const itemLocation = item.location || "Location not provided";
            const itemTime = item.time || item.createdAt || "Recent";
            const itemClaims = item.claims ?? 0;
            return (
              <motion.article
                className="item-card"
                key={item.id || itemName}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -8 }}
              >
                <img src={item.image} alt="" />
                <div>
                  <div className="split">
                    <span className={`pill ${itemType.toLowerCase()}`}>
                      {itemType}
                    </span>
                    <span className={`status ${item.blocked ? "danger" : ""}`}>
                      {item.blocked ? "User blocked" : item.status}
                    </span>
                  </div>
                  <h3>{itemName}</h3>
                  <p>
                    {itemLocation} - {itemTime}
                  </p>
                  <small>{itemClaims} claim requests waiting</small>
                  <div className="button-row">
                    <button
                      className="primary-button"
                      onClick={() => setSelected(item)}
                    >
                      View full details
                    </button>
                    <button
                      className="soft-button"
                      onClick={() => openEdit(item)}
                    >
                      <FiEdit /> Edit
                    </button>
                    <button
                      className="soft-button"
                      onClick={() => markResolved(item)}
                    >
                      Mark resolved
                    </button>
                    <button
                      className="danger-button ghost-danger"
                      onClick={() => setPendingDelete(item)}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="panel moderation-panel">
        <h3>Admin moderation panel</h3>
        <p>
          Spam queue: 12 reports - Fake claim confidence: 88% - Auto-hidden
          posts: 4
        </p>
      </div>
      <AnimatePresence>
        {selected && (
          <Modal onClose={() => setSelected(null)} wide>
            <LostFoundDetails
              item={selected}
              onApproveClaim={() => markResolved(selected)}
              onMarkSpam={() => deletePost(selected)}
            />
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {pendingDelete && (
          <Modal onClose={() => setPendingDelete(null)}>
            <h2>Delete suspicious post?</h2>
            <p>
              This will remove "{pendingDelete.title}" from Lost & Found
              moderation queues.
            </p>
            <div className="button-row">
              <button
                className="danger-button"
                onClick={() => deletePost(pendingDelete)}
              >
                Delete post
              </button>
              <button
                className="soft-button"
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editor && (
          <CrudModal
            title={
              editor.mode === "create"
                ? "Create lost/found post"
                : "Edit lost/found post"
            }
            description="Map post details to the LostFound model."
            fields={[
              { name: "itemName", label: "Item name" },
              {
                name: "category",
                label: "Category",
                type: "select",
                options: ["Lost", "Found"],
              },
              { name: "location", label: "Location" },
              {
                name: "status",
                label: "Status",
                type: "select",
                options: ["active", "resolved", "claimed"],
              },
              { name: "description", label: "Description", type: "textarea" },
            ]}
            value={editor.value}
            onChange={(value) => setEditor({ ...editor, value })}
            onSubmit={savePost}
            onClose={() => setEditor(null)}
            submitLabel={editor.mode === "create" ? "Create post" : "Save post"}
            wide
          />
        )}
      </AnimatePresence>
      <Toast message={toast} />
    </>
  );
}
function LostFoundDetails({ item, onApproveClaim, onMarkSpam }) {
  const itemName = item.title || item.name || item.itemName || "Untitled post";
  const itemType = String(item.type || item.category || "Lost");
  const itemDetails =
    item.details || item.description || "No additional details provided.";
  const itemLocation = item.location || "Location not provided";
  const itemUser = item.user || "Unknown user";
  const itemEmail = item.email || "Not provided";
  const itemPhone = item.phone || "Not provided";
  const analysisSummary =
    item.aiAnalysis?.summary ||
    item.aiAnalysis?.reason ||
    item.aiAnalysis?.message ||
    (item.aiAnalysis ? "AI analysis available" : "No AI analysis available.");

  return (
    <div className="side-detail">
      <img src={item.image} alt="" />
      <div>
        <span className={`pill ${itemType.toLowerCase()}`}>{itemType}</span>
        <h2>{itemName}</h2>
        <p>{itemDetails}</p>
        <div className="detail-grid">
          <span>
            <FiUserCheck /> {itemUser}
          </span>
          <span>
            <FiMail /> {itemEmail}
          </span>
          <span>
            <FiPhone /> {itemPhone}
          </span>
          <span>
            <FiCompass /> {itemLocation}
          </span>
        </div>
        {(item.aiAnalysis || item.matchSuggestions?.length) && (
          <div className="panel" style={{ marginTop: 16 }}>
            <h4>AI review</h4>
            <p>{analysisSummary}</p>
            {item.imageSimilarityPercentage != null && (
              <p>
                Image similarity: <b>{item.imageSimilarityPercentage}%</b>
              </p>
            )}
            {!!item.matchSuggestions?.length && (
              <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                {item.matchSuggestions.slice(0, 3).map((match) => (
                  <div
                    key={match.id}
                    className="soft-card"
                    style={{ padding: 10 }}
                  >
                    <strong>{match.itemName}</strong>
                    <div style={{ fontSize: 13, opacity: 0.8 }}>
                      {match.similarity}% match · {match.location}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      {match.summary}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="button-row">
          <button className="primary-button" onClick={onApproveClaim}>
            Approve claim
          </button>
          <button className="danger-button" onClick={onMarkSpam}>
            Mark spam/fake
          </button>
        </div>
      </div>
    </div>
  );
}
export default LostFoundPage;
