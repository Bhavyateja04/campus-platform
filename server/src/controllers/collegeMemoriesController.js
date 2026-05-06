const memories = require('../models/MemoriesModel');

const addMemory = async (req, res) => { 
    try {
        const { title, description, imageUrl } = req.body;
        await memories.create({
            title: title,
            description: description,
            imageUrl: imageUrl,
            authorId: req.user._id
        })
        res.status(201).json({ message: 'Memory added successfully', memory: newMemory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding memory' });
    }   
};


const getMemories = async (req, res) => {
    try {
        const allMemories = await memories.find();
        // const allMemories = await req.body; // Assuming the memories are sent in the request body for testing
        res.status(200).json(allMemories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching memories' });
    }
};


const editMemory = async (req, res) => {
    try {
        const { memoryId } = req.params;
        const { title, description, imageUrl } = req.body;

        const updatedMemory = await memories.findByIdAndUpdate(
            memoryId,
            { title, description, imageUrl },
            { new: true }
        );

        if (!updatedMemory) {
            return res.status(404).json({ message: 'Memory not found' });
        }

        res.status(200).json({ message: 'Memory updated successfully', memory: updatedMemory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating memory' });
    }
};

const deleteMemory = async (req, res) => {
    try {
        const { memoryId } = req.params;

        const deletedMemory = await memories.findByIdAndDelete(memoryId);

        if (!deletedMemory) {
            return res.status(404).json({ message: 'Memory not found' });
        }

        res.status(200).json({ message: 'Memory deleted successfully', memory: deletedMemory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting memory' });
    }
};

module.exports = {
    addMemory,
    getMemories,
    editMemory,
    deleteMemory
};
