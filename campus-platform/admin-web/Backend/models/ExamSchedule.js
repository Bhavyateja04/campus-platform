const mongoose = require("mongoose");

const examScheduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Exam name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Exam code is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Exam date is required"],
      trim: true,
    },
    time: {
      type: String,
      required: [true, "Exam time is required"],
      trim: true,
    },
    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamHall",
      required: false,
    },
    studentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    duration: {
      type: Number,
      default: 120,
      min: 0,
    },
    proctors: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Confirmed", "Completed", "Cancelled"],
      default: "Scheduled",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

examScheduleSchema.index({ date: 1, time: 1 });
examScheduleSchema.index({ hallId: 1 });

module.exports = mongoose.model("ExamSchedule", examScheduleSchema);
