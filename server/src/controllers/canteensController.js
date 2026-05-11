const Canteen = require('../models/canteens');

// ─── Add a new canteen ────────────────────────────────────────────────────────

const addCanteen = async (req, res) => {
  try {
    const { name, location, contactNumber, openingTime, closingTime, foodItems } = req.body;

    if (!name || !location || !contactNumber || !openingTime || !closingTime) {
      return res.status(400).json({ message: 'name, location, contactNumber, openingTime, and closingTime are required' });
    }

    const newCanteen = await Canteen.create({
      name,
      location,
      contactNumber,
      openingTime,
      closingTime,
      foodItems,
    });

    res.status(201).json({
      message: 'Canteen added successfully',
      data: newCanteen,
    });
  } catch (error) {
    console.error('addCanteen error:', error);
    res.status(500).json({ message: 'Error adding canteen' });
  }
};

// ─── Get all canteens ─────────────────────────────────────────────────────────

const getCanteens = async (req, res) => {
  try {
    const allCanteens = await Canteen.find();

    res.status(200).json({
      message: 'Canteens retrieved successfully',
      data: allCanteens,
    });
  } catch (error) {
    console.error('getCanteens error:', error);
    res.status(500).json({ message: 'Error fetching canteens' });
  }
};

// ─── Get a single canteen by ID ───────────────────────────────────────────────

const getCanteenById = async (req, res) => {
  try {
    const canteen = await Canteen.findById(req.params.canteenId);

    if (!canteen) {
      return res.status(404).json({ message: 'Canteen not found' });
    }

    res.status(200).json({
      message: 'Canteen retrieved successfully',
      data: canteen,
    });
  } catch (error) {
    console.error('getCanteenById error:', error);
    res.status(500).json({ message: 'Error fetching canteen' });
  }
};

// ─── Update a canteen ─────────────────────────────────────────────────────────

const updateCanteen = async (req, res) => {
  try {
    const { name, location, contactNumber, openingTime, closingTime, foodItems } = req.body;

    const updatedCanteen = await Canteen.findByIdAndUpdate(
      req.params.canteenId,
      { name, location, contactNumber, openingTime, closingTime, foodItems },
      { new: true }
    );

    if (!updatedCanteen) {
      return res.status(404).json({ message: 'Canteen not found' });
    }

    res.status(200).json({
      message: 'Canteen updated successfully',
      data: updatedCanteen,
    });
  } catch (error) {
    console.error('updateCanteen error:', error);
    res.status(500).json({ message: 'Error updating canteen' });
  }
};

// ─── Delete a canteen ─────────────────────────────────────────────────────────

const deleteCanteen = async (req, res) => {
  try {
    const deletedCanteen = await Canteen.findByIdAndDelete(req.params.canteenId);

    if (!deletedCanteen) {
      return res.status(404).json({ message: 'Canteen not found' });
    }

    res.status(200).json({ message: 'Canteen deleted successfully' });
  } catch (error) {
    console.error('deleteCanteen error:', error);
    res.status(500).json({ message: 'Error deleting canteen' });
  }
};

module.exports = { addCanteen, getCanteens, getCanteenById, updateCanteen, deleteCanteen };
