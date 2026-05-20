import { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiPackage, FiUpload } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/common/PageHeader";
import SearchFilter from "../components/common/SearchFilter";
import CrudModal from "../components/common/CrudModal";
import Modal from "../components/layout/Modal";
import Toast from "../components/common/Toast";
import { useAppData } from "../context/AppDataContext";
import { useFilteredData } from "../utils/hooks";
import { cloneRecord } from "../utils/helpers";
function CanteensPage() {
  const { canteens, foodItems, apiRequest, reloadAdminData } = useAppData();
  const [selectedName, setSelectedName] = useState(canteens[0]?.name || "");
  const [canteenItems, setCanteenItems] = useState(canteens);
  const [foodCatalog, setFoodCatalog] = useState(foodItems);
  const [menusByCanteen, setMenusByCanteen] = useState(() =>
    Object.fromEntries(
      canteens.map((canteen) => [canteen.name, canteen.menus]),
    ),
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [lightbox, setLightbox] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingDeleteCanteen, setPendingDeleteCanteen] = useState(null);
  const [editor, setEditor] = useState(null);
  const [toast, setToast] = useState("");
  const selected =
    canteenItems.find((canteen) => canteen.name === selectedName) ||
    canteenItems[0];
  const menus = menusByCanteen[selectedName] || selected?.menus || [];
  useEffect(() => {
    if (!selectedName && canteens[0]) setSelectedName(canteens[0].name);
    setCanteenItems(canteens);
    setFoodCatalog(foodItems);
    setMenusByCanteen(
      Object.fromEntries(
        canteens.map((canteen) => [canteen.name, canteen.menus || []]),
      ),
    );
  }, [canteens, foodItems, selectedName]);
  const categories = [
    "All",
    ...new Set(foodCatalog.map((item) => item.category)),
  ];
  const filteredFood = useFilteredData(foodCatalog, search, [
    "name",
    "category",
  ]).filter((item) => category === "All" || item.category === category);
  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };
  const openCreateCanteen = () => {
    setEditor({
      kind: "canteen",
      mode: "create",
      value: { name: "", location: "Campus", isActive: true },
    });
  };
  const openEditCanteen = (canteen) => {
    setEditor({
      kind: "canteen",
      mode: "edit",
      value: {
        id: canteen.id,
        name: canteen.name,
        location: canteen.location || "Campus",
        isActive: canteen.isActive !== false,
      },
    });
  };
  const saveCanteen = async () => {
    const next = {
      name: editor.value.name,
      location: editor.value.location,
      isActive: Boolean(editor.value.isActive),
      menu: (menusByCanteen[editor.value.name] || menus || []).map((image) => ({
        image,
      })),
    };
    if (editor.mode === "create") {
      await apiRequest("/api/admin/canteens", { method: "POST", body: next });
    } else {
      await apiRequest(`/api/admin/canteens/${editor.value.id}`, {
        method: "PUT",
        body: next,
      });
    }
    await reloadAdminData();
    setSelectedName(next.name);
    setEditor(null);
    showToast(editor.mode === "create" ? "Canteen created" : "Canteen saved");
  };
  const deleteCanteen = async (canteenName) => {
    const target = canteenItems.find((item) => item.name === canteenName);
    if (!target) return;
    await apiRequest(`/api/admin/canteens/${target.id}`, { method: "DELETE" });
    await reloadAdminData();
    setSelectedName((current) =>
      current === canteenName ? canteenItems[0]?.name || "" : current,
    );
    setPendingDeleteCanteen(null);
    showToast("Canteen deleted");
  };
  const openCreateFood = () => {
    setEditor({
      kind: "food",
      mode: "create",
      value: {
        name: "",
        price: "",
        category: "Snacks",
        available: true,
        badge: "Fresh",
        image: "",
      },
    });
  };
  const openEditFood = (item) =>
    setEditor({ kind: "food", mode: "edit", value: cloneRecord(item) });
  const saveFood = async () => {
    const next = {
      name: editor.value.name,
      price: Number(editor.value.price),
      category: editor.value.category,
      available: Boolean(editor.value.available),
      badge: editor.value.badge,
      image: editor.value.image,
    };
    if (editor.mode === "create") {
      await apiRequest("/api/admin/food-items", { method: "POST", body: next });
    } else {
      await apiRequest(`/api/admin/food-items/${editor.value.id}`, {
        method: "PUT",
        body: next,
      });
    }
    await reloadAdminData();
    setEditor(null);
    showToast(
      editor.mode === "create" ? "Food item created" : "Food item saved",
    );
  };
  const deleteFood = async (item) => {
    await apiRequest(`/api/admin/food-items/${item.id}`, {
      method: "DELETE",
    });
    await reloadAdminData();
    showToast("Food item deleted");
  };
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  const addMenuFiles = (files) => {
    const uploads = [...files]
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => fileToDataUrl(file));
    if (!uploads.length || !selected?.id) return;
    Promise.all(uploads)
      .then(async (images) => {
        const nextMenus = [...menus, ...images];
        await apiRequest(`/api/admin/canteens/${selected.id}`, {
          method: "PUT",
          body: {
            name: selected.name,
            location: selected.location,
            isActive: selected.isActive,
            menu: nextMenus.map((image) => ({ image })),
          },
        });
        await reloadAdminData();
        setMenusByCanteen({
          ...menusByCanteen,
          [selectedName]: nextMenus,
        });
        showToast("Menu image uploaded successfully");
      })
      .catch((error) => {
        console.warn("Menu upload failed:", error.message || error);
      });
  };
  return (
    <>
      <PageHeader
        eyebrow="Dining"
        title="Canteen menu gallery"
        text="Choose a canteen and jump directly into menu posters, food cards, uploads, edits, deletes, and lightbox previews."
        action={
          <button className="primary-button" onClick={openCreateCanteen}>
            <FiPlus /> Add canteen
          </button>
        }
      />
      <div className="canteen-layout">
        <div className="canteen-list">
          {canteenItems.map((canteen) => (
            <motion.button
              className={selectedName === canteen.name ? "active" : ""}
              key={canteen.name}
              onClick={() => setSelectedName(canteen.name)}
              whileHover={{ x: 8 }}
            >
              <FiPackage />
              <span>{canteen.name}</span>
            </motion.button>
          ))}
        </div>
        <motion.div
          className="panel canteen-profile dark-food-panel"
          key={selected.name}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="panel-title">
            <h3>{selected.name}</h3>
            <div className="button-row">
              <button
                className="soft-button"
                onClick={() => openEditCanteen(selected)}
              >
                <FiEdit /> Edit canteen
              </button>
              <button
                className="danger-button ghost-danger"
                onClick={() => setPendingDeleteCanteen(selected.name)}
              >
                <FiTrash2 /> Delete canteen
              </button>
              <label className="primary-button upload-trigger">
                <FiPlus /> Add Menu
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => addMenuFiles(event.target.files)}
                />
              </label>
            </div>
          </div>
          <label
            className="drop-zone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              addMenuFiles(event.dataTransfer.files);
            }}
          >
            <FiUpload />
            <span>Drag and drop menu images here, or click Add Menu</span>
          </label>
          <motion.div className="menu-gallery" layout>
            <AnimatePresence>
              {menus.map((menu, index) => (
                <motion.article
                  className="menu-poster-card"
                  key={menu}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  whileHover={{ y: -8 }}
                >
                  <button
                    className="image-button"
                    onClick={() => setLightbox(menu)}
                  >
                    <img
                      src={menu}
                      alt={`${selected.name} menu ${index + 1}`}
                      loading="lazy"
                    />
                  </button>
                  <div className="button-row">
                    <button
                      className="soft-button"
                      onClick={() => showToast("Menu edit mode opened")}
                    >
                      Edit
                    </button>
                    <button
                      className="danger-button"
                      onClick={() => setPendingDelete(menu)}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
          <SearchFilter
            search={search}
            setSearch={setSearch}
            placeholder="Search food items..."
            filters={categories}
            selected={category}
            setSelected={setCategory}
          />
          <div className="button-row" style={{ marginBottom: 10 }}>
            <button className="primary-button" onClick={openCreateFood}>
              <FiPlus /> Add food item
            </button>
          </div>
          <div className="food-grid">
            {filteredFood.map((item, index) => (
              <motion.article
                className="food-card"
                key={item.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.src = "/menus/pencil-canteen.png";
                  }}
                />
                <div>
                  <span className="pill">{item.category}</span>
                  <em>{item.badge}</em>
                  <h3>{item.name}</h3>
                  <strong>{item.price}</strong>
                  <small
                    className={item.available ? "available" : "unavailable"}
                  >
                    {item.available ? "Available now" : "Currently unavailable"}
                  </small>
                  <div className="button-row" style={{ marginTop: 12 }}>
                    <button
                      className="soft-button"
                      onClick={() => openEditFood(item)}
                    >
                      <FiEdit /> Edit
                    </button>
                    <button
                      className="danger-button ghost-danger"
                      onClick={() => deleteFood(item)}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
      <AnimatePresence>
        {lightbox && (
          <Modal onClose={() => setLightbox(null)} wide>
            <img className="lightbox-image" src={lightbox} alt="" />
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {pendingDelete && (
          <Modal onClose={() => setPendingDelete(null)}>
            <h2>Delete menu image?</h2>
            <p>This removes the selected poster from {selectedName}.</p>
            <div className="button-row">
              <button
                className="danger-button"
                onClick={async () => {
                  try {
                    const nextMenus = menus.filter(
                      (menu) => menu !== pendingDelete,
                    );
                    await apiRequest(`/api/admin/canteens/${selected.id}`, {
                      method: "PUT",
                      body: {
                        name: selected.name,
                        location: selected.location,
                        isActive: selected.isActive,
                        menu: nextMenus.map((image) => ({ image })),
                      },
                    });
                    await reloadAdminData();
                    setMenusByCanteen({
                      ...menusByCanteen,
                      [selectedName]: nextMenus,
                    });
                    showToast("Menu image deleted");
                  } catch (error) {
                    console.warn("Menu delete failed:", error.message || error);
                  }
                  setPendingDelete(null);
                }}
              >
                Delete image
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
        {editor && editor.kind === "canteen" && (
          <CrudModal
            title={editor.mode === "create" ? "Create canteen" : "Edit canteen"}
            description="Map canteen fields to the Canteen model."
            fields={[
              { name: "name", label: "Canteen name" },
              { name: "location", label: "Location" },
              {
                name: "isActive",
                label: "Active",
                type: "checkbox",
                required: false,
              },
            ]}
            value={editor.value}
            onChange={(value) => setEditor({ ...editor, value })}
            onSubmit={saveCanteen}
            onClose={() => setEditor(null)}
            submitLabel={
              editor.mode === "create" ? "Create canteen" : "Save canteen"
            }
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editor && editor.kind === "food" && (
          <CrudModal
            title={
              editor.mode === "create" ? "Create food item" : "Edit food item"
            }
            description="Map menu item fields to the food item model."
            fields={[
              { name: "name", label: "Item name" },
              { name: "price", label: "Price" },
              { name: "category", label: "Category" },
              {
                name: "available",
                label: "Available",
                type: "checkbox",
                required: false,
              },
              { name: "badge", label: "Badge" },
              { name: "image", label: "Image URL", required: false },
            ]}
            value={editor.value}
            onChange={(value) => setEditor({ ...editor, value })}
            onSubmit={saveFood}
            onClose={() => setEditor(null)}
            submitLabel={editor.mode === "create" ? "Create item" : "Save item"}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {pendingDeleteCanteen && (
          <Modal onClose={() => setPendingDeleteCanteen(null)}>
            <h2>Delete canteen?</h2>
            <p>This will remove {pendingDeleteCanteen} and its menu images.</p>
            <div className="button-row">
              <button
                className="danger-button"
                onClick={async () => {
                  const target = canteenItems.find(
                    (item) => item.name === pendingDeleteCanteen,
                  );
                  if (!target) return;
                  try {
                    await apiRequest(`/api/admin/canteens/${target.id}`, {
                      method: "DELETE",
                    });
                    await reloadAdminData();
                    setCanteenItems((current) =>
                      current.filter(
                        (item) => item.name !== pendingDeleteCanteen,
                      ),
                    );
                    setMenusByCanteen((current) => {
                      const updated = { ...current };
                      delete updated[pendingDeleteCanteen];
                      return updated;
                    });
                    showToast("Canteen deleted");
                  } catch (error) {
                    console.warn(
                      "Canteen delete failed:",
                      error.message || error,
                    );
                  }
                  setPendingDeleteCanteen(null);
                }}
              >
                Delete canteen
              </button>
              <button
                className="soft-button"
                onClick={() => setPendingDeleteCanteen(null)}
              >
                Cancel
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
      <Toast message={toast} />
    </>
  );
}

export default CanteensPage;
