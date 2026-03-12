const { Schema } = require("mongoose");

const lessonProgressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lessonKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
    lessonOrder: {
      type: Number,
      default: 0,
    },
    progressPct: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
    lastStep: {
      type: Number,
      default: 0,
    },
    totalSteps: {
      type: Number,
      default: 1,
    },
    unlocked: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    lastVisitedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

lessonProgressSchema.index({ user: 1, lessonKey: 1 }, { unique: true });

module.exports = lessonProgressSchema;
