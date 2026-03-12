const express = require("express");
const {
  listLessonProgress,
  getLessonProgress,
  upsertLessonProgress,
} = require("../controllers/progressController");

const router = express.Router();

router.get("/", listLessonProgress);
router.get("/:lessonKey", getLessonProgress);
router.put("/:lessonKey", upsertLessonProgress);

module.exports = router;
