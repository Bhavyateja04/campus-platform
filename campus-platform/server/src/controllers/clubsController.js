const Club = require("../models/ClubsModel");

// ─── Constants ────────────────────────────────────────────────────────────────

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const MESSAGES = {
  CLUB_ADDED: "Club added successfully",
  CLUB_UPDATED: "Club updated successfully",
  CLUB_DELETED: "Club deleted successfully",
  CLUB_NOT_FOUND: "Club not found",
  INTERNAL_SERVER_ERROR: "Internal server error",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sendSuccess = (res, statusCode, data = {}) => {
  res.status(statusCode).json({ success: true, ...data });
};

const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({ success: false, message });
};

const extractClubFields = (body) => {
  const { name, description, coordinatorName, coordinatorEmail, mobileNumber } = body;
  return { name, description, coordinatorName, coordinatorEmail, mobileNumber };
};

// ─── Controller ───────────────────────────────────────────────────────────────

/**
 * @desc    Add a new club
 * @route   POST /api/clubs
 */
const addClub = async (req, res) => {
  try {
    const clubData = extractClubFields(req.body);
    const club = await Club.create(clubData);

    sendSuccess(res, HTTP_STATUS.CREATED, {
      message: MESSAGES.CLUB_ADDED,
      data: club,
    });
  } catch (error) {
    console.error("addClub error:", error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @desc    Get all clubs
 * @route   GET /api/clubs
 */
const getClubs = async (req, res) => {
  try {
    const clubs = await Club.find();

    sendSuccess(res, HTTP_STATUS.OK, {
      count: clubs.length,
      data: clubs,
    });
  } catch (error) {
    console.error("getClubs error:", error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @desc    Get a single club by ID
 * @route   GET /api/clubs/:clubId
 */
const getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);

    if (!club) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, MESSAGES.CLUB_NOT_FOUND);
    }

    sendSuccess(res, HTTP_STATUS.OK, { data: club });
  } catch (error) {
    console.error("getClubById error:", error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @desc    Update a club by ID
 * @route   PUT /api/clubs/:clubId
 */
const updateClub = async (req, res) => {
  try {
    const clubData = extractClubFields(req.body);
    const updatedClub = await Club.findByIdAndUpdate(
      req.params.clubId,
      clubData,
      { new: true, runValidators: true }
    );

    if (!updatedClub) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, MESSAGES.CLUB_NOT_FOUND);
    }

    sendSuccess(res, HTTP_STATUS.OK, {
      message: MESSAGES.CLUB_UPDATED,
      data: updatedClub,
    });
  } catch (error) {
    console.error("updateClub error:", error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @desc    Delete a club by ID
 * @route   DELETE /api/clubs/:clubId
 */
const deleteClub = async (req, res) => {
  try {
    const deletedClub = await Club.findByIdAndDelete(req.params.clubId);

    if (!deletedClub) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, MESSAGES.CLUB_NOT_FOUND);
    }

    sendSuccess(res, HTTP_STATUS.OK, {
      message: MESSAGES.CLUB_DELETED,
      data: deletedClub,
    });
  } catch (error) {
    console.error("deleteClub error:", error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { addClub, getClubs, getClubById, updateClub, deleteClub };
