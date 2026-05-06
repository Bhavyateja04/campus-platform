const canteens = require('../models/canteens');

// Add a new canteen    
const addCanteen = async (req, res) => {
    try {
        const { name, location, contactNumber, openingTime, closingTime, foodItems } = req.body;
        const newCanteen = await canteens.create({
            name: name,
            location: location, 
            contactNumber: contactNumber,
            openingTime: openingTime,
            closingTime: closingTime,
            foodItems: foodItems
        });
        res.status(201).json({ message: 'Canteen added successfully', canteen: newCanteen });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding canteen' });
    }   
};

// Get all canteens
const getCanteens = async (req, res) => {
    try {
        const allCanteens = await canteens.find();
        res.status(200).json(allCanteens);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching canteens' });
    }
};

const getCanteenById = async (req, res) => {
    try {
        const { canteenId } = req.params;
        const canteen = await canteens.findById(canteenId);
        if (!canteen) {
            return res.status(404).json({ message: 'Canteen not found' });
        }
        res.status(200).json(canteen);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching canteen' });
    }
};

const updateCanteen = async (req, res) => { 
    try {
        const { canteenId } = req.params;
        const { name, location, contactNumber, openingTime, closingTime, foodItems } = req.body;
        const updatedCanteen = await canteens.findByIdAndUpdate(
            canteenId,
            { name, location, contactNumber, openingTime, closingTime, foodItems },
            { new: true }
        );
        if (!updatedCanteen) {
            return res.status(404).json({ message: 'Canteen not found' });
        }
        res.status(200).json(updatedCanteen);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating canteen' });
    }
};

const deleteCanteen = async (req, res) => {
    try {
        const { canteenId } = req.params;
        const deletedCanteen = await canteens.findByIdAndDelete(canteenId);
        if (!deletedCanteen) {
            return res.status(404).json({ message: 'Canteen not found' });
        }
        res.status(200).json({ message: 'Canteen deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting canteen' });
    }
};

module.exports = {
    addCanteen,
    getCanteens,
    getCanteenById,
    updateCanteen,
    deleteCanteen
};  