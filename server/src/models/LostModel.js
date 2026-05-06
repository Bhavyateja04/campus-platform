const mongoose = require("mongoose");

const LostItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  imageUrl: {
    type: String
  },

  location: {
    type: String
  },

  dateLost: {
    type: Date
  },

  contactNumber: {
    type: String
  },

  status: {
    type: String,
    enum: ["lost", "found", "resolved"],
    default: "lost"
  },

  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  foundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  foundNumber: {
    type:Number
  }

});

module.exports = mongoose.model("LostItem", LostItemSchema);
//found by details roll number or user ID and then update the status to found and then after that if the person who lost the item finds it then update the status to resolved