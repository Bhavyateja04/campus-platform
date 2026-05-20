import { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiPhone, FiMail } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/common/PageHeader";
import SearchFilter from "../components/common/SearchFilter";
import CrudModal from "../components/common/CrudModal";
import Toast from "../components/common/Toast";
import { useAppData } from "../context/AppDataContext";
import { useFilteredData } from "../utils/hooks";

function MarketplacePage() {
  const { goodsItems, apiRequest, reloadAdminData } = useAppData();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [items, setItems] = useState(goodsItems);
  const [editor, setEditor] = useState(null);
  const [toast, setToast] = useState("");
  const categories = [
    "All",
    ...new Set(goodsItems.map((product) => product.category)),
  ];
  useEffect(() => setItems(goodsItems), [goodsItems]);
  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };
  const filtered = useFilteredData(items, search, [
    "name",
    "seller",
    "category",
  ]).filter((product) => category === "All" || product.category === category);
  const openCreate = () => {
    setEditor({
      mode: "create",
      value: {
        productName: "",
        category: "Electronics",
        price: "",
        description: "",
        images: "",
        status: "active",
      },
    });
  };
  const openEdit = (product) => {
    setEditor({
      mode: "edit",
      value: {
        id: product.id,
        productName: product.productName || product.name,
        category: product.category || "Other",
        price: product.price
          ? String(product.price).replace(/^Rs\.\s*/, "")
          : "",
        description: product.description || "",
        images: Array.isArray(product.images)
          ? product.images.join(", ")
          : product.image || "",
        status: product.status || "active",
      },
    });
  };
  const saveProduct = async () => {
    const payload = {
      productName: editor.value.productName,
      category: editor.value.category,
      price: editor.value.price,
      description: editor.value.description,
      images: editor.value.images
        ? editor.value.images
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
      status: editor.value.status,
    };
    try {
      if (editor.mode === "create") {
        await apiRequest("/api/admin/marketplace", {
          method: "POST",
          body: payload,
        });
        showToast("Listing created successfully");
      } else {
        await apiRequest(`/api/admin/marketplace/${editor.value.id}`, {
          method: "PUT",
          body: payload,
        });
      }

      await reloadAdminData();
      setEditor(null);
    } catch (error) {
      showToast(error.message || "Failed to save listing");
    }
  };
  const markSold = async (product) => {
    await apiRequest(`/api/admin/marketplace/${product.id}`, {
      method: "PUT",
      body: { status: "sold" },
    });
    await reloadAdminData();
  };
  const deleteProduct = async (product) => {
    await apiRequest(`/api/admin/marketplace/${product.id}`, {
      method: "DELETE",
    });
    await reloadAdminData();
  };
  return (
    <>
      <PageHeader
        eyebrow="Commerce"
        title="Student marketplace"
        text="Premium ecommerce-style controls for listings, seller contacts, categories, and product discovery."
        action={
          <button className="primary-button" onClick={openCreate}>
            <FiPlus /> Add listing
          </button>
        }
      />
      <SearchFilter
        search={search}
        setSearch={setSearch}
        placeholder="Search products or sellers..."
        filters={categories}
        selected={category}
        setSelected={setCategory}
      />
      <div className="product-grid">
        {filtered.map((product) => (
          <motion.article
            className="product-card"
            key={product.id || product.name}
            whileHover={{ y: -10 }}
          >
            <img src={product.image} alt="" />
            <div>
              <span className="pill">{product.category}</span>
              <h3>{product.name}</h3>
              <strong>{product.price}</strong>
              <p>Seller: {product.seller}</p>
              <p>Status: {product.status || "active"}</p>
              <div className="contact-row">
                <a href={`tel:${product.phone}`}>
                  <FiPhone /> {product.phone}
                </a>
                <a href={`mailto:${product.email}`}>
                  <FiMail /> Email
                </a>
              </div>
              <div className="button-row" style={{ marginTop: 12 }}>
                <button
                  className="soft-button"
                  onClick={() => openEdit(product)}
                >
                  <FiEdit /> Edit
                </button>
                <button
                  className="soft-button"
                  onClick={() => markSold(product)}
                >
                  Mark sold
                </button>
                <button
                  className="danger-button ghost-danger"
                  onClick={() => deleteProduct(product)}
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
      <AnimatePresence>
        {editor && (
          <CrudModal
            title={editor.mode === "create" ? "Create listing" : "Edit listing"}
            description="Map marketplace fields to the Marketplace model."
            fields={[
              { name: "productName", label: "Product name" },
              { name: "category", label: "Category" },
              { name: "price", label: "Price" },
              { name: "description", label: "Description", type: "textarea" },
              {
                name: "images",
                label: "Images (comma separated URLs)",
                required: false,
              },
              {
                name: "status",
                label: "Status",
                type: "select",
                options: ["active", "sold", "removed"],
              },
            ]}
            value={editor.value}
            onChange={(value) => setEditor({ ...editor, value })}
            onSubmit={saveProduct}
            onClose={() => setEditor(null)}
            submitLabel={
              editor.mode === "create" ? "Create listing" : "Save listing"
            }
          />
        )}
      </AnimatePresence>
      <Toast message={toast} />
    </>
  );
}
export default MarketplacePage;
