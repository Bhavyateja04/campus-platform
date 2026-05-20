const express = require("express");
const axios = require("axios");

const router = express.Router();

const Device = require("../models/Device");
const Notification = require("../models/Notification");



/* =========================
   SAVE DEVICE TOKEN
========================= */
router.post("/save-token", async (req, res) => {

  try {

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: "Token is required",
      });
    }

    // UPSERT → no duplicates
    await Device.updateOne(
      { expoPushToken: token },
      { expoPushToken: token },
      { upsert: true }
    );

    res.json({ success: true });

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });
  }
});



/* =========================
   SEND NOTIFICATION TO ALL
========================= */
router.post("/send-notification", async (req, res) => {

  try {

    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        error: "Title and body required",
      });
    }

    // SAVE NOTIFICATION IN DB
    await Notification.create({
      title,
      body,
    });

    // GET ALL DEVICE TOKENS
    const devices = await Device.find();

    if (!devices.length) {
      return res.json({
        message: "No devices found",
      });
    }

    // SEND IN PARALLEL (FAST)
    const promises = devices.map((device) => {

      if (!device.expoPushToken) return;

      return axios.post(
        "https://exp.host/--/api/v2/push/send",
        {
          to: device.expoPushToken,
          sound: "default",
          title,
          body,
          data: {
            screen: "Notifications",
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await Promise.all(promises);

    res.json({
      success: true,
      message: "Notification sent to all devices",
    });

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });
  }
});



/* =========================
   GET ALL NOTIFICATIONS
========================= */
router.get("/notifications", async (req, res) => {

  try {

    const notifications =
      await Notification.find()
      .sort({ createdAt: -1 });

    res.json(notifications);

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });
  }
});



module.exports = router;