"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useState } from "react";

const CanaryFlower = ({
  position = 0.5,
  onReady,
  reducedMotion = false,
  seed = 0,
  size = 42,
}) => {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (!player) return undefined;

    let hasReportedReady = false;
    const handleRender = ({ currentFrame }) => {
      // The animation starts at scale zero. Loading the file alone does not
      // mean that the flower is visible; wait for the fully grown frame.
      if (
        !hasReportedReady &&
        player.totalFrames > 0 &&
        currentFrame >= player.totalFrames - 1
      ) {
        hasReportedReady = true;
        onReady?.(seed);
      }
    };
    const handleLoad = () => {
      if (reducedMotion) player.setFrame(player.totalFrames - 1);
    };

    player.addEventListener("render", handleRender);
    player.addEventListener("load", handleLoad);
    if (player.isLoaded) {
      handleLoad();
      handleRender({ currentFrame: player.currentFrame });
    }

    return () => {
      player.removeEventListener("render", handleRender);
      player.removeEventListener("load", handleLoad);
    };
  }, [onReady, player, reducedMotion, seed]);

  return (
    <div
      aria-hidden="true"
      className="canary-flower-anchor"
      style={{
        "--canary-flower-position": position,
        "--canary-flower-size": `${size}px`,
      }}
    >
      <DotLottieReact
        src="/canary/flower.lottie"
        autoplay={!reducedMotion}
        loop={false}
        dotLottieRefCallback={setPlayer}
      />
    </div>
  );
};

export default CanaryFlower;
