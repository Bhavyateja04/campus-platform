const Placements = require('../models/PlacementsModels');

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /placements
 * Create a new placement experience.
 */
const createPlacementItem = async (req, res) => {
  try {
    const item = await Placements.create(req.body);

    res.status(201).json({ message: 'Experience uploaded successfully', data: item });
  } catch (error) {
    console.error('[createPlacementItem]', error);
    res.status(500).json({ message: 'Error creating experience item' });
  }
};

/**
 * PUT /placements/:id
 * Update a placement experience by ID.
 */
const updatePlacementItem = async (req, res) => {
  try {
    const item = await Placements.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!item) {
      return res.status(404).json({ message: 'Experience item not found' });
    }

    res.status(200).json({ message: 'Experience item updated successfully', data: item });
  } catch (error) {
    console.error('[updatePlacementItem]', error);
    res.status(500).json({ message: 'Error updating experience item' });
  }
};

/**
 * GET /placements
 * Retrieve all placement experiences.
 */
const getAllPlacementItems = async (req, res) => {
  try {
    const items = await Placements.find();

    res.status(200).json({ message: 'Experience items retrieved successfully', data: items });
  } catch (error) {
    console.error('[getAllPlacementItems]', error);
    res.status(500).json({ message: 'Error retrieving experience items' });
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
      return res.status(404).json({ message: 'Experience item not found' });
    }

    res.status(200).json({ message: 'Experience item deleted successfully' });
  } catch (error) {
    console.error('[deletePlacementItem]', error);
    res.status(500).json({ message: 'Error deleting experience item' });
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  createPlacementItem,
  updatePlacementItem,
  getAllPlacementItems,
  deletePlacementItem,
};
