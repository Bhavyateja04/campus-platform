const Placements = require('../models/PlacementsModels');

// ─── Create a new placement experience ───────────────────────────────────────

const createPlacementItem = async (req, res) => {
  try {
    const item = await Placements.create(req.body);

    res.status(201).json({
      message: 'Experience uploaded successfully',
      data: item,
    });
  } catch (error) {
    console.error('createPlacementItem error:', error);
    res.status(500).json({ message: 'Error creating experience item' });
  }
};

// ─── Update a placement experience ───────────────────────────────────────────

const updateItem = async (req, res) => {
  try {
    const item = await Placements.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!item) {
      return res.status(404).json({ message: 'Experience item not found' });
    }

    res.status(200).json({
      message: 'Experience item updated successfully',
      data: item,
    });
  } catch (error) {
    console.error('updateItem error:', error);
    res.status(500).json({ message: 'Error updating experience item' });
  }
};

// ─── Retrieve all placement experiences ──────────────────────────────────────

const viewItems = async (req, res) => {
  try {
    const items = await Placements.find();

    res.status(200).json({
      message: 'Experience items retrieved successfully',
      data: items,
    });
  } catch (error) {
    console.error('viewItems error:', error);
    res.status(500).json({ message: 'Error retrieving experience items' });
  }
};

// ─── Delete a placement experience ────────────────────────────────────────────

const deleteItem = async (req, res) => {
  try {
    const item = await Placements.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Experience item not found' });
    }

    res.status(200).json({ message: 'Experience item deleted successfully' });
  } catch (error) {
    console.error('deleteItem error:', error);
    res.status(500).json({ message: 'Error deleting experience item' });
  }
};

module.exports = { createPlacementItem, updateItem, viewItems, deleteItem };
