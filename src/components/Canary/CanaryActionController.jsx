"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormatter, useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import CanaryFlower from "./CanaryFlower";
import CanarySprite from "./CanarySprite";
import CanarySpeechBubble from "./CanarySpeechBubble";
import {
  CANARY_ACTION_EVENT,
  DEFAULT_CANARY_ACTION,
  DEFAULT_CANARY_SIZE,
  getCanaryActionConfig,
  getCanaryActionDuration,
  getCanaryIntentConfig,
  normalizeCanaryAction,
} from "@/lib/canary/canaryActions";
import {
  buildCanaryContextMessages,
  getCanaryDialoguesForTrigger,
  normalizeCanaryDialogues,
  pickCanaryMessage,
} from "@/lib/canary/canaryMessages";
import {
  readCanaryRuntimeState,
  updateCanaryRuntimeState,
} from "@/lib/canary/canaryRuntimeState";

const ambientActions = [
  { action: "blink", move: false },
  { action: "blink", move: false },
  { action: "blink", move: false },
  { action: "blink", move: false },
  { action: "hop", duration: 620, move: false, priority: 16 },
  { action: "hop", duration: 620, move: false, priority: 16 },
  { action: "glitch", duration: 850, move: false, priority: 18 },
];

const reducedMotionAmbientActions = [{ action: "blink", move: false }];

const travelDurations = {
  alert: "180ms",
  fly: "1650ms",
  glitch: "120ms",
  happy: "620ms",
  hop: "680ms",
};

const FLOWER_LIFETIME = 7600;
const FLOWER_RESPAWN_DELAY = 1200;
const FLOWER_APPROACH_DELAY = 350;
const FLOWER_APPROACH_OFFSET = 0.04;
const FLOWER_APPROACH_GAP = 5;
const FLOWER_HOP_DISTANCE = 0.32;
const TOOLBAR_BUBBLE_GAP = 10;
const TOOLBAR_BUBBLE_READABLE_WIDTH = 156;
const TOUCH_FILTER_MESSAGE_DURATION = 3400;
const TOUCH_POINTER_WINDOW = 1400;
const flowerPositions = [0.13, 0.26, 0.39, 0.54, 0.69, 0.84];

const canaryDatasetSelector =
  "[data-canary-intent], [data-canary-click-intent], [data-canary-action], [data-canary-click-action], [data-canary-hold]";

const isTouchLikePointer = (pointerType) =>
  pointerType === "touch" || pointerType === "pen";

const readCanaryDataset = (target, trigger) => {
  const element = target?.closest?.(canaryDatasetSelector);

  if (!element) {
    return null;
  }

  const intent =
    trigger === "onClick"
      ? element.dataset.canaryClickIntent || element.dataset.canaryIntent
      : element.dataset.canaryIntent;
  const action =
    trigger === "onClick"
      ? element.dataset.canaryClickAction || element.dataset.canaryAction
      : element.dataset.canaryAction;
  const intentConfig = getCanaryIntentConfig(intent);

  if (!action && !intentConfig) {
    return null;
  }

  return {
    ...intentConfig,
    action: action || intentConfig.action,
    message: element.dataset.canaryMessage,
    trigger,
    source: element.dataset.canarySource || "dom",
  };
};

const getSeed = () => Math.floor(Date.now() / 1000);

const clampPosition = (value) => Math.min(1, Math.max(0, value));

const getCanaryCenterForStage = (position, stageWidth, size) => {
  if (!stageWidth || stageWidth <= size) {
    return clampPosition(position);
  }

  return clampPosition(
    (position * (stageWidth - size) + size / 2) / stageWidth
  );
};

const getCanaryPositionForStageCenter = (centerPosition, stageWidth, size) => {
  if (!stageWidth || stageWidth <= size) {
    return clampPosition(centerPosition);
  }

  return clampPosition(
    (centerPosition * stageWidth - size / 2) / (stageWidth - size)
  );
};

const clearTimeoutRef = (timerRef) => {
  if (timerRef.current) {
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }
};

const pickNextFlowerPosition = (currentPosition) => {
  const availablePositions = flowerPositions.filter(
    (position) => Math.abs(position - currentPosition) >= 0.22
  );
  const candidates = availablePositions.length
    ? availablePositions
    : flowerPositions;

  return candidates[Math.floor(Math.random() * candidates.length)];
};

const getFlowerSize = (canarySize) => Math.round(canarySize * 1.16);

const getFlowerApproachOffset = (stageWidth, canarySize) => {
  const flowerSize = getFlowerSize(canarySize);
  const minimumPixelGap = canarySize / 2 + flowerSize / 2 + FLOWER_APPROACH_GAP;

  if (!stageWidth || stageWidth <= minimumPixelGap) {
    return FLOWER_APPROACH_OFFSET;
  }

  return Math.max(FLOWER_APPROACH_OFFSET, minimumPixelGap / stageWidth);
};

const getFlowerApproachCenter = (
  flowerPosition,
  canaryCenterPosition,
  stageWidth,
  canarySize
) => {
  const approachDirection = canaryCenterPosition <= flowerPosition ? -1 : 1;
  const approachOffset = getFlowerApproachOffset(stageWidth, canarySize);

  return clampPosition(
    flowerPosition + approachDirection * approachOffset
  );
};

const CanaryActionController = ({
  className = "",
  context = {},
  dialogues = [],
  initialAction,
  size = DEFAULT_CANARY_SIZE,
}) => {
  const t = useTranslations('Canary');
  const format = useFormatter();
  const pathname = usePathname();
  const [initialRuntimeState] = useState(() => readCanaryRuntimeState());
  const actionTimerRef = useRef(null);
  const cooldownRef = useRef({});
  const entryKeyRef = useRef("");
  const flowerApproachTimerRef = useRef(null);
  const flowerLifeTimerRef = useRef(null);
  const flowerPositionRef = useRef(initialRuntimeState.flower.position);
  const flowerRespawnTimerRef = useRef(null);
  const flowerStateRef = useRef(initialRuntimeState.flower);
  const approachedFlowerSeedRef = useRef(null);
  const heldFilterElementRef = useRef(null);
  const hoverReleaseTimerRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const lastPointerRef = useRef({ timestamp: 0, type: "mouse" });
  const lastDatasetElementRef = useRef(null);
  const messageRef = useRef("");
  const messageTimerRef = useRef(null);
  const positionDirectionRef = useRef(initialRuntimeState.direction);
  const positionRef = useRef(initialRuntimeState.position);
  const stageRef = useRef(null);
  const stageWidthRef = useRef(0);
  const touchFilterReleaseTimerRef = useRef(null);
  const actionStateRef = useRef({
    action: DEFAULT_CANARY_ACTION,
    priority: 0,
    interruptible: true,
  });
  const [currentAction, setCurrentAction] = useState(
    normalizeCanaryAction(initialAction || DEFAULT_CANARY_ACTION)
  );
  const [message, setMessage] = useState("");
  const [isReadingFilter, setIsReadingFilter] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPageHidden, setIsPageHidden] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [canaryFacing, setCanaryFacing] = useState(
    initialRuntimeState.facing
  );
  const [flowerState, setFlowerState] = useState(initialRuntimeState.flower);
  const [flowerReadySeed, setFlowerReadySeed] = useState(null);
  const [canaryPosition, setCanaryPosition] = useState(
    initialRuntimeState.position
  );
  const [stageWidth, setStageWidth] = useState(0);

  const updateMessage = useCallback((nextMessage = "") => {
    messageRef.current = nextMessage;
    setMessage(nextMessage);
  }, []);

  const commitFlowerState = useCallback((updater) => {
    const nextState =
      typeof updater === "function" ? updater(flowerStateRef.current) : updater;
    flowerStateRef.current = nextState;
    flowerPositionRef.current = nextState.position;
    updateCanaryRuntimeState({ flower: nextState });
    setFlowerState(nextState);
  }, []);

  const handleFlowerReady = useCallback((seed) => {
    const flower = flowerStateRef.current;
    if (flower.visible && flower.seed === seed) setFlowerReadySeed(seed);
  }, []);

  const normalizedDialogues = useMemo(
    () => normalizeCanaryDialogues(dialogues),
    [dialogues]
  );
  const contextMessages = useMemo(
    () => buildCanaryContextMessages(
      context,
      t,
      (date) => format.dateTime(new Date(`${date}T00:00:00Z`), 'contentDate')
    ),
    [context, format, t]
  );
  const entryKey = [
    pathname,
    context.pageType || "",
    context.totalCount ?? "",
    context.categoryName || "",
    context.contentType || "",
    context.date || "",
    context.estimatedReadingTime || "",
    Array.isArray(context.activeTags) ? context.activeTags.join("|") : "",
    context.activeType || "",
    context.activeSort || "",
    initialAction || "",
  ].join("::");

  const pickMessageForTrigger = useCallback(
    (trigger = "auto") => {
      const dialogueMessages = getCanaryDialoguesForTrigger(
        normalizedDialogues,
        trigger
      );
      const contextualMessages = contextMessages.filter(
        (contextMessage) => contextMessage.trigger === trigger
      );

      return pickCanaryMessage(
        [...dialogueMessages, ...contextualMessages],
        getSeed()
      );
    },
    [contextMessages, normalizedDialogues]
  );

  const getCanaryCenterPosition = useCallback(
    (position = positionRef.current) => {
      return getCanaryCenterForStage(position, stageWidthRef.current, size);
    },
    [size]
  );

  const getCanaryPositionForCenter = useCallback(
    (centerPosition) => {
      return getCanaryPositionForStageCenter(
        centerPosition,
        stageWidthRef.current,
        size
      );
    },
    [size]
  );

  const moveCanary = useCallback((action) => {
    if (action === "sleep" || action === "blink" || action === "talk") {
      return;
    }

    const currentPosition = positionRef.current;
    let nextPosition = currentPosition;
    let nextDirection = positionDirectionRef.current;

    if (action === "fly") {
      nextPosition = currentPosition >= 0.5 ? 0 : 1;
      nextDirection = nextPosition === 1 ? 1 : -1;
    } else if (action === "hop") {
      nextPosition = currentPosition + nextDirection * 0.16;

      if (nextPosition >= 1) {
        nextPosition = 1;
        nextDirection = -1;
      } else if (nextPosition <= 0) {
        nextPosition = 0;
        nextDirection = 1;
      }
    } else if (action === "happy") {
      nextPosition = currentPosition + nextDirection * 0.08;
    } else if (action === "alert" || action === "glitch") {
      nextPosition = currentPosition;
    }

    nextPosition = clampPosition(nextPosition);
    positionRef.current = nextPosition;
    positionDirectionRef.current = nextDirection;
    setCanaryFacing(nextDirection);
    setCanaryPosition(nextPosition);
    updateCanaryRuntimeState({
      position: nextPosition,
      direction: nextDirection,
      facing: nextDirection,
    });
  }, []);

  const moveCanaryTo = useCallback((targetPosition, facingDirection) => {
    const currentPosition = positionRef.current;
    const nextPosition = clampPosition(targetPosition);
    const nextDirection =
      facingDirection === 1 || facingDirection === -1
        ? facingDirection
        : nextPosition > currentPosition
          ? 1
          : nextPosition < currentPosition
            ? -1
            : positionDirectionRef.current;

    positionRef.current = nextPosition;
    positionDirectionRef.current = nextDirection;
    setCanaryFacing(nextDirection);
    setCanaryPosition(nextPosition);
    updateCanaryRuntimeState({
      position: nextPosition,
      direction: nextDirection,
      facing: nextDirection,
    });
  }, []);

  const resetActionToDefault = useCallback(
    ({ action = DEFAULT_CANARY_ACTION, clearMessage = false } = {}) => {
      const fallbackAction = normalizeCanaryAction(action);

      actionStateRef.current = {
        action: fallbackAction,
        priority: getCanaryActionConfig(fallbackAction).priority,
        interruptible: true,
      };
      setCurrentAction(fallbackAction);

      if (clearMessage) {
        updateMessage("");
      }
    },
    [updateMessage]
  );

  const requestAction = useCallback(
    (nextAction, options = {}) => {
      const normalizedAction = normalizeCanaryAction(nextAction);
      const config = getCanaryActionConfig(normalizedAction);
      const now = Date.now();
      const currentState = actionStateRef.current;
      const nextPriority = options.priority ?? config.priority;

      if (
        !options.force &&
        !options.ignoreCooldown &&
        config.cooldown > 0 &&
        now - (cooldownRef.current[normalizedAction] || 0) < config.cooldown
      ) {
        return;
      }

      if (
        !options.force &&
        !currentState.interruptible &&
        nextPriority < currentState.priority
      ) {
        return;
      }

      cooldownRef.current[normalizedAction] = now;
      actionStateRef.current = {
        action: normalizedAction,
        priority: nextPriority,
        interruptible: config.interruptible,
      };
      if (
        typeof options.targetPosition === "number" &&
        options.move !== false &&
        !isReducedMotion
      ) {
        moveCanaryTo(options.targetPosition, options.facingDirection);
      } else if (options.move !== false && !isReducedMotion) {
        moveCanary(normalizedAction);
      }

      setCurrentAction(normalizedAction);
      const nextMessage = options.message || "";
      const shouldHoldAction = Boolean(options.holdAction && nextMessage);
      const shouldHoldMessage = Boolean(options.holdMessage && nextMessage);

      updateMessage(nextMessage);

      clearTimeoutRef(actionTimerRef);
      clearTimeoutRef(messageTimerRef);

      if (nextMessage && !shouldHoldMessage) {
        const messageDelay =
          options.messageDuration ?? options.duration ?? 3000;

        messageTimerRef.current = window.setTimeout(() => {
          updateMessage("");
          messageTimerRef.current = null;
        }, messageDelay);
      }

      const shouldFallback = config.fallback && config.fallback !== normalizedAction;

      if (shouldFallback && !shouldHoldAction) {
        const fallbackDelay =
          options.duration ??
          config.fallbackDuration ??
          Math.max(getCanaryActionDuration(normalizedAction), 800);

        actionTimerRef.current = window.setTimeout(() => {
          resetActionToDefault({
            action: config.fallback || DEFAULT_CANARY_ACTION,
            clearMessage: !shouldHoldMessage,
          });
        }, fallbackDelay);
      }
    },
    [
      isReducedMotion,
      moveCanary,
      moveCanaryTo,
      resetActionToDefault,
      updateMessage,
    ]
  );

  const approachFlower = useCallback(
    (flowerPosition) => {
      const canaryCenterPosition = getCanaryCenterPosition();
      const targetCenterPosition = getFlowerApproachCenter(
        flowerPosition,
        canaryCenterPosition,
        stageWidthRef.current,
        size
      );
      const targetPosition = getCanaryPositionForCenter(targetCenterPosition);
      const distance = Math.abs(targetCenterPosition - canaryCenterPosition);
      const action = distance <= FLOWER_HOP_DISTANCE ? "hop" : "fly";
      const facingDirection = flowerPosition >= canaryCenterPosition ? 1 : -1;

      requestAction(action, {
        duration: action === "hop" ? 680 : 1650,
        facingDirection,
        ignoreCooldown: true,
        move: true,
        priority: action === "hop" ? 46 : 54,
        targetPosition,
      });
    },
    [getCanaryCenterPosition, getCanaryPositionForCenter, requestAction, size]
  );

  const spawnFlower = useCallback(() => {
    const nextPosition = pickNextFlowerPosition(flowerPositionRef.current);

    commitFlowerState((currentState) => ({
      position: nextPosition,
      seed: currentState.seed + 1,
      visible: true,
    }));
  }, [commitFlowerState]);

  useEffect(() => {
    const updateThemeState = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    updateThemeState();
    const observer = new MutationObserver(updateThemeState);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateStageWidth = () => {
      const nextStageWidth =
        stageRef.current?.getBoundingClientRect().width || 0;

      stageWidthRef.current = nextStageWidth;
      setStageWidth((currentWidth) =>
        Math.abs(currentWidth - nextStageWidth) > 0.5
          ? nextStageWidth
          : currentWidth
      );
    };

    updateStageWidth();

    if (typeof ResizeObserver === "undefined" || !stageRef.current) {
      window.addEventListener("resize", updateStageWidth);

      return () => window.removeEventListener("resize", updateStageWidth);
    }

    const observer = new ResizeObserver(updateStageWidth);
    observer.observe(stageRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageHidden(document.hidden);
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => setIsReducedMotion(mediaQuery.matches);

    updateReducedMotion();
    mediaQuery.addEventListener("change", updateReducedMotion);

    return () => mediaQuery.removeEventListener("change", updateReducedMotion);
  }, []);

  useEffect(() => {
    const handleCanaryEvent = (event) => {
      const detail = event.detail || {};
      const trigger = detail.trigger || "auto";
      const intentConfig = getCanaryIntentConfig(detail.intent);
      const pickedMessage =
        detail.message || pickMessageForTrigger(trigger)?.message || "";

      requestAction(detail.action || intentConfig?.action || "talk", {
        message: pickedMessage,
        duration: detail.duration ?? intentConfig?.duration,
        messageDuration: detail.messageDuration ?? intentConfig?.messageDuration,
        force: detail.force ?? intentConfig?.force,
        holdAction: detail.holdAction ?? intentConfig?.holdAction,
        holdMessage: detail.holdMessage ?? intentConfig?.holdMessage,
        ignoreCooldown: detail.ignoreCooldown ?? intentConfig?.ignoreCooldown,
        move: detail.move ?? intentConfig?.move,
        priority: detail.priority ?? intentConfig?.priority,
      });
    };

    window.addEventListener(CANARY_ACTION_EVENT, handleCanaryEvent);
    document.addEventListener(CANARY_ACTION_EVENT, handleCanaryEvent);

    return () => {
      window.removeEventListener(CANARY_ACTION_EVENT, handleCanaryEvent);
      document.removeEventListener(CANARY_ACTION_EVENT, handleCanaryEvent);
    };
  }, [pickMessageForTrigger, requestAction]);

  useEffect(() => {
    const clearHoverTimer = () => {
      clearTimeoutRef(hoverTimerRef);
    };

    const clearHoverReleaseTimer = () => {
      clearTimeoutRef(hoverReleaseTimerRef);
    };

    const clearTouchFilterReleaseTimer = () => {
      clearTimeoutRef(touchFilterReleaseTimerRef);
    };

    const isRecentTouchInteraction = () => {
      const lastPointer = lastPointerRef.current;

      return (
        isTouchLikePointer(lastPointer.type) &&
        Date.now() - lastPointer.timestamp < TOUCH_POINTER_WINDOW
      );
    };

    const scheduleTouchFilterRelease = (
      element,
      messageToClear = messageRef.current
    ) => {
      clearTouchFilterReleaseTimer();

      touchFilterReleaseTimerRef.current = window.setTimeout(() => {
        if (heldFilterElementRef.current !== element) {
          return;
        }

        heldFilterElementRef.current = null;
        setIsReadingFilter(false);

        if (messageRef.current === messageToClear) {
          updateMessage("");

          if (actionStateRef.current.action === "talk") {
            resetActionToDefault();
          }
        }

        touchFilterReleaseTimerRef.current = null;
      }, TOUCH_FILTER_MESSAGE_DURATION);
    };

    const holdFilterReading = (element) => {
      clearHoverReleaseTimer();
      clearTouchFilterReleaseTimer();
      heldFilterElementRef.current = element;
      setIsReadingFilter(true);
    };

    const releaseFilterReading = (element) => {
      if (heldFilterElementRef.current !== element) {
        return;
      }

      clearHoverReleaseTimer();
      clearTouchFilterReleaseTimer();
      const messageToClear = messageRef.current;

      hoverReleaseTimerRef.current = window.setTimeout(() => {
        if (heldFilterElementRef.current !== element) {
          return;
        }

        heldFilterElementRef.current = null;
        setIsReadingFilter(false);

        if (messageRef.current !== messageToClear) {
          return;
        }

        clearTimeoutRef(messageTimerRef);

        messageTimerRef.current = window.setTimeout(() => {
          if (messageRef.current === messageToClear) {
            updateMessage("");

            if (actionStateRef.current.action === "talk") {
              resetActionToDefault();
            }
          }

          messageTimerRef.current = null;
        }, 700);
      }, 180);
    };

    const shouldHoldHover = (detail) => detail.intent === "filterInspect";

    const requestHoverAction = (detail, holdMessage = false) => {
      clearHoverTimer();

      hoverTimerRef.current = window.setTimeout(() => {
        requestAction(detail.action, {
          message: detail.message || pickMessageForTrigger("onHover")?.message,
          duration: detail.duration,
          messageDuration: detail.messageDuration,
          force: detail.force,
          holdAction: detail.holdAction,
          holdMessage,
          ignoreCooldown: detail.ignoreCooldown,
          move: detail.move,
          priority: detail.priority,
        });
      }, detail.hoverDelay ?? 180);
    };

    const handlePointerDown = (event) => {
      lastPointerRef.current = {
        timestamp: Date.now(),
        type: event.pointerType || "mouse",
      };
    };

    const handlePointerOver = (event) => {
      const element = event.target.closest(canaryDatasetSelector);

      if (!element) {
        return;
      }

      const detail = readCanaryDataset(event.target, "onHover");
      const shouldHoldFilter = element.dataset.canaryHold === "filter";
      const holdMessage = detail ? shouldHoldHover(detail) : false;

      if (lastDatasetElementRef.current === element) {
        return;
      }

      lastDatasetElementRef.current = element;

      if (holdMessage || shouldHoldFilter) {
        holdFilterReading(element);
      }

      if (!detail) {
        return;
      }

      requestHoverAction(detail, holdMessage);
    };

    const handlePointerOut = (event) => {
      const element = event.target.closest(canaryDatasetSelector);

      if (!element) {
        return;
      }

      if (event.relatedTarget && element.contains(event.relatedTarget)) {
        return;
      }

      clearHoverTimer();
      lastDatasetElementRef.current = null;

      if (isTouchLikePointer(event.pointerType)) {
        if (heldFilterElementRef.current === element) {
          scheduleTouchFilterRelease(element);
        }

        return;
      }

      if (heldFilterElementRef.current === element) {
        releaseFilterReading(element);
      }
    };

    const handleFocusIn = (event) => {
      const element = event.target.closest(canaryDatasetSelector);
      const detail = readCanaryDataset(event.target, "onHover");
      const shouldHoldFilter = element?.dataset.canaryHold === "filter";
      const holdMessage = detail ? shouldHoldHover(detail) : false;

      if (element && shouldHoldFilter) {
        holdFilterReading(element);
      }

      if (detail) {
        if (holdMessage) {
          holdFilterReading(element);
        }

        requestAction(detail.action, {
          message: detail.message || pickMessageForTrigger("onHover")?.message,
          duration: detail.duration,
          messageDuration: detail.messageDuration,
          force: detail.force,
          holdAction: detail.holdAction,
          holdMessage,
          ignoreCooldown: detail.ignoreCooldown,
          move: detail.move,
          priority: detail.priority,
        });
      }
    };

    const handleFocusOut = (event) => {
      const element = event.target.closest(canaryDatasetSelector);

      if (!element) {
        return;
      }

      if (event.relatedTarget && element.contains(event.relatedTarget)) {
        return;
      }

      if (heldFilterElementRef.current === element) {
        if (isRecentTouchInteraction()) {
          scheduleTouchFilterRelease(element);
          return;
        }

        releaseFilterReading(element);
      }
    };

    const handleClick = (event) => {
      const element = event.target.closest(canaryDatasetSelector);
      const detail = readCanaryDataset(event.target, "onClick");

      if (detail) {
        clearHoverTimer();
        const shouldHoldFilterTap =
          element?.dataset.canaryHold === "filter" &&
          isRecentTouchInteraction();
        const pickedMessage =
          detail.message || pickMessageForTrigger("onClick")?.message;

        if (shouldHoldFilterTap) {
          holdFilterReading(element);
        }

        requestAction(detail.action, {
          message: pickedMessage,
          duration: detail.duration,
          messageDuration: shouldHoldFilterTap
            ? TOUCH_FILTER_MESSAGE_DURATION
            : detail.messageDuration,
          force: detail.force,
          holdMessage: shouldHoldFilterTap ? true : detail.holdMessage,
          ignoreCooldown: shouldHoldFilterTap ? true : detail.ignoreCooldown,
          move: detail.move,
          priority: detail.priority,
        });

        if (shouldHoldFilterTap) {
          scheduleTouchFilterRelease(element, pickedMessage);
        }
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("pointerover", handlePointerOver, true);
    document.addEventListener("pointerout", handlePointerOut, true);
    document.addEventListener("focusin", handleFocusIn, true);
    document.addEventListener("focusout", handleFocusOut, true);
    document.addEventListener("click", handleClick, true);

    return () => {
      clearHoverTimer();
      clearHoverReleaseTimer();
      clearTouchFilterReleaseTimer();
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("pointerover", handlePointerOver, true);
      document.removeEventListener("pointerout", handlePointerOut, true);
      document.removeEventListener("focusin", handleFocusIn, true);
      document.removeEventListener("focusout", handleFocusOut, true);
      document.removeEventListener("click", handleClick, true);
    };
  }, [
    pickMessageForTrigger,
    requestAction,
    resetActionToDefault,
    updateMessage,
  ]);

  useEffect(() => {
    if (entryKeyRef.current === entryKey) {
      return;
    }

    entryKeyRef.current = entryKey;

    if (context.pageType === "notFound") {
      const pickedMessage = pickMessageForTrigger("auto");
      requestAction("glitch", {
        message: pickedMessage?.message,
        force: true,
        duration: 5200,
        messageDuration: 5200,
        move: false,
      });
      return;
    }

    const entryDialogue =
      pickMessageForTrigger("onEntry") || pickMessageForTrigger("auto");

    if (entryDialogue) {
      requestAction(entryDialogue.action || initialAction || "talk", {
        message: entryDialogue.message,
        force: true,
        duration: 3200,
        messageDuration: 2600,
        move: false,
      });
    } else if (initialAction) {
      requestAction(initialAction, {
        force: true,
        duration: 2200,
        move: false,
      });
    }
  }, [
    context.pageType,
    entryKey,
    initialAction,
    pickMessageForTrigger,
    requestAction,
  ]);

  useEffect(() => {
    if (context.totalCount === 0) {
      const pickedMessage = pickMessageForTrigger("auto");
      requestAction("alert", {
        message: pickedMessage?.message,
        force: true,
        duration: 5200,
        messageDuration: 4200,
        move: false,
      });
    }
  }, [context.totalCount, pickMessageForTrigger, requestAction]);

  useEffect(() => {
    if (
      isDarkMode ||
      isPageHidden ||
      isReadingFilter ||
      context.pageType === "notFound"
    ) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      if (actionStateRef.current.action !== DEFAULT_CANARY_ACTION) {
        return;
      }

      const availableAmbientActions = isReducedMotion
        ? reducedMotionAmbientActions
        : ambientActions;
      const ambientAction =
        availableAmbientActions[
          Math.floor(Math.random() * availableAmbientActions.length)
        ];

      requestAction(ambientAction.action, {
        duration: ambientAction.duration,
        move: ambientAction.move,
        priority: ambientAction.priority,
      });
    }, 7600);

    return () => window.clearInterval(interval);
  }, [
    context.pageType,
    isDarkMode,
    isPageHidden,
    isReadingFilter,
    isReducedMotion,
    requestAction,
  ]);

  useEffect(() => {
    if (
      !flowerState.visible ||
      flowerReadySeed !== flowerState.seed ||
      approachedFlowerSeedRef.current === flowerState.seed ||
      !["idle", "blink"].includes(currentAction) ||
      context.pageType === "notFound" ||
      isDarkMode ||
      isPageHidden ||
      isReadingFilter ||
      isReducedMotion
    ) {
      return undefined;
    }

    flowerApproachTimerRef.current = window.setTimeout(() => {
      approachedFlowerSeedRef.current = flowerState.seed;
      approachFlower(flowerPositionRef.current);
      flowerApproachTimerRef.current = null;
    }, FLOWER_APPROACH_DELAY);

    return () => {
      clearTimeoutRef(flowerApproachTimerRef);
    };
  }, [
    approachFlower,
    context.pageType,
    currentAction,
    flowerReadySeed,
    flowerState.seed,
    flowerState.visible,
    isDarkMode,
    isPageHidden,
    isReadingFilter,
    isReducedMotion,
  ]);

  useEffect(() => {
    clearTimeoutRef(flowerLifeTimerRef);
    clearTimeoutRef(flowerRespawnTimerRef);

    if (context.pageType === "notFound") {
      return undefined;
    }

    if (isDarkMode) {
      commitFlowerState((currentState) =>
        currentState.visible
          ? currentState
          : {
              ...currentState,
              seed: currentState.seed + 1,
              visible: true,
            }
      );
      return undefined;
    }

    if (isPageHidden || isReadingFilter || isReducedMotion) {
      return undefined;
    }

    if (!flowerState.visible) {
      flowerRespawnTimerRef.current = window.setTimeout(() => {
        spawnFlower();
        flowerRespawnTimerRef.current = null;
      }, FLOWER_RESPAWN_DELAY);

      return () => {
        clearTimeoutRef(flowerRespawnTimerRef);
      };
    }

    // Count the flower's lifetime from its rendered appearance, including on
    // slow connections, rather than from when its canvas was mounted.
    if (flowerReadySeed !== flowerState.seed) return undefined;

    flowerLifeTimerRef.current = window.setTimeout(() => {
      commitFlowerState((currentState) => ({
        ...currentState,
        visible: false,
      }));
    }, FLOWER_LIFETIME);

    return () => {
      clearTimeoutRef(flowerLifeTimerRef);
      clearTimeoutRef(flowerRespawnTimerRef);
    };
  }, [
    commitFlowerState,
    context.pageType,
    flowerReadySeed,
    flowerState.seed,
    flowerState.visible,
    isDarkMode,
    isPageHidden,
    isReadingFilter,
    isReducedMotion,
    spawnFlower,
  ]);

  useEffect(() => {
    return () => {
      clearTimeoutRef(actionTimerRef);
      clearTimeoutRef(messageTimerRef);
      clearTimeoutRef(flowerApproachTimerRef);
      clearTimeoutRef(flowerLifeTimerRef);
      clearTimeoutRef(flowerRespawnTimerRef);
      updateCanaryRuntimeState({
        position: positionRef.current,
        direction: positionDirectionRef.current,
        facing: positionDirectionRef.current,
        flower: flowerStateRef.current,
      });
      entryKeyRef.current = "";
    };
  }, []);

  const shouldFinishMovementBeforeSleep =
    isDarkMode && !isPageHidden && ["fly", "hop"].includes(currentAction);
  const displayAction =
    isPageHidden || (isDarkMode && !shouldFinishMovementBeforeSleep)
      ? "sleep"
      : currentAction;
  const displayMessage = isDarkMode || isPageHidden ? "" : message;
  const gestureClass = `canary-gesture canary-gesture-${displayAction}`;
  const positionPercent = canaryPosition * 100;
  const travelDuration = travelDurations[displayAction] || "520ms";
  const isInlinePlacement = className.includes("canary-inline");
  const isToolbarPlacement = className.includes("canary-toolbar");
  const canaryCenterPosition = getCanaryCenterForStage(
    canaryPosition,
    stageWidth,
    size
  );
  const isFlowerVisible =
    flowerState.visible && context.pageType !== "notFound";
  const canaryCenterPx = canaryCenterPosition * stageWidth;
  const canaryHalfWidthPx = size / 2;
  const leftBubbleSpace = Math.max(
    0,
    canaryCenterPx - canaryHalfWidthPx - TOOLBAR_BUBBLE_GAP
  );
  const rightBubbleSpace = Math.max(
    0,
    stageWidth - canaryCenterPx - canaryHalfWidthPx - TOOLBAR_BUBBLE_GAP
  );
  const bubbleSide = (() => {
    if (isInlinePlacement) {
      return "right";
    }

    const pickAvailableToolbarSide = (preferredSide) => {
      if (!isToolbarPlacement || !stageWidth) {
        return preferredSide;
      }

      const preferredSpace =
        preferredSide === "left" ? leftBubbleSpace : rightBubbleSpace;
      const alternateSpace =
        preferredSide === "left" ? rightBubbleSpace : leftBubbleSpace;

      if (
        preferredSpace < TOOLBAR_BUBBLE_READABLE_WIDTH &&
        alternateSpace > preferredSpace
      ) {
        return preferredSide === "left" ? "right" : "left";
      }

      return preferredSide;
    };

    if (canaryCenterPosition > 0.72) {
      return pickAvailableToolbarSide("left");
    }

    if (canaryCenterPosition < 0.2) {
      return pickAvailableToolbarSide("right");
    }

    if (isFlowerVisible) {
      return pickAvailableToolbarSide(
        flowerState.position >= canaryCenterPosition ? "left" : "right"
      );
    }

    return pickAvailableToolbarSide(
      canaryCenterPosition > 0.68 ? "left" : "right"
    );
  })();
  const bubbleMaxWidth =
    isToolbarPlacement && stageWidth
      ? Math.max(
          1,
          bubbleSide === "left" ? leftBubbleSpace : rightBubbleSpace
        )
      : undefined;
  const canaryHalfWidthPosition =
    stageWidth && stageWidth > size ? size / 2 / stageWidth : 0;
  const bubblePosition = clampPosition(
    bubbleSide === "left"
      ? canaryCenterPosition - canaryHalfWidthPosition
      : canaryCenterPosition + canaryHalfWidthPosition
  );

  return (
    <div className={`flex min-w-0 items-center ${className}`}>
      <div
        ref={stageRef}
        className="canary-stage"
        style={{
          "--canary-size": `${size}px`,
          "--canary-bubble-max-width":
            typeof bubbleMaxWidth === "number"
              ? `${bubbleMaxWidth}px`
              : undefined,
          "--canary-bubble-position": bubblePosition,
          "--canary-position": canaryPosition,
        }}
      >
        {flowerState.visible && context.pageType !== "notFound" ? (
          <CanaryFlower
            key={flowerState.seed}
            seed={flowerState.seed}
            onReady={handleFlowerReady}
            position={flowerState.position}
            reducedMotion={isReducedMotion}
            size={getFlowerSize(size)}
          />
        ) : null}
        <div
          className="canary-locomotion"
          style={{
            left: `${positionPercent}%`,
            transform: `translateX(-${positionPercent}%)`,
            "--canary-travel-duration": travelDuration,
          }}
        >
          <button
            type="button"
            aria-label={t('activateGlitch')}
            className="canary-hitbox shrink-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary dark:focus-visible:outline-primaryDark"
            onClick={() =>
              requestAction("glitch", {
                duration: 700,
                force: true,
                move: false,
              })
            }
            onMouseEnter={() => requestAction("blink", { move: false })}
          >
            <span className={gestureClass}>
              <span
                className="canary-facing"
                style={{ "--canary-facing": canaryFacing }}
              >
                <CanarySprite
                  action={displayAction}
                  reducedMotion={isReducedMotion}
                  size={size}
                />
              </span>
            </span>
          </button>
        </div>
        {displayMessage ? (
          <div className="canary-bubble-anchor" data-side={bubbleSide}>
            <CanarySpeechBubble
              action={displayAction}
              message={displayMessage}
              side={bubbleSide}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CanaryActionController;
