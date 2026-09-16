// Looking around does not depend on the next flower's position.
export const createCanaryFlowerSearch = (random = Math.random) => {
  const firstFacing = random() < 0.5 ? -1 : 1;
  const looks = [
    {
      action: "curious",
      facing: firstFacing,
      delay: 250 + Math.round(random() * 450),
    },
  ];

  if (random() < 0.7) {
    looks.push({
      action: "blink",
      facing: -firstFacing,
      delay: 300 + Math.round(random() * 500),
    });
  }

  return {
    looks,
    approachDelay: 450 + Math.round(random() * 950),
  };
};
