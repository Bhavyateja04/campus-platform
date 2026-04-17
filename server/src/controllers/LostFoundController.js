const LostItem = require("../models/LostModel");
    const createLostFoundItem = async (req, res) => {
        try {
          const item = await LostItem.create(req.body);
            res.status(201).json({
                message: "Lost/Found item created successfully",
                data: item
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error creating lost/found item"
            });
        }
    };
const updateItem = async(req,res) =>{
    try {
        const item = await LostItem.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.status(200).json({
          message: "Lost item updated successfully",
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
            const items =await LostItem.find();
            res.status(200).json({
                message:"Items retrieved successfully",
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
            await LostItem.findByIdAndDelete(req.params.id);
            res.status(200).json({
                message: "Lost item deleted successfully"
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error deleting item"
            });
        }
    };
module.exports = { createLostFoundItem, updateItem, viewItems, deleteItem };