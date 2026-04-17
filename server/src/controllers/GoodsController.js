const Goods = require("../models/GoodsModel");
    const createGoodsItem = async (req, res) => {
        try {
          const item = await Goods.create(req.body);
            res.status(201).json({
                message: "Goods Uploaded successfully",
                data: item
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error creating goods item"
            });
        }
    };
const updateItem = async(req,res) =>{
    try {
        const item = await Goods.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.status(200).json({
          message: "Goods item updated successfully",
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
            const items =await Goods.find();
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
            await Goods.findByIdAndDelete(req.params.id);
            res.status(200).json({
                message: "Goods item deleted successfully"
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error deleting item"
            });
        }
    };
module.exports = { createGoodsItem, updateItem, viewItems, deleteItem };