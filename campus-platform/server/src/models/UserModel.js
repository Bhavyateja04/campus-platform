const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    rollNumber:{
    type: String,
    required: true,
    unique: true
    },
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    match: [/@(acet|aec|aus)\.ac\.in$/, "Email must be from acet.ac.in, aec.ac.in, or aus.ac.in domains"]
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student"
  },

  college:{
    type: String
  },

  course:{
    type: String, 
  },
  department: {
    type: String
  },

  phone: {
    type: String
  },

//   profileImage: {
//     type: String
//   },
firstLogin:{
  type: Boolean,
  default: true
},

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", UserSchema);