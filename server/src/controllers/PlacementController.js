const Placements = require("../models/PlacementsModels");
    const createPlacementItem = async (req, res) => {
        try {
          const item = await Placements.create(req.body);
            res.status(201).json({
                message: "Experience Uploaded successfully",
                data: item
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error creating Experience item"
            });
        }
    };
const updateItem = async(req,res) =>{
    try {
        const item = await Placements.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.status(200).json({
          message: "Experience item updated successfully",
          data: item
        });
        } catch (error) {
            console.error(error);
            res.status(500).json({
              message: "Error updating item"
            });
        }
    };
    const viewItems= async(req,res) =>{
        try{
            const items =await Placements.find();
            res.status(200).json({
                message:"Experience items retrieved successfully",
                data:items
            });
        }catch(error){
            console.error(error);
            res.status(500).json({
                message:"Error retrieving items"
            });
        }
    }
    const deleteItem = async(req,res) =>{
        try {
            await Placements.findByIdAndDelete(req.params.id);
            res.status(200).json({
                message: "Experience item deleted successfully"
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error deleting item"
            });
        }
    };
module.exports = { createPlacementItem, updateItem, viewItems, deleteItem };