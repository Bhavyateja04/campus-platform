import { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/common/PageHeader";
import SearchFilter from "../components/common/SearchFilter";
import CrudModal from "../components/common/CrudModal";
import Modal from "../components/layout/Modal";
import { useAppData } from "../context/AppDataContext";
import { useFilteredData } from "../utils/hooks";
function PlacementsPage() {
  const { placements, apiRequest, reloadAdminData } = useAppData();
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState(placements);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [editor, setEditor] = useState(null);
  useEffect(() => setPosts(placements), [placements]);
  const filtered = useFilteredData(posts, search, ["company", "role"]);
  const openCreate = () => {
    setEditor({
      mode: "create",
      value: {
        companyName: "",
        role: "",
        package: "",
        description: "",
        tips: "",
      },
    });
  };
  const openEdit = (job) =>
    setEditor({
      mode: "edit",
      value: {
        id: job.id,
        companyName: job.company,
        role: job.role,
        package: job.package,
        description: job.desc || "",
        tips: job.tips || "",
      },
    });
  const savePlacement = async () => {
    const payload = {
      companyName: editor.value.companyName,
      role: editor.value.role,
      package: editor.value.package,
      description: editor.value.description,
      tips: editor.value.tips,
    };
    if (editor.mode === "create") {
      await apiRequest("/api/admin/placements", {
        method: "POST",
        body: payload,
      });
    } else {
      await apiRequest(`/api/admin/placements/${editor.value.id}`, {
        method: "PUT",
        body: payload,
      });
    }
    await reloadAdminData();
    setEditor(null);
  };
  const deletePlacement = async (job) => {
    await apiRequest(`/api/admin/placements/${job.id}`, { method: "DELETE" });
    await reloadAdminData();
    setPendingDelete(null);
  };
  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Placement management"
        text="Review company posts, salary data, application deadlines, applicants, and deletion approvals."
        action={
          <button className="primary-button" onClick={openCreate}>
            <FiPlus /> Add placement
          </button>
        }
      />
      <SearchFilter
        search={search}
        setSearch={setSearch}
        placeholder="Search companies or roles..."
      />
      <div className="placement-grid">
        {filtered.map((job) => (
          <motion.article
            className="placement-card"
            key={job.company}
            whileHover={{ y: -8 }}
          >
            <div className="company-logo">{job.logo}</div>
            <h3>{job.company}</h3>
            <strong>{job.role}</strong>
            <p>{job.desc}</p>
            <div className="metric-row">
              <span>{job.package}</span>
              <span>{job.deadline}</span>
              <span>{job.applicants} applicants</span>
            </div>
            <button className="soft-button" onClick={() => openEdit(job)}>
              <FiEdit /> Edit
            </button>
            <button
              className="danger-button"
              onClick={() => setPendingDelete(job)}
            >
              <FiTrash2 /> Delete placement post
            </button>
          </motion.article>
        ))}
      </div>
      <div className="panel moderation-panel">
        <h3>Admin review panel</h3>
        <p>
          5 posts pending legal review · 2 compensation edits requested · 11
          company profiles verified
        </p>
      </div>
      <AnimatePresence>
        {pendingDelete && (
          <Modal onClose={() => setPendingDelete(null)}>
            <h2>Confirm deletion</h2>
            <p>
              Delete the {pendingDelete.company} placement post? This action
              removes it from student discovery.
            </p>
            <div className="button-row">
              <button
                className="danger-button"
                onClick={() => deletePlacement(pendingDelete)}
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
              editor.mode === "create" ? "Create placement" : "Edit placement"
            }
            description="Map company post fields to the PlacementExperience model."
            fields={[
              { name: "companyName", label: "Company name" },
              { name: "role", label: "Role" },
              { name: "package", label: "Package" },
              { name: "description", label: "Description", type: "textarea" },
              {
                name: "tips",
                label: "Tips",
                type: "textarea",
                required: false,
              },
            ]}
            value={editor.value}
            onChange={(value) => setEditor({ ...editor, value })}
            onSubmit={savePlacement}
            onClose={() => setEditor(null)}
            submitLabel={
              editor.mode === "create" ? "Create placement" : "Save placement"
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default PlacementsPage;
