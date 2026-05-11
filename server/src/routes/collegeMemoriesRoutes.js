const express = require("express");
const router = express.Router();

const {
  addMemory,
  getMemories,
  editMemory,
  deleteMemory,
} = require("../controllers/collegeMemoriesController");

// @route   POST    /api/memories
router.post("/", addMemory);

// @route   GET     /api/memories
router.get("/", getMemories);

// @route   PATCH   /api/memories/:memoryId
router.patch("/:memoryId", editMemory);

// @route   DELETE  /api/memories/:memoryId
router.delete("/:memoryId", deleteMemory);

module.exports = router;
