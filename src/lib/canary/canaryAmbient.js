const ambientChoices = [
  { action: "blink", weight: 4 },
  { action: "curious", weight: 3 },
  { action: "hop", weight: 1 },
  { action: null, weight: 2 },
];

export const getCanaryRestDelay = (random = Math.random) =>
  5000 + Math.round(random() * 6000);

export const pickCanaryAmbientAction = (lastAction, random = Math.random) => {
  const choices = ambientChoices.filter(
    ({ action }) => action === null || action !== lastAction
  );
  const totalWeight = choices.reduce((total, { weight }) => total + weight, 0);
  let remainingWeight = random() * totalWeight;

  for (const { action, weight } of choices) {
    remainingWeight -= weight;
    if (remainingWeight < 0) return action;
  }

  return null;
};
