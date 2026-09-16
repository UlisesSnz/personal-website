"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  CANARY_ACTION_NAMES,
  DEFAULT_CANARY_SIZE,
  getCanaryActionConfig,
  getCanaryFrameSrc,
  normalizeCanaryAction,
} from "@/lib/canary/canaryActions";

// Keep the small sprite images mounted across actions so a transition never
// replaces a decoded frame with a newly mounted, still-loading image.
const canaryFrames = CANARY_ACTION_NAMES.flatMap((action) => {
  const config = getCanaryActionConfig(action);
  return Array.from({ length: config.frames }, (_, frameIndex) => ({
    action,
    frameIndex,
    src: getCanaryFrameSrc(action, frameIndex),
    style: config.frameStyles?.[frameIndex] || {},
  }));
});

const CanarySprite = ({
  action = "idle",
  alt = "Canary",
  className = "",
  reducedMotion = false,
  size = DEFAULT_CANARY_SIZE,
}) => {
  const normalizedAction = normalizeCanaryAction(action);
  const config = getCanaryActionConfig(normalizedAction);
  const [loadedFrames, setLoadedFrames] = useState(() => new Set());
  const isActionReady = canaryFrames
    .filter((frame) => frame.action === normalizedAction)
    .every((frame) => loadedFrames.has(frame.src));
  const [frameState, setFrameState] = useState({
    action: normalizedAction,
    frameIndex: 0,
  });
  const frameIndex =
    frameState.action === normalizedAction ? frameState.frameIndex : 0;
  const lastFrameSrc = getCanaryFrameSrc(frameState.action, frameState.frameIndex);
  const fallbackFrame = loadedFrames.has(lastFrameSrc)
    ? frameState
    : canaryFrames.find((frame) => loadedFrames.has(frame.src)) || {
        action: "idle",
        frameIndex: 0,
      };
  const displayedAction = isActionReady ? normalizedAction : fallbackFrame.action;
  const displayedFrameIndex = isActionReady
    ? (reducedMotion ? 0 : frameIndex)
    : fallbackFrame.frameIndex;

  useEffect(() => {
    if (!isActionReady || reducedMotion || config.frames <= 1) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setFrameState((currentState) => {
        const currentFrame =
          currentState.action === normalizedAction
            ? currentState.frameIndex
            : 0;
        const nextFrame = currentFrame + 1;

        if (nextFrame < config.frames) {
          return {
            action: normalizedAction,
            frameIndex: nextFrame,
          };
        }

        return {
          action: normalizedAction,
          frameIndex: config.loop ? 0 : currentFrame,
        };
      });
    }, 1000 / config.fps);

    return () => window.clearInterval(interval);
  }, [
    config.fps,
    config.frames,
    config.loop,
    isActionReady,
    normalizedAction,
    reducedMotion,
  ]);

  return (
    <span
      className={`relative block shrink-0 overflow-visible ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {canaryFrames.map((frame) => {
        const isVisibleFrame =
          frame.action === displayedAction &&
          frame.frameIndex === displayedFrameIndex;

        return (
          <Image
            key={frame.src}
            src={frame.src}
            alt={isVisibleFrame ? alt : ""}
            aria-hidden={!isVisibleFrame}
            width={size}
            height={size}
            unoptimized
            loading="eager"
            onLoad={() =>
              setLoadedFrames((current) => {
                if (current.has(frame.src)) return current;
                return new Set(current).add(frame.src);
              })
            }
            draggable={false}
            className={`absolute inset-0 h-full w-full select-none object-contain ${
              isVisibleFrame ? "opacity-100" : "opacity-0"
            }`}
            sizes={`${size}px`}
            style={{
              imageRendering: "pixelated",
              ...frame.style,
            }}
          />
        );
      })}
    </span>
  );
};

export default CanarySprite;
