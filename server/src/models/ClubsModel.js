const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  coordinatorName:{
    type:String,
    required:true
  },
  coordinatorEmail:{
    type:String,
    required:true
  },
  mobileNumber:{
    type:String,
    required:true
  },
  // createdAt: {
  //   type: Date,
  //   default: Date.now
  // }
});

module.exports = mongoose.model('Club', ClubSchema);