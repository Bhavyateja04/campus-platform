const LostItem = require('../models/LostModel');

// ─── Create a new lost/found report ──────────────────────────────────────────

const createLostFoundItem = async (req, res) => {
  try {
    const item = await LostItem.create({
      ...req.body,
      postedBy: req.user.id,
    });

    res.status(201).json({
      message: 'Item created successfully',
      data: item,
    });
  } catch (error) {
    console.error('createLostFoundItem error:', error);
    res.status(500).json({ message: 'Error creating item' });
  }
};

// ─── Update a lost/found report ───────────────────────────────────────────────

const updateItem = async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this item' });
    }

    Object.assign(item, req.body);
    await item.save();

    res.status(200).json({
      message: 'Item updated successfully',
      data: item,
    });
  } catch (error) {
    console.error('updateItem error:', error);
    res.status(500).json({ message: 'Error updating item' });
  }
};

// ─── Retrieve all lost/found reports ─────────────────────────────────────────

const viewItems = async (req, res) => {
  try {
    const items = await LostItem.find();

    res.status(200).json({
      message: 'Items retrieved successfully',
      data: items,
    });
  } catch (error) {
    console.error('viewItems error:', error);
    res.status(500).json({ message: 'Error retrieving items' });
  }
};

// ─── Delete a lost/found report ───────────────────────────────────────────────

const deleteItem = async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this item' });
    }

    await item.deleteOne();

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('deleteItem error:', error);
    res.status(500).json({ message: 'Error deleting item' });
  }
};

// ─── Mark an item as found ────────────────────────────────────────────────────

const markFound = async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.status  = 'found';
    item.foundId = req.user.id;
    await item.save();

    res.status(200).json({ message: 'Item marked as found' });
  } catch (error) {
    console.error('markFound error:', error);
    res.status(500).json({ message: 'Error marking item as found' });
  }
};

// ─── Mark an item as resolved ─────────────────────────────────────────────────

const markResolved = async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the owner can resolve this item' });
    }

    item.status = 'resolved';
    await item.save();

    res.status(200).json({ message: 'Item marked as resolved' });
  } catch (error) {
    console.error('markResolved error:', error);
    res.status(500).json({ message: 'Error marking item as resolved' });
  }
};

module.exports = {
  createLostFoundItem,
  updateItem,
  viewItems,
  deleteItem,
  markFound,
  markResolved,
};
