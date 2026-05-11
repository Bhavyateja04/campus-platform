const memories = require('../models/MemoriesModel');

const addMemory = async (req, res) => {
    try {
        const { title, description, imageUrl } = req.body || {};
        if (!title || !description) {
            return res.status(400).json({ message: 'title and description are required' });
        }

        const newMemory = await memories.create({
            title,
            description,
            imageUrl,
            authorId: req.user.id,
        });

        res.status(201).json({ message: 'Memory added successfully', memory: newMemory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding memory' });
    }
};

const getMemories = async (_req, res) => {
    try {
        const allMemories = await memories
            .find()
            .sort({ createdAt: -1 })
            .populate('authorId', 'name rollNumber');
        res.status(200).json(allMemories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching memories' });
    }
};

const editMemory = async (req, res) => {
    try {
        const { memoryId } = req.params;
        const { title, description, imageUrl } = req.body || {};

        const memory = await memories.findById(memoryId);
        if (!memory) {
            return res.status(404).json({ message: 'Memory not found' });
        }
        if (memory.authorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to update this memory' });
        }

        if (title !== undefined) memory.title = title;
        if (description !== undefined) memory.description = description;
        if (imageUrl !== undefined) memory.imageUrl = imageUrl;
        await memory.save();

        res.status(200).json({ message: 'Memory updated successfully', memory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating memory' });
    }
};

const deleteMemory = async (req, res) => {
    try {
        const { memoryId } = req.params;

        const memory = await memories.findById(memoryId);
        if (!memory) {
            return res.status(404).json({ message: 'Memory not found' });
        }
        if (memory.authorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to delete this memory' });
        }
        await memory.deleteOne();

        res.status(200).json({ message: 'Memory deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting memory' });
    }
};

module.exports = {
    addMemory,
    getMemories,
    editMemory,
    deleteMemory,
};
