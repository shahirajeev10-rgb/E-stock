const { Schema } = require("mongoose");
const passportLocalMongooseLib = require("passport-local-mongoose");
const passportLocalMongoose =
  passportLocalMongooseLib.default || passportLocalMongooseLib;

const userSchema = new Schema(
  {
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
      unique: true,
      trim: true,
      lowercase: true,
    },
    preferredCurrency: {
      type: String,
      enum: ["GBP", "USD", "EUR", "INR"],
      default: "GBP",
    },
    country: {
      type: String,
      trim: true,
      default: "UK",
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    resetPasswordTokenHash: {
      type: String,
      default: "",
      select: false,
    },
    resetPasswordExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
  usernameLowerCase: true,
});

module.exports = userSchema;
