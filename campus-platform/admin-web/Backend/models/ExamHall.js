const mongoose = require("mongoose");

const examHallSchema = new mongoose.Schema(
  {
    hallName: {
      type: String,
      required: [true, "Hall name is required"],
      trim: true,
    },
    capacity: {
      type: Number,
      default: 0,
      min: 0,
    },
    location: {
      type: String,
      trim: true,
      default: "Campus",
    },
    availability: {
      type: String,
      default: "Available",
    },
    floor: {
      type: String,
      trim: true,
      default: "Ground",
    },
    seatsPerRow: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRows: {
      type: Number,
      default: 0,
      min: 0,
    },
    facilities: [
      {
        type: String,
        trim: true,
      },
    ],
    examsScheduled: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

examHallSchema.index({ hallName: 1 });
examHallSchema.index({ location: 1 });

module.exports = mongoose.model("ExamHall", examHallSchema);
