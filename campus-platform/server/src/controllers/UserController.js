const User = require("../models/UserModel");
const bcrypt = require("bcrypt");

// Fields a user is allowed to update on their own profile.
// Notably excludes: email (used as identity), rollNumber (used as identity),
// role (privilege), password (handled by separate update-password endpoint).
const SELF_EDITABLE_FIELDS = ["name", "phone", "department", "course", "college"];

function publicUser(u) {
  if (!u) return null;
  return {
    id:         String(u._id),
    name:       u.name,
    email:      u.email,
    rollNumber: u.rollNumber,
    role:       u.role,
    college:    u.college || "",
    course:     u.course || "",
    department: u.department || "",
    phone:      u.phone || "",
    firstLogin: !!u.firstLogin,
    createdAt:  u.createdAt,
  };
}

// GET /api/users/me  (auth)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// PUT /api/users/me  (auth)
const updateMe = async (req, res) => {
  try {
    const updates = {};
    for (const key of SELF_EDITABLE_FIELDS) {
      if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
        const value = req.body[key];
        if (typeof value === "string") {
          updates[key] = value.trim();
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: `No editable fields supplied. Allowed: ${SELF_EDITABLE_FIELDS.join(", ")}`,
      });
    }

    if (updates.name !== undefined && updates.name.length === 0) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Profile updated", user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

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

module.exports = { getMe, updateMe, updatePassword };