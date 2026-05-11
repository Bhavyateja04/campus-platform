const Goods = require('../models/GoodsModel');

// ─── Create a new goods listing ───────────────────────────────────────────────

const createGoodsItem = async (req, res) => {
  try {
    const item = await Goods.create({
      ...req.body,
      seller: req.user.id,
      status: 'available',
    });

    res.status(201).json({
      message: 'Goods uploaded successfully',
      data: item,
    });
  } catch (error) {
    console.error('createGoodsItem error:', error);
    res.status(500).json({ message: 'Error creating goods item' });
  }
};

// ─── Update an existing goods listing ────────────────────────────────────────

const updateItem = async (req, res) => {
  try {
    const item = await Goods.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this item' });
    }

    Object.assign(item, req.body);
    await item.save();

    res.status(200).json({
      message: 'Goods item updated successfully',
      data: item,
    });
  } catch (error) {
    console.error('updateItem error:', error);
    res.status(500).json({ message: 'Error updating item' });
  }
};

// ─── Retrieve all goods listings ─────────────────────────────────────────────

const viewItems = async (req, res) => {
  try {
    const items = await Goods.find().populate('seller', 'name email');

    res.status(200).json({
      message: 'Items retrieved successfully',
      data: items,
    });
  } catch (error) {
    console.error('viewItems error:', error);
    res.status(500).json({ message: 'Error retrieving items' });
  }
};

// ─── Delete a goods listing ───────────────────────────────────────────────────

const deleteItem = async (req, res) => {
  try {
    const item = await Goods.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Goods item not found' });
    }

    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this item' });
    }

    await item.deleteOne();

    res.status(200).json({ message: 'Goods item deleted successfully' });
  } catch (error) {
    console.error('deleteItem error:', error);
    res.status(500).json({ message: 'Error deleting item' });
  }
};

// ─── Mark a goods listing as sold ────────────────────────────────────────────

const markAsSold = async (req, res) => {
  try {
    const item = await Goods.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to mark this item as sold' });
    }

    item.status = 'sold';
    await item.save();

    res.status(200).json({ message: 'Item marked as sold' });
  } catch (error) {
    console.error('markAsSold error:', error);
    res.status(500).json({ message: 'Error marking item as sold' });
  }
};

module.exports = { createGoodsItem, updateItem, viewItems, deleteItem, markAsSold };
