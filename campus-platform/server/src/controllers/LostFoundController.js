const LostItem = require('../models/LostModel');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetch a lost/found item by ID. Returns 404 if not found.
 */
const findItemOrFail = async (id, res) => {
  const item = await LostItem.findById(id);
  if (!item) {
    res.status(404).json({ message: 'Item not found' });
    return null;
  }
  return item;
};

/**
 * Check if the requesting user is the original poster. Returns 403 if not.
 */
const isPoster = (item, userId, res) => {
  if (item.postedBy.toString() !== userId) {
    res.status(403).json({ message: 'Unauthorized: you did not post this item' });
    return false;
  }
  return true;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /lost-found
 * Create a new lost/found report for the authenticated user.
 */
const createLostFoundItem = async (req, res) => {
  try {
    const item = await LostItem.create({
      ...req.body,
      postedBy: req.user.id,
    });

    res.status(201).json({ message: 'Item created successfully', data: item });
  } catch (error) {
    console.error('[createLostFoundItem]', error);
    res.status(500).json({ message: 'Error creating item' });
  }
};

/**
 * PUT /lost-found/:id
 * Update a lost/found report. Only the original poster can update.
 */
const updateLostFoundItem = async (req, res) => {
  try {
    const item = await findItemOrFail(req.params.id, res);
    if (!item || !isPoster(item, req.user.id, res)) return;

    Object.assign(item, req.body);
    await item.save();

    res.status(200).json({ message: 'Item updated successfully', data: item });
  } catch (error) {
    console.error('[updateLostFoundItem]', error);
    res.status(500).json({ message: 'Error updating item' });
  }
};

/**
 * GET /lost-found
 * Retrieve all lost/found reports.
 */
const getAllLostFoundItems = async (req, res) => {
  try {
    const items = await LostItem.find();

    res.status(200).json({ message: 'Items retrieved successfully', data: items });
  } catch (error) {
    console.error('[getAllLostFoundItems]', error);
    res.status(500).json({ message: 'Error retrieving items' });
  }
};

/**
 * DELETE /lost-found/:id
 * Delete a lost/found report. Only the original poster can delete.
 */
const deleteLostFoundItem = async (req, res) => {
  try {
    const item = await findItemOrFail(req.params.id, res);
    if (!item || !isPoster(item, req.user.id, res)) return;

    await item.deleteOne();

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('[deleteLostFoundItem]', error);
    res.status(500).json({ message: 'Error deleting item' });
  }
};

/**
 * PATCH /lost-found/:id/found
 * Mark a lost item as found. Any authenticated user can claim they found it.
 */
const markItemAsFound = async (req, res) => {
  try {
    const item = await findItemOrFail(req.params.id, res);
    if (!item) return;

    item.status  = 'found';
    item.foundId = req.user.id;
    await item.save();

    res.status(200).json({ message: 'Item marked as found' });
  } catch (error) {
    console.error('[markItemAsFound]', error);
    res.status(500).json({ message: 'Error marking item as found' });
  }
};

/**
 * PATCH /lost-found/:id/resolved
 * Mark a lost/found report as resolved. Only the original poster can resolve.
 */
const markItemAsResolved = async (req, res) => {
  try {
    const item = await findItemOrFail(req.params.id, res);
    if (!item || !isPoster(item, req.user.id, res)) return;

    item.status = 'resolved';
    await item.save();

    res.status(200).json({ message: 'Item marked as resolved' });
  } catch (error) {
    console.error('[markItemAsResolved]', error);
    res.status(500).json({ message: 'Error marking item as resolved' });
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  createLostFoundItem,
  updateLostFoundItem,
  getAllLostFoundItems,
  deleteLostFoundItem,
  markItemAsFound,
  markItemAsResolved,
};
