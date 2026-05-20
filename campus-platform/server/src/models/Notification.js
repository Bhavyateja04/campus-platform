const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({

  title: String,

  body: String,

  createdAt: {
    type: Date,
    default: Date.now,

    // AUTO DELETE AFTER 30 DAYS
    expires: 60 * 60 * 24 * 30,
  },

});

module.exports = mongoose.model(
  "Notification",
  NotificationSchema
);