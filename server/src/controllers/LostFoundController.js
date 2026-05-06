const LostItem = require("../models/LostModel");
   const createLostFoundItem = async (req, res) => {
  try {
    const item = await LostItem.create({
      ...req.body,
      postedBy: req.user.id 
    });

    res.status(201).json({
      message: "Item created successfully",
      data: item
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateItem = async(req,res) =>{
    try {
        const item = await LostItem.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!item) {
          return res.status(404).json({
            message: "Item not found"
          });
        }
        if(item.postedBy.toString() !== req.user.id){
          return res.status(403).json({
            message: "Unauthorized to update this item"
          });
        }
        Object.assign(item, req.body);
        await item.save();
        res.json({
          message: "Item updated successfully",
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
            const item = await LostItem.findById(req.params.id);
            if (!item) {
                return res.status(404).json({
                    message: "Item not found"
                });
            }
            if(item.postedBy.toString() !== req.user.id){
                return res.status(403).json({
                    message: "Unauthorized to delete this item"
                });
            }
              await item.deleteOne();

    res.json({ message: "Item deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// mark found
const markFound = async (req, res) => {
  const item = await LostItem.findById(req.params.id);

  item.status = "found";
  item.foundId = req.user.id;

  await item.save();

  res.json({ message: "Marked as found" });
};

// mark resolved
const markResolved = async (req, res) => {
  const item = await LostItem.findById(req.params.id);

  if (item.postedBy.toString() !== req.user.id) {
    return res.status(403).json({ message: "Only owner can resolve" });
  }

  item.status = "resolved";

  await item.save();

  res.json({ message: "Marked as resolved" });
};
module.exports = { createLostFoundItem, updateItem, viewItems, deleteItem ,markFound, markResolved};