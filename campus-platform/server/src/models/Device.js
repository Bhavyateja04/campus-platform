const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema({

  expoPushToken: {
    type: String,
    unique: true,
  },

});

module.exports = mongoose.model(
  "Device",
  DeviceSchema
);