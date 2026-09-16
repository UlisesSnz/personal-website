const drops = [5, 14, 23, 32, 41, 50, 59, 68, 77, 86, 95];

export default function CanaryRain({ flowerPosition, stageWidth, reach, isSheltering, shelterSide }) {
  // Anchor the shower to the flower's neighborhood, so the cloud stays put
  // when the bird takes shelter. Clamp it inside the stage on narrow screens.
  const width = Math.min(stageWidth, reach * 2);
  const left = Math.max(0, Math.min(stageWidth - width, flowerPosition * stageWidth - width / 2));
  const flowerCenter = flowerPosition * stageWidth - left;
  const shelterCenter = flowerCenter + shelterSide * 26;

  return (
    <div className="canary-rain" aria-hidden="true" style={{ left, width }}>
      <span className="canary-rain-cloud" />
      {drops.map((dropPosition, index) => (
        <span
          key={dropPosition}
          className="canary-rain-drop"
          data-sheltered={isSheltering && Math.abs(dropPosition / 100 * width - shelterCenter) < 24 || undefined}
          style={{
            left: `${dropPosition}%`,
            animationDelay: `${index * -0.17}s`,
            animationDuration: `${0.65 + (index % 3) * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}
