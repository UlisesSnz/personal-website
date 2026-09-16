"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const nextRainDelay = () => 35000 + Math.round(Math.random() * 35000);
const rainDuration = () => 4000 + Math.round(Math.random() * 2000);

export default function useCanaryRain({ enabled, canStart, onStart, onShelter, onFinish, resetKey }) {
  const [session, setSession] = useState({ enabled, resetKey, phase: null });
  const dueAtRef = useRef(null);
  const shelterTimerRef = useRef(null);
  const finishTimerRef = useRef(null);

  // A disabled or different page cannot inherit an unfinished rain scene.
  if (session.enabled !== enabled || session.resetKey !== resetKey) {
    setSession({ enabled, resetKey, phase: null });
  }
  const isRaining = enabled && session.resetKey === resetKey && session.phase !== null;
  const isSheltering = isRaining && session.phase === "sheltering";

  const clearRainTimer = useCallback(() => {
    window.clearTimeout(shelterTimerRef.current);
    window.clearTimeout(finishTimerRef.current);
    shelterTimerRef.current = null;
    finishTimerRef.current = null;
    dueAtRef.current = null;
  }, []);

  const cancelRain = useCallback(() => {
    clearRainTimer();
    setSession((current) => ({ ...current, phase: null }));
  }, [clearRainTimer]);

  useEffect(() => {
    if (!enabled) {
      clearRainTimer();
      return undefined;
    }
    if (isRaining || !canStart) return undefined;

    // Keep the deadline through short gestures, so they do not postpone rain
    // forever. A busy bird gets another chance after it settles down.
    dueAtRef.current ??= Date.now() + nextRainDelay();
    let startTimer;
    const begin = () => {
      if (onStart() === false) {
        startTimer = window.setTimeout(begin, 1000);
        return;
      }

      setSession((current) => ({ ...current, phase: "falling" }));
      shelterTimerRef.current = window.setTimeout(() => {
        shelterTimerRef.current = null;
        setSession((current) => ({ ...current, phase: "sheltering" }));
        onShelter();
      }, 700);
      finishTimerRef.current = window.setTimeout(() => {
        finishTimerRef.current = null;
        dueAtRef.current = Date.now() + nextRainDelay();
        setSession((current) => ({ ...current, phase: null }));
        onFinish();
      }, rainDuration());
    };

    startTimer = window.setTimeout(begin, Math.max(0, dueAtRef.current - Date.now()));
    return () => window.clearTimeout(startTimer);
  }, [enabled, canStart, isRaining, onStart, onShelter, onFinish, clearRainTimer, resetKey]);

  useEffect(() => clearRainTimer, [clearRainTimer, resetKey]);

  return { isRaining, isSheltering, cancelRain };
}
