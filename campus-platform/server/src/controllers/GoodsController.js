const Goods = require("../models/GoodsModel");

const extractGoodsFields = (body = {}) => ({
  itemName: body.itemName || body.title || "",
  description: body.description || "",
  price: body.price != null ? Number(body.price) : 0,
  category: body.category || "",
  condition: String(body.condition || "good").toLowerCase(),
  imageUrl: body.imageUrl || body.image || "",
  contactNumber: body.contactNumber || body.phone || "",
});

const serializeGoods = (item) => ({
  ...item.toObject(),
  title: item.itemName,
  seller: item.sellerId,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetch a goods item by ID. Returns 404 if not found.
 */
const findItemOrFail = async (id, res) => {
  const item = await Goods.findById(id);
  if (!item) {
    res.status(404).json({ message: "Goods item not found" });
    return null;
  }
  return item;
};

/**
 * Check if the requesting user owns the item. Returns 403 if not.
 */
const isOwner = (item, userId, res) => {
  if (item.sellerId.toString() !== userId) {
    res.status(403).json({ message: "Unauthorized: you do not own this item" });
    return false;
  }
  return true;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /goods
 * Create a new goods listing for the authenticated seller.
 */
const createGoodsItem = async (req, res) => {
  try {
    const payload = extractGoodsFields(req.body);
    const item = await Goods.create({
      ...payload,
      itemName: payload.itemName,
      price: payload.price,
      sellerId: req.user.id,
      status: "available",
    });

    res.status(201).json({
      message: "Goods uploaded successfully",
      data: serializeGoods(item),
    });
  } catch (error) {
    console.error("[createGoodsItem]", error);
    res.status(500).json({ message: "Error creating goods item" });
  }
};

/**
 * PUT /goods/:id
 * Update an existing goods listing. Only the owner can update.
 */
const updateGoodsItem = async (req, res) => {
  try {
    const payload = extractGoodsFields(req.body);
    const item = await findItemOrFail(req.params.id, res);
    if (!item || !isOwner(item, req.user.id, res)) return;

    Object.assign(item, {
      ...(payload.itemName ? { itemName: payload.itemName } : {}),
      ...(payload.description ? { description: payload.description } : {}),
      ...(payload.price != null ? { price: payload.price } : {}),
      ...(payload.category ? { category: payload.category } : {}),
      ...(payload.condition ? { condition: payload.condition } : {}),
      ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
      ...(payload.contactNumber
        ? { contactNumber: payload.contactNumber }
        : {}),
    });
    await item.save();

    res.status(200).json({
      message: "Goods item updated successfully",
      data: serializeGoods(item),
    });
  } catch (error) {
    console.error("[updateGoodsItem]", error);
    res.status(500).json({ message: "Error updating goods item" });
  }
};

/**
 * GET /goods
 * Retrieve all goods listings with seller info.
 */
const getAllGoodsItems = async (req, res) => {
  try {
    const items = await Goods.find().populate("sellerId", "name email phone");

    res.status(200).json({
      message: "Items retrieved successfully",
      data: items.map(serializeGoods),
    });
  } catch (error) {
    console.error("[getAllGoodsItems]", error);
    res.status(500).json({ message: "Error retrieving goods items" });
  }
};

/**
 * DELETE /goods/:id
 * Delete a goods listing. Only the owner can delete.
 */
const deleteGoodsItem = async (req, res) => {
  try {
    const item = await findItemOrFail(req.params.id, res);
    if (!item || !isOwner(item, req.user.id, res)) return;

    await item.deleteOne();

    res.status(200).json({ message: "Goods item deleted successfully" });
  } catch (error) {
    console.error("[deleteGoodsItem]", error);
    res.status(500).json({ message: "Error deleting goods item" });
  }
};

/**
 * PATCH /goods/:id/sold
 * Mark a goods listing as sold. Only the owner can do this.
 */
const markGoodsItemAsSold = async (req, res) => {
  try {
    const item = await findItemOrFail(req.params.id, res);
    if (!item || !isOwner(item, req.user.id, res)) return;

    item.status = "sold";
    await item.save();

    res.status(200).json({ message: "Goods item marked as sold" });
  } catch (error) {
    console.error("[markGoodsItemAsSold]", error);
    res.status(500).json({ message: "Error marking goods item as sold" });
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  createGoodsItem,
  updateGoodsItem,
  getAllGoodsItems,
  deleteGoodsItem,
  markGoodsItemAsSold,
  updateItem: updateGoodsItem,
  viewItems: getAllGoodsItems,
  deleteItem: deleteGoodsItem,
  markAsSold: markGoodsItemAsSold,
};
