const User = require("../models/UserModel");
const bcrypt = require("bcrypt");

const updatePassword = async (req, res) => {

  try {

    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.firstLogin = false;

    await user.save();

    res.json({
      message: "Password updated successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error updating password"
    });

  }

};

module.exports = { updatePassword };