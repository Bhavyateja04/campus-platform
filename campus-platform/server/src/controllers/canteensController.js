const Canteen = require('../models/CanteensModel');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extracts only the known canteen fields from the request body.
 * Prevents unintended fields from being written to the database.
 */
const extractCanteenFields = ({ name, location, contactNumber, openingTime, closingTime, menu, image }) => ({
  name,
  location,
  contactNumber,
  openingTime,
  closingTime,
  menu,
  image,
});

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/canteens
 * Add a new canteen.
 */
const addCanteen = async (req, res) => {
  try {
    const canteen = await Canteen.create(extractCanteenFields(req.body));

    res.status(201).json({ message: 'Canteen added successfully', data: canteen });
  } catch (error) {
    console.error('[addCanteen]', error);
    res.status(500).json({ message: 'Error adding canteen' });
  }
};

/**
 * GET /api/canteens
 * Retrieve all canteens.
 */
const getCanteens = async (req, res) => {
  try {
    const canteenList = await Canteen.find();

    res.status(200).json({ message: 'Canteens retrieved successfully', data: canteenList });
  } catch (error) {
    console.error('[getCanteens]', error);
    res.status(500).json({ message: 'Error fetching canteens' });
  }
};

/**
 * GET /api/canteens/:canteenId
 * Retrieve a single canteen by ID.
 */
const getCanteenById = async (req, res) => {
  try {
    const canteen = await Canteen.findById(req.params.canteenId);

    if (!canteen) {
      return res.status(404).json({ message: 'Canteen not found' });
    }

    res.status(200).json({ message: 'Canteen retrieved successfully', data: canteen });
  } catch (error) {
    console.error('[getCanteenById]', error);
    res.status(500).json({ message: 'Error fetching canteen' });
  }
};

/**
 * PUT /api/canteens/:canteenId
 * Update an existing canteen by ID.
 */
const updateCanteen = async (req, res) => {
  try {
    const canteen = await Canteen.findByIdAndUpdate(
      req.params.canteenId,
      extractCanteenFields(req.body),
      { new: true }
    );

    if (!canteen) {
      return res.status(404).json({ message: 'Canteen not found' });
    }

    res.status(200).json({ message: 'Canteen updated successfully', data: canteen });
  } catch (error) {
    console.error('[updateCanteen]', error);
    res.status(500).json({ message: 'Error updating canteen' });
  }
};

/**
 * DELETE /api/canteens/:canteenId
 * Delete a canteen by ID.
 */
const deleteCanteen = async (req, res) => {
  try {
    const canteen = await Canteen.findByIdAndDelete(req.params.canteenId);

    if (!canteen) {
      return res.status(404).json({ message: 'Canteen not found' });
    }

    res.status(200).json({ message: 'Canteen deleted successfully' });
  } catch (error) {
    console.error('[deleteCanteen]', error);
    res.status(500).json({ message: 'Error deleting canteen' });
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { addCanteen, getCanteens, getCanteenById, updateCanteen, deleteCanteen };
