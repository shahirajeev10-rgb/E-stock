const LessonProgress = require("../model/LessonProgress");
const { resolveUserId } = require("../utils/requestUser");

const LESSON_CATALOG = [
  {
    lessonKey: "fundamentals",
    title: "Lesson 1: Fundamentals",
    path: "/lessons/fundamentals",
    lessonOrder: 1,
  },
  {
    lessonKey: "price-movement",
    title: "Lesson 2: Price Movement",
    path: "/lessons/price-movement",
    lessonOrder: 2,
  },
  {
    lessonKey: "profit-loss-portfolio",
    title: "Lesson 3: Profit, Loss & Portfolio",
    path: "/lessons/profit-loss-portfolio",
    lessonOrder: 3,
  },
  {
    lessonKey: "risk-management",
    title: "Lesson 4: Risk Management",
    path: "/lessons/risk-management",
    lessonOrder: 4,
  },
  {
    lessonKey: "trading-simulator",
    title: "Trading Simulation Practice",
    path: "/practice/simulator",
    lessonOrder: 5,
  },
];

const lessonCatalogMap = Object.fromEntries(
  LESSON_CATALOG.map((lesson) => [lesson.lessonKey, lesson])
);

function normalizeLessonKey(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeProgress(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Number(n.toFixed(2))));
}

function normalizeStep(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.floor(n));
}

function inferStatus(progressPct, explicitStatus) {
  if (explicitStatus === "completed" || progressPct >= 100) return "completed";
  if (progressPct > 0) return "in_progress";
  return "not_started";
}

function buildDefaultProgress(catalogItem) {
  return {
    ...catalogItem,
    progressPct: 0,
    status: "not_started",
    lastStep: 0,
    totalSteps: 1,
    unlocked: false,
    startedAt: null,
    completedAt: null,
    lastVisitedAt: null,
  };
}

function unlockAllRecords(records) {
  return [...records]
    .sort((a, b) => Number(a.lessonOrder || 0) - Number(b.lessonOrder || 0))
    .map((record) => ({
      ...record,
      unlocked: true,
    }));
}

function mergeCatalogWithDocs(docs = []) {
  const byKey = Object.fromEntries(
    docs.map((doc) => [doc.lessonKey, doc.toJSON ? doc.toJSON() : doc])
  );

  const merged = LESSON_CATALOG.map((item) => ({
    ...buildDefaultProgress(item),
    ...(byKey[item.lessonKey] || {}),
  }));

  return unlockAllRecords(merged);
}

function summarize(records) {
  const completed = records.filter((x) => x.status === "completed").length;
  const started = records.filter((x) => x.progressPct > 0).length;
  const totalLessons = records.length;
  const averageProgress =
    totalLessons > 0
      ? Number(
          (
            records.reduce((sum, item) => sum + Number(item.progressPct || 0), 0) / totalLessons
          ).toFixed(1)
        )
      : 0;

  const ordered = [...records].sort(
    (a, b) => Number(a.lessonOrder || 0) - Number(b.lessonOrder || 0)
  );
  const nextLesson =
    ordered.find((x) => x.status !== "completed" && x.unlocked) ||
    ordered.find((x) => x.status !== "completed") ||
    null;

  return {
    totalLessons,
    completed,
    started,
    averageProgress,
    nextLesson: nextLesson
      ? {
          lessonKey: nextLesson.lessonKey,
          title: nextLesson.title,
          path: nextLesson.path,
          progressPct: nextLesson.progressPct,
        }
      : null,
  };
}

async function buildUserProgressSnapshot(userId) {
  const docs = await LessonProgress.find({ user: userId }).sort({
    lessonOrder: 1,
    createdAt: 1,
  });
  const merged = mergeCatalogWithDocs(docs);
  return {
    docs,
    merged,
    summary: summarize(merged),
    byKey: Object.fromEntries(merged.map((item) => [item.lessonKey, item])),
  };
}

async function syncUnlockedFlags(userId, mergedRecords) {
  const unlockedByKey = Object.fromEntries(
    mergedRecords.map((item) => [item.lessonKey, Boolean(item.unlocked)])
  );

  const updates = Object.entries(unlockedByKey).map(([lessonKey, unlocked]) =>
    LessonProgress.updateOne({ user: userId, lessonKey }, { $set: { unlocked } })
  );

  await Promise.all(updates);
}

async function listLessonProgress(req, res) {
  try {
    const auth = resolveUserId(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ ok: false, message: auth.message });
    }

    const { userId } = auth;
    const { merged, summary } = await buildUserProgressSnapshot(userId);
    await syncUnlockedFlags(userId, merged);

    return res.json({
      ok: true,
      data: merged,
      summary,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function getLessonProgress(req, res) {
  try {
    const auth = resolveUserId(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ ok: false, message: auth.message });
    }

    const { userId } = auth;
    const lessonKey = normalizeLessonKey(req.params.lessonKey);
    if (!lessonKey) {
      return res.status(400).json({ ok: false, message: "lessonKey is required." });
    }

    const catalogItem = lessonCatalogMap[lessonKey];
    if (!catalogItem) {
      return res.status(404).json({ ok: false, message: "Lesson progress not found." });
    }

    const { byKey } = await buildUserProgressSnapshot(userId);
    const record = byKey[lessonKey];

    return res.json({
      ok: true,
      data: record || buildDefaultProgress(catalogItem),
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function upsertLessonProgress(req, res) {
  try {
    const auth = resolveUserId(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ ok: false, message: auth.message });
    }

    const { userId } = auth;
    const lessonKey = normalizeLessonKey(req.params.lessonKey);
    const body = req.body || {};

    if (!lessonKey) {
      return res.status(400).json({ ok: false, message: "lessonKey is required." });
    }

    const catalogItem = lessonCatalogMap[lessonKey] || {
      lessonKey,
      title: body.title || lessonKey,
      path: body.path || "",
      lessonOrder: Number(body.lessonOrder || 99),
    };

    const snapshotBefore = await buildUserProgressSnapshot(userId);
    const currentRecord = snapshotBefore.byKey[lessonKey];
    if (!currentRecord || (!currentRecord.unlocked && body.force !== true)) {
      return res.status(403).json({
        ok: false,
        message: "Lesson is locked. Complete previous lesson first.",
      });
    }

    let doc = await LessonProgress.findOne({ user: userId, lessonKey });

    const incomingPct = normalizeProgress(body.progressPct);
    const progressPct = doc && body.force !== true
      ? Math.max(Number(doc.progressPct || 0), incomingPct)
      : incomingPct;

    const totalSteps = Math.max(1, normalizeStep(body.totalSteps, doc?.totalSteps || 1));
    const lastStep = Math.min(totalSteps, normalizeStep(body.lastStep, doc?.lastStep || 0));
    const status = inferStatus(progressPct, body.status);
    const now = new Date();

    if (!doc) {
      doc = new LessonProgress({
        user: userId,
        lessonKey,
        title: body.title || catalogItem.title,
        path: body.path || catalogItem.path,
        lessonOrder: Number(body.lessonOrder || catalogItem.lessonOrder || 99),
        progressPct,
        status,
        lastStep,
        totalSteps,
        unlocked: Boolean(currentRecord.unlocked),
        notes: body.notes || "",
        startedAt: progressPct > 0 ? now : null,
        completedAt: status === "completed" ? now : null,
        lastVisitedAt: now,
      });
    } else {
      doc.title = body.title || doc.title || catalogItem.title;
      doc.path = body.path || doc.path || catalogItem.path;
      doc.lessonOrder = Number(body.lessonOrder || doc.lessonOrder || catalogItem.lessonOrder || 99);
      doc.progressPct = progressPct;
      doc.status = status;
      doc.lastStep = lastStep;
      doc.totalSteps = totalSteps;
      doc.unlocked = Boolean(currentRecord.unlocked);
      if (body.notes !== undefined) {
        doc.notes = body.notes;
      }
      if (!doc.startedAt && progressPct > 0) {
        doc.startedAt = now;
      }
      if (status === "completed") {
        doc.completedAt = doc.completedAt || now;
      }
      if (status !== "completed" && body.force === true) {
        doc.completedAt = null;
      }
      doc.lastVisitedAt = now;
    }

    await doc.save();

    const snapshotAfter = await buildUserProgressSnapshot(userId);
    await syncUnlockedFlags(userId, snapshotAfter.merged);

    return res.json({
      ok: true,
      message: "Lesson progress saved.",
      data: snapshotAfter.byKey[lessonKey] || doc,
      summary: snapshotAfter.summary,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

module.exports = {
  listLessonProgress,
  getLessonProgress,
  upsertLessonProgress,
  buildUserProgressSnapshot,
  LESSON_CATALOG,
};
