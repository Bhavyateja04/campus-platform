const mongoose = require("mongoose");

const PlacementSchema = new mongoose.Schema({
    rollNumber:{
        type: mongoose.Schema.Types.ObjectId,
            ref: "User"
    },
  Username: {
    type: String,
    required: true
  },

  Imageurl: {
    type: String
  },
    Company: {  
    type: String,
    required: true
  },
    Position: {
        type:String,
        required:true
    },
    salary:{
        type: Number
    },
    description: {
        type: String
    },
    likes_count:{
        type: Number,
        default: 0
    },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Canteen", CanteenSchema);
//aray of objetcs for content and given by and given details