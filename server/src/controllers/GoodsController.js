const Goods = require("../models/GoodsModel");
    const createGoodsItem = async (req, res) => {
        try {
          const item = await Goods.create({
            ...req.body,
            seller:req.user.id,
            status:"available"
          });
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
        if (!item) {
          return res.status(404).json({
            message: "Item not found"
          });
        }
        if(item.seller.toString() !== req.user.id){
          return res.status(403).json({
            message: "Unauthorized to update this item"
          });
        }         Object.assign(item, req.body);
        await item.save();
        res.json({
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
            const items =await Goods.find().populate("seller", "name email");
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
            const item=await Goods.findByIdAndDelete(req.params.id);
            if (!item) {
                return res.status(404).json({
                    message: "Goods item not found"
                });
            }
            if(item.seller.toString() !== req.user.id){
                return res.status(403).json({
                    message: "Unauthorized to delete this item"
                });
            }
            await item.deleteOne();
            res.json({
                message: "Goods item deleted successfully"
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error deleting item"
            });
        }
    };
    const markAsSold = async (req, res) => {
  try {
    const item = await Goods.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    item.status = "sold";
    await item.save();

    res.json({
      message: "Item marked as sold"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { createGoodsItem, updateItem, viewItems, deleteItem, markAsSold };