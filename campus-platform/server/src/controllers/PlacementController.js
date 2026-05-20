const Placements = require("../models/PlacementsModels");

const extractPlacementFields = (body = {}) => ({
  username: body.username || body.Username || body.name || "",
  company: body.company || body.Company || "",
  position: body.position || body.Position || body.role || "",
  salary: body.salary != null ? Number(body.salary) : undefined,
  description: body.description || "",
  imageUrl: body.imageUrl || body.image || "",
});

const serializePlacement = (placement) => ({
  ...placement.toObject(),
  Username: placement.username,
  Company: placement.company,
  Position: placement.position,
});

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /placements
 * Create a new placement experience.
 */
const createPlacementItem = async (req, res) => {
  try {
    const payload = extractPlacementFields(req.body);
    const item = await Placements.create({
      ...payload,
      userId: req.user.id,
      username: payload.username || req.user.name || "Anonymous",
      company: payload.company,
      position: payload.position,
    });

    res
      .status(201)
      .json({
        message: "Experience uploaded successfully",
        data: serializePlacement(item),
      });
  } catch (error) {
    console.error("[createPlacementItem]", error);
    res.status(500).json({ message: "Error creating experience item" });
  }
};

/**
 * PUT /placements/:id
 * Update a placement experience by ID.
 */
const updatePlacementItem = async (req, res) => {
  try {
    const payload = extractPlacementFields(req.body);
    const item = await Placements.findByIdAndUpdate(
      req.params.id,
      {
        ...(payload.username ? { username: payload.username } : {}),
        ...(payload.company ? { company: payload.company } : {}),
        ...(payload.position ? { position: payload.position } : {}),
        ...(payload.description ? { description: payload.description } : {}),
        ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
        ...(payload.salary != null ? { salary: payload.salary } : {}),
      },
      { new: true, runValidators: true },
    );

    if (!item) {
      return res.status(404).json({ message: "Experience item not found" });
    }

    res
      .status(200)
      .json({
        message: "Experience item updated successfully",
        data: serializePlacement(item),
      });
  } catch (error) {
    console.error("[updatePlacementItem]", error);
    res.status(500).json({ message: "Error updating experience item" });
  }
};

/**
 * GET /placements
 * Retrieve all placement experiences.
 */
const getAllPlacementItems = async (req, res) => {
  try {
    const items = await Placements.find();

    res.status(200).json({
      message: "Experience items retrieved successfully",
      data: items.map(serializePlacement),
    });
  } catch (error) {
    console.error("[getAllPlacementItems]", error);
    res.status(500).json({ message: "Error retrieving experience items" });
  }
};

/**
 * DELETE /placements/:id
 * Delete a placement experience by ID.
 */
const deletePlacementItem = async (req, res) => {
  try {
    const item = await Placements.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Experience item not found" });
    }

    res.status(200).json({ message: "Experience item deleted successfully" });
  } catch (error) {
    console.error("[deletePlacementItem]", error);
    res.status(500).json({ message: "Error deleting experience item" });
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  createPlacementItem,
  updatePlacementItem,
  getAllPlacementItems,
  deletePlacementItem,
  updateItem: updatePlacementItem,
  viewItems: getAllPlacementItems,
  deleteItem: deletePlacementItem,
};
