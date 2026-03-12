const mongoose = require("mongoose");
const lessonProgressSchema = require("../schemas/LessonProgressSchema");

const LessonProgress =
  mongoose.models.LessonProgress ||
  mongoose.model("LessonProgress", lessonProgressSchema);

module.exports = LessonProgress;
