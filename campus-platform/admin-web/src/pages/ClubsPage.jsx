import { useState, useEffect } from "react";

import {
  FiPlus,
  FiEdit,
} from "react-icons/fi";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import PageHeader from "../components/common/PageHeader";

import CrudModal from "../components/common/CrudModal";

import Progress from "../components/common/Progress";

import { useAppData } from "../context/AppDataContext";

function ClubsPage() {
  const {
    clubs,
    apiRequest,
    reloadAdminData,
  } = useAppData();

  const [items, setItems] =
    useState(clubs);

  const [editor, setEditor] =
    useState(null);

  useEffect(() => {
    setItems(clubs);
  }, [clubs]);

  const openCreate = () => {
    setEditor({
      mode: "create",

      value: {
        clubName: "",
        coordinator: "",
        description: "",
        banner: null,
        isActive: true,
      },
    });
  };

  const openEdit = (club) => {
    setEditor({
      mode: "edit",

      value: {
        id: club.id,
        clubName: club.name,
        coordinator:
          club.coordinator || "",
        description:
          club.event || "",
        banner:
          club.banner || null,
        isActive:
          club.isActive !== false,
      },
    });
  };

  const saveClub = async () => {
    const payload = {
      clubName:
        editor.value.clubName,

      coordinator:
        editor.value.coordinator,

      description:
        editor.value.description,

      banner:
        editor.value.banner,

      isActive: Boolean(
        editor.value.isActive
      ),
    };

    if (editor.mode === "create") {
      await apiRequest(
        "/api/admin/clubs",
        {
          method: "POST",
          body: payload,
        }
      );
    } else {
      await apiRequest(
        `/api/admin/clubs/${editor.value.id}`,
        {
          method: "PUT",
          body: payload,
        }
      );
    }

    await reloadAdminData();

    setEditor(null);
  };

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Clubs Management"
        text="Track club activities, members, coordinators, and engagement."
        action={
          <button
            className="primary-button"
            onClick={openCreate}
          >
            <FiPlus />
            Add Club
          </button>
        }
      />

      <div className="club-grid">
        {items.map((club) => (
          <motion.article
            className="club-card"
            key={club.name}
            whileHover={{
              y: -8,
            }}
          >
            <img
              src={
                club.banner ||
                "https://via.placeholder.com/400x200"
              }
              alt=""
            />

            <div className="club-content">
              <h3>{club.name}</h3>

              <p>
                Coordinator:{" "}
                {club.coordinator ||
                  "Not Assigned"}
              </p>

              <p>
                Event:{" "}
                {club.event ||
                  "No Event"}
              </p>

              <div className="metric-row">
                <span>
                  {club.members || 0}{" "}
                  members
                </span>

                <span>
                  {club.requests || 0}{" "}
                  requests
                </span>
              </div>

              <Progress
                value={
                  club.engagement || 0
                }
              />

              <div className="button-row">
                <button className="primary-button">
                  Review Requests
                </button>

                <button
                  className="soft-button"
                  onClick={() =>
                    openEdit(club)
                  }
                >
                  <FiEdit />
                  Edit
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <AnimatePresence>
        {editor && (
          <CrudModal
            title={
              editor.mode ===
              "create"
                ? "Create Club"
                : "Edit Club"
            }
            description="Add or update club details."
            fields={[
              {
                name: "clubName",
                label:
                  "Club Name",
              },

              {
                name:
                  "coordinator",
                label:
                  "Coordinator Name",
              },

              {
                name:
                  "description",
                label:
                  "Description",
                type: "textarea",
              },

              {
                name: "banner",
                label:
                  "Club Image",
                type: "file",
              },

              {
                name: "isActive",
                label: "Active",
                type:
                  "checkbox",
                required: false,
              },
            ]}
            value={editor.value}
            onChange={(value) =>
              setEditor({
                ...editor,
                value,
              })
            }
            onSubmit={saveClub}
            onClose={() =>
              setEditor(null)
            }
            submitLabel={
              editor.mode ===
              "create"
                ? "Create Club"
                : "Save Changes"
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default ClubsPage;