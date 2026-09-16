const INITIAL_FLOWER_POSITION = 0.74;

const clampPosition = (value) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
};

const normalizeDirection = (direction) => (direction === -1 ? -1 : 1);

const defaultRuntimeState = {
  position: 0,
  direction: 1,
  facing: 1,
  flower: {
    position: INITIAL_FLOWER_POSITION,
    seed: 0,
    visible: true,
  },
};

let canaryRuntimeState = {
  ...defaultRuntimeState,
  flower: { ...defaultRuntimeState.flower },
};

export const readCanaryRuntimeState = () => ({
  ...canaryRuntimeState,
  flower: { ...canaryRuntimeState.flower },
});

export const updateCanaryRuntimeState = (nextState = {}) => {
  const nextFlower = nextState.flower
    ? {
        ...canaryRuntimeState.flower,
        ...nextState.flower,
        position:
          typeof nextState.flower.position === "number"
            ? clampPosition(nextState.flower.position)
            : canaryRuntimeState.flower.position,
        visible:
          typeof nextState.flower.visible === "boolean"
            ? nextState.flower.visible
            : canaryRuntimeState.flower.visible,
      }
    : canaryRuntimeState.flower;

  canaryRuntimeState = {
    ...canaryRuntimeState,
    ...nextState,
    position:
      typeof nextState.position === "number"
        ? clampPosition(nextState.position)
        : canaryRuntimeState.position,
    direction:
      typeof nextState.direction === "number"
        ? normalizeDirection(nextState.direction)
        : canaryRuntimeState.direction,
    facing:
      typeof nextState.facing === "number"
        ? normalizeDirection(nextState.facing)
        : canaryRuntimeState.facing,
    flower: nextFlower,
  };

  return readCanaryRuntimeState();
};
