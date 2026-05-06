const User = require("../models/UserModel");
const bcrypt = require("bcrypt");

const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id; 

    const { oldPassword, newPassword } = req.body;
     
    if (newPassword.length < 6) {
  return res.status(400).json({
    message: "Password must be at least 6 characters"
  });
}
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect"
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