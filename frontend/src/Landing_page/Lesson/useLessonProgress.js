import { useEffect, useMemo, useRef, useState } from "react";
import { auth } from "../auth";
import { fetchLessonProgressItem, saveLessonProgress } from "../../api/client";

export default function useLessonProgress({
  lessonKey,
  title,
  path,
  progressPct,
  lastStep = 0,
  totalSteps = 1,
  enabled = true,
}) {
  const [serverProgress, setServerProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const saveKeyRef = useRef("");

  const normalizedProgress = useMemo(() => {
    const n = Number(progressPct);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Number(n.toFixed(2))));
  }, [progressPct]);

  const normalizedLastStep = Math.max(0, Math.floor(Number(lastStep) || 0));
  const normalizedTotalSteps = Math.max(1, Math.floor(Number(totalSteps) || 1));

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      if (!enabled || !lessonKey || !auth.isLoggedIn()) return;

      try {
        setLoading(true);
        const res = await fetchLessonProgressItem(lessonKey);
        if (!active) return;
        setServerProgress(res?.data || null);
      } catch (err) {
        if (!active) return;
        setError(err.message || "Unable to load lesson progress.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProgress();
    return () => {
      active = false;
    };
  }, [enabled, lessonKey]);

  useEffect(() => {
    if (!enabled || !lessonKey || !auth.isLoggedIn()) return undefined;

    const payload = {
      title,
      path,
      progressPct: normalizedProgress,
      lastStep: normalizedLastStep,
      totalSteps: normalizedTotalSteps,
      status: normalizedProgress >= 100 ? "completed" : normalizedProgress > 0 ? "in_progress" : "not_started",
    };

    const signature = JSON.stringify(payload);
    if (saveKeyRef.current === signature) return undefined;

    const timeoutId = window.setTimeout(async () => {
      try {
        setSaving(true);
        setError("");
        const res = await saveLessonProgress(lessonKey, payload);
        setServerProgress(res?.data || null);
        saveKeyRef.current = signature;
      } catch (err) {
        setError(err.message || "Unable to save lesson progress.");
      } finally {
        setSaving(false);
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [
    enabled,
    lessonKey,
    normalizedLastStep,
    normalizedProgress,
    normalizedTotalSteps,
    path,
    title,
  ]);

  return {
    progressPct: Math.max(
      normalizedProgress,
      Number(serverProgress?.progressPct || 0)
    ),
    serverProgress,
    loading,
    saving,
    error,
  };
}
