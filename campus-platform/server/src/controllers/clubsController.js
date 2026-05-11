const clubs = require("../models/ClubsModel");

const addClub = async (req, res) => {
    try {
        const { name, description, coordinatorName, coordinatorEmail, mobileNumber } = req.body;
        const newClub = await clubs.create({
            name: name,
            description: description,
            coordinatorName: coordinatorName,
            coordinatorEmail: coordinatorEmail,
            mobileNumber: mobileNumber
        });
        res.status(201).json({ message: 'Club added successfully', club: newClub });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding club' });
    }
};

const getClubs = async (req, res) => {
    try {
        const allClubs = await clubs.find();
        res.status(200).json(allClubs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching clubs' });
    }
};

const getClubById = async (req, res) => {
    try {
        const { clubId } = req.params;
        const club = await clubs.findById(clubId);
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }
        res.status(200).json(club);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching club' });
    }
};

const updateClub = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { name, description, coordinatorName, coordinatorEmail, mobileNumber } = req.body;
        const updatedClub = await clubs.findByIdAndUpdate(
            clubId,
            { name, description, coordinatorName, coordinatorEmail, mobileNumber },
            { new: true }
        );
        if (!updatedClub) {
            return res.status(404).json({ message: 'Club not found' });
        }
        res.status(200).json({ message: 'Club updated successfully', club: updatedClub });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating club' });
    }
};

const deleteClub = async (req, res) => {
    try {
        const { clubId } = req.params;
        const deletedClub = await clubs.findByIdAndDelete(clubId);
        if (!deletedClub) {
            return res.status(404).json({ message: 'Club not found' });
        }
        res.status(200).json({ message: 'Club deleted successfully', club: deletedClub });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting club' });
    }
};  

module.exports = {
    addClub,
    getClubs,
    getClubById,
    updateClub,
    deleteClub
};