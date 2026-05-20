import { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/common/PageHeader";
import SearchFilter from "../components/common/SearchFilter";
import CrudModal from "../components/common/CrudModal";
import Toast from "../components/common/Toast";
import Modal from "../components/layout/Modal";
import ProfileDetails from "./ProfilePage";
import { useAppData } from "../context/AppDataContext";
import { useFilteredData } from "../utils/hooks";
function UsersPage() {
  const { users, apiRequest, reloadAdminData } = useAppData();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null);
  const [items, setItems] = useState(users);
  const [toast, setToast] = useState("");
  useEffect(() => setItems(users), [users]);
  const filtered = useFilteredData(items, search, [
    "name",
    "email",
    "department",
  ]);
  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };
  const openCreate = () => {
    setEditor({
      mode: "create",
      value: {
        name: "",
        email: "",
        role: "user",
        isBlocked: false,
        avatar: "",
      },
    });
  };
  const openEdit = (user) => {
    setEditor({
      mode: "edit",
      value: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        isBlocked: Boolean(user.isBlocked),
        avatar: user.avatar || "",
      },
    });
  };
  const saveUser = async () => {
    const next = {
      name: editor.value.name,
      email: editor.value.email,
      role: editor.value.role,
      isBlocked: Boolean(editor.value.isBlocked),
      avatar:
        editor.value.avatar ||
        `https://i.pravatar.cc/120?img=${(items.length % 70) + 1}`,
    };

    try {
      if (editor.mode === "create") {
        await apiRequest("/api/admin/users", { method: "POST", body: next });
        showToast("User created successfully");
      } else {
        await apiRequest(`/api/admin/users/${editor.value.id}`, {
          method: "PUT",
          body: next,
        });
      }

      await reloadAdminData();
      setEditor(null);
      setSelected(null);
    } catch (error) {
      showToast(error.message || "Failed to save user");
    }
  };
  const deleteUser = async (user) => {
    await apiRequest(`/api/admin/users/${user.id}`, {
      method: "DELETE",
    });
    await reloadAdminData();
    setSelected(null);
  };
  return (
    <>
      <PageHeader
        eyebrow="Identity"
        title="Users management"
        text="Search, filter, and inspect student profiles with activity statistics and contact information."
        action={
          <button className="primary-button" onClick={openCreate}>
            <FiPlus /> Add user
          </button>
        }
      />
      <SearchFilter
        search={search}
        setSearch={setSearch}
        placeholder="Search users by name, email, department..."
      />
      <div className="panel table-panel">
        <div className="users-table">
          <div className="table-row table-head">
            <span>Profile</span>
            <span>Email</span>
            <span>Contact</span>
            <span>Joined</span>
            <span>Role</span>
            <span />
          </div>
          {filtered.map((user) => (
            <motion.div
              className="table-row"
              key={user.id || user.email}
              whileHover={{ backgroundColor: "var(--hover)" }}
            >
              <span className="profile-cell">
                <img src={user.avatar} alt="" />
                <b>{user.name}</b>
              </span>
              <span>{user.email}</span>
              <span>{user.phone}</span>
              <span>{user.joined}</span>
              <span>
                <span className={`status ${user.isBlocked ? "danger" : ""}`}>
                  {user.status || user.role}
                </span>
              </span>
              <button className="soft-button" onClick={() => setSelected(user)}>
                View
              </button>
              <button className="soft-button" onClick={() => openEdit(user)}>
                <FiEdit /> Edit
              </button>
              <button
                className="danger-button ghost-danger"
                onClick={() => deleteUser(user)}
              >
                <FiTrash2 /> Delete
              </button>
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {selected && (
          <Modal onClose={() => setSelected(null)}>
            <ProfileDetails
              user={selected}
              onEdit={() => openEdit(selected)}
              onDelete={() => deleteUser(selected)}
            />
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editor && (
          <CrudModal
            title={editor.mode === "create" ? "Create user" : "Edit user"}
            description="Map user fields to the user model."
            fields={[
              { name: "name", label: "Name" },
              { name: "email", label: "Email", type: "email" },
              {
                name: "role",
                label: "Role",
                type: "select",
                options: ["user", "moderator", "admin"],
              },
              {
                name: "isBlocked",
                label: "Blocked",
                type: "checkbox",
                required: false,
              },
              { name: "avatar", label: "Avatar URL", required: false },
            ]}
            value={editor.value}
            onChange={(value) => setEditor({ ...editor, value })}
            onSubmit={saveUser}
            onClose={() => setEditor(null)}
            submitLabel={editor.mode === "create" ? "Create user" : "Save user"}
          />
        )}
      </AnimatePresence>
      <Toast message={toast} />
    </>
  );
}
export default UsersPage;
