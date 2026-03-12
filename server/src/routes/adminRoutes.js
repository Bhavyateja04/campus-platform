const express = require("express");
const router = express.Router();

const {
  createUser,
  getUsers,
  deleteUser,
  updateUser
} = require("../controllers/adminController");


// CREATE USER
router.post("/createuser", createUser);

// GET USERS
router.get("/viewusers", getUsers);

// UPDATE USER
router.put("/users/:id", updateUser);

// DELETE USER
router.delete("/deleteuser/:id", deleteUser);


module.exports = router;