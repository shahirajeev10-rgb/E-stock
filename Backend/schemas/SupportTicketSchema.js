const { Schema } = require("mongoose");

const supportTicketSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Lesson Access",
        "Dashboard Issue",
        "Account Login",
        "Simulation / Demo",
        "Other",
      ],
      default: "Other",
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    responseMessage: {
      type: String,
      trim: true,
      maxlength: 1500,
      default: "",
    },
    responseBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    responseAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = supportTicketSchema;
