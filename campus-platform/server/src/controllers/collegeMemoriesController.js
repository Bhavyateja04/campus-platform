const Memory = require("../models/MemoriesModel");

// ─── Constants ────────────────────────────────────────────────────────────────

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const MESSAGES = {
  MEMORY_ADDED: "Memory added successfully",
  MEMORY_UPDATED: "Memory updated successfully",
  MEMORY_DELETED: "Memory deleted successfully",
  MEMORY_NOT_FOUND: "Memory not found",
  MISSING_FIELDS: "Title and description are required",
  UNAUTHORIZED_UPDATE: "Unauthorized to update this memory",
  UNAUTHORIZED_DELETE: "Unauthorized to delete this memory",
  ERROR_ADDING: "Error adding memory",
  ERROR_FETCHING: "Error fetching memories",
  ERROR_UPDATING: "Error updating memory",
  ERROR_DELETING: "Error deleting memory",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sendSuccess = (res, statusCode, data = {}) => {
  res.status(statusCode).json({ success: true, ...data });
};

const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({ success: false, message });
};

const isOwner = (memory, userId) => {
  return memory.authorId.toString() === userId;
};

const applyMemoryUpdates = (memory, { title, description, imageUrl }) => {
  if (title !== undefined)       memory.title = title;
  if (description !== undefined) memory.description = description;
  if (imageUrl !== undefined)    memory.imageUrl = imageUrl;
};

// ─── Controller ───────────────────────────────────────────────────────────────

/**
 * @desc    Add a new memory
 * @route   POST /api/memories
 * @access  Private
 */
const addMemory = async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body || {};

    if (!title || !description) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, MESSAGES.MISSING_FIELDS);
    }

    const newMemory = await Memory.create({
      title,
      description,
      imageUrl,
      authorId: req.user.id,
    });

    sendSuccess(res, HTTP_STATUS.CREATED, {
      message: MESSAGES.MEMORY_ADDED,
      data: newMemory,
    });
  } catch (error) {
    console.error("addMemory error:", error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.ERROR_ADDING);
  }
};

/**
 * @desc    Get all memories
 * @route   GET /api/memories
 * @access  Public
 */
const getMemories = async (_req, res) => {
  try {
    const allMemories = await Memory
      .find()
      .sort({ createdAt: -1 })
      .populate("authorId", "name rollNumber");

    sendSuccess(res, HTTP_STATUS.OK, {
      count: allMemories.length,
      data: allMemories,
    });
  } catch (error) {
    console.error("getMemories error:", error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.ERROR_FETCHING);
  }
};

/**
 * @desc    Edit a memory by ID
 * @route   PUT /api/memories/:memoryId
 * @access  Private (owner only)
 */
const editMemory = async (req, res) => {
  try {
    const { memoryId } = req.params;
    const memory = await Memory.findById(memoryId);

    if (!memory) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, MESSAGES.MEMORY_NOT_FOUND);
    }

    if (!isOwner(memory, req.user.id)) {
      return sendError(res, HTTP_STATUS.FORBIDDEN, MESSAGES.UNAUTHORIZED_UPDATE);
    }

    applyMemoryUpdates(memory, req.body || {});
    await memory.save();

    sendSuccess(res, HTTP_STATUS.OK, {
      message: MESSAGES.MEMORY_UPDATED,
      data: memory,
    });
  } catch (error) {
    console.error("editMemory error:", error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.ERROR_UPDATING);
  }
};

/**
 * @desc    Delete a memory by ID
 * @route   DELETE /api/memories/:memoryId
 * @access  Private (owner only)
 */
const deleteMemory = async (req, res) => {
  try {
    const { memoryId } = req.params;
    const memory = await Memory.findById(memoryId);

    if (!memory) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, MESSAGES.MEMORY_NOT_FOUND);
    }

    if (!isOwner(memory, req.user.id)) {
      return sendError(res, HTTP_STATUS.FORBIDDEN, MESSAGES.UNAUTHORIZED_DELETE);
    }

    await memory.deleteOne();

    sendSuccess(res, HTTP_STATUS.OK, { message: MESSAGES.MEMORY_DELETED });
  } catch (error) {
    console.error("deleteMemory error:", error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.ERROR_DELETING);
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { addMemory, getMemories, editMemory, deleteMemory };
