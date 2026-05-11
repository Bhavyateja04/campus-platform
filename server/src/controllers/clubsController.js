const Club = require("../models/ClubsModel");

// @desc    Add a new club
// @route   POST /api/clubs
const addClub = async (req, res) => {
  try {
    const { name, description, coordinatorName, coordinatorEmail, mobileNumber } = req.body;

    const club = await Club.create({
      name,
      description,
      coordinatorName,
      coordinatorEmail,
      mobileNumber,
    });

    res.status(201).json({
      success: true,
      message: "Club added successfully",
      data: club,
    });
  } catch (error) {
    console.error("addClub error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Get all clubs
// @route   GET /api/clubs
const getClubs = async (req, res) => {
  try {
    const clubs = await Club.find();

    res.status(200).json({
      success: true,
      count: clubs.length,
      data: clubs,
    });
  } catch (error) {
    console.error("getClubs error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Get a single club by ID
// @route   GET /api/clubs/:clubId
const getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);

    if (!club) {
      return res.status(404).json({ success: false, message: "Club not found" });
    }

    res.status(200).json({ success: true, data: club });
  } catch (error) {
    console.error("getClubById error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Update a club by ID
// @route   PUT /api/clubs/:clubId
const updateClub = async (req, res) => {
  try {
    const { name, description, coordinatorName, coordinatorEmail, mobileNumber } = req.body;

    const updatedClub = await Club.findByIdAndUpdate(
      req.params.clubId,
      { name, description, coordinatorName, coordinatorEmail, mobileNumber },
      { new: true, runValidators: true }
    );

    if (!updatedClub) {
      return res.status(404).json({ success: false, message: "Club not found" });
    }

    res.status(200).json({
      success: true,
      message: "Club updated successfully",
      data: updatedClub,
    });
  } catch (error) {
    console.error("updateClub error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Delete a club by ID
// @route   DELETE /api/clubs/:clubId
const deleteClub = async (req, res) => {
  try {
    const deletedClub = await Club.findByIdAndDelete(req.params.clubId);

    if (!deletedClub) {
      return res.status(404).json({ success: false, message: "Club not found" });
    }

    res.status(200).json({
      success: true,
      message: "Club deleted successfully",
      data: deletedClub,
    });
  } catch (error) {
    console.error("deleteClub error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { addClub, getClubs, getClubById, updateClub, deleteClub };
