const Memory = require("../models/MemoriesModel");

// @desc    Add a new memory
// @route   POST /api/memories
const addMemory = async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;

    // BUG FIX: result was never stored in a variable, so newMemory was undefined
    const newMemory = await Memory.create({
      title,
      description,
      imageUrl,
      authorId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Memory added successfully",
      data: newMemory,
    });
  } catch (error) {
    console.error("addMemory error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Get all memories
// @route   GET /api/memories
const getMemories = async (req, res) => {
  try {
    const memories = await Memory.find();

    res.status(200).json({
      success: true,
      count: memories.length,
      data: memories,
    });
  } catch (error) {
    console.error("getMemories error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Edit a memory by ID
// @route   PUT /api/memories/:memoryId
const editMemory = async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;

    const updatedMemory = await Memory.findByIdAndUpdate(
      req.params.memoryId,
      { title, description, imageUrl },
      { new: true, runValidators: true }
    );

    if (!updatedMemory) {
      return res.status(404).json({ success: false, message: "Memory not found" });
    }

    res.status(200).json({
      success: true,
      message: "Memory updated successfully",
      data: updatedMemory,
    });
  } catch (error) {
    console.error("editMemory error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Delete a memory by ID
// @route   DELETE /api/memories/:memoryId
const deleteMemory = async (req, res) => {
  try {
    const deletedMemory = await Memory.findByIdAndDelete(req.params.memoryId);

    if (!deletedMemory) {
      return res.status(404).json({ success: false, message: "Memory not found" });
    }

    res.status(200).json({
      success: true,
      message: "Memory deleted successfully",
      data: deletedMemory,
    });
  } catch (error) {
    console.error("deleteMemory error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { addMemory, getMemories, editMemory, deleteMemory };
