const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
// CREATE USER
const createUser = async (req, res) => {
  try {
    //only college mail is being allowed
    const {email} =req.body;
    const allowedDomains=/@(acet|aec|aus)\.ac\.in$/;
    if(!allowedDomains.test(email)){
      return res.status(400).json({
        message: "Email must be from acet.ac.in, aec.ac.in, or aus.ac.in domains"
      });
    }
    const {password}=req.body;
    const hashePassword=await bcrypt.hash(password,10);
    req.body.password=hashePassword;
    const user = await User.create(req.body);
    console.log(user);
    res.status(201).json({
      message: "User created successfully",
      data: user,
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating user"
    });
  }
};


// GET ALL USERS
const getUsers = async (req, res) => {

  const users = await User.find().select("-password");

  res.json({
    message: "Users retrieved successfully",
    data: users
  });

};


// DELETE USER
const deleteUser = async (req, res) => {

  await User.findByIdAndDelete(req.params.id);

  res.json({
    message: "User deleted successfully"
  });

};


// UPDATE USER
const updateUser = async (req, res) => {

  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json({
    message: "User updated successfully",
    data: user
  });

};


module.exports = {
  createUser,
  getUsers,
  deleteUser,
  updateUser
};