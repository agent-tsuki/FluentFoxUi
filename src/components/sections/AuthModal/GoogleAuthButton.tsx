import { motion, useAnimation } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

const googleColors = ["#4285F4", "#EA4335", "#FBBC05", "#34A853", "#EA4335", "#4285F4"];
const letters = ["G", "o", "o", "g", "l", "e"];

function useRestColor() {
  const [color, setColor] = useState(() =>
    document.documentElement.classList.contains("dark") ? "#ECD4D1" : "#374151"
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setColor(
        document.documentElement.classList.contains("dark") ? "#ECD4D1" : "#374151"
      );
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return color;
}

export function GoogleAuthButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  // Fix 1: hooks called individually at top level, never inside a loop
  const ctrl0 = useAnimation();
  const ctrl1 = useAnimation();
  const ctrl2 = useAnimation();
  const ctrl3 = useAnimation();
  const ctrl4 = useAnimation();
  const ctrl5 = useAnimation();
  const auraControls = useAnimation();
  const dotControls = useAnimation();

  const letterControls = useMemo(
    () => [ctrl0, ctrl1, ctrl2, ctrl3, ctrl4, ctrl5],
    // controls are stable refs — array just needs to be memoized
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Fix 3: reactive rest color via MutationObserver
  const restColor = useRestColor();

  const handleHoverStart = useCallback(() => {
    if (disabled) return; // Fix 2: block animations when disabled

    auraControls.stop();
    dotControls.stop();
    letterControls.forEach((ctrl) => {
      ctrl.stop();
      ctrl.set({ scale: 1, y: 0, color: restColor });
    });
    auraControls.set({ scale: 1, opacity: 0 });
    dotControls.set({ opacity: 0, x: 0, y: 0, scale: 0 });

    auraControls.start({ scale: 4, opacity: 0.08, transition: { duration: 0.5 } });

    letterControls.forEach((ctrl, i) => {
      ctrl.start({
        scale: [1, 1.35, 1],
        y: [0, -6, 0],
        color: [googleColors[i], googleColors[(i + 2) % 6], googleColors[i]],
        transition: { duration: 0.5, delay: i * 0.06, ease: "easeInOut" },
      });
    });

    dotControls.start((i: number) => ({
      x: [0, i % 2 === 0 ? 38 : -38],
      y: [0, i < 2 ? 18 : -18],
      opacity: [0, 1, 0],
      scale: [0, 1.2, 0],
      transition: { duration: 1.4, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" },
    }));
  }, [disabled, restColor, auraControls, dotControls, letterControls]);

  const handleHoverEnd = useCallback(() => {
    auraControls.stop();
    dotControls.stop();
    letterControls.forEach((ctrl) => ctrl.stop());

    auraControls.start({ scale: 1, opacity: 0, transition: { duration: 0.3 } });
    dotControls.start({ opacity: 0, scale: 0, transition: { duration: 0.2 } });
    letterControls.forEach((ctrl) =>
      ctrl.start({ scale: 1, y: 0, color: restColor, transition: { duration: 0.25 } })
    );
  }, [restColor, auraControls, dotControls, letterControls]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      aria-label="Sign in with Google"
      className={`flex-1 relative overflow-hidden rounded-xl border border-surface-container-high transition-all ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {/* Fix O2: interaction events moved to button; inner div is purely visual */}
      <div className="relative py-3 flex items-center justify-center bg-surface-container-lowest select-none">
        {/* Aura */}
        <motion.div
          animate={auraControls}
          initial={{ scale: 1, opacity: 0 }}
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: "radial-gradient(circle, #4285F4 0%, transparent 70%)" }}
        />

        {/* Letter-by-letter "Google" */}
        <div className="flex items-center z-10">
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              animate={letterControls[i]}
              initial={{ scale: 1, y: 0, color: restColor }}
              className="text-lg font-bold font-headline inline-block"
              style={{ display: "inline-block" }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* Floating dots */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              animate={dotControls}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: googleColors[i] }}
            />
          ))}
        </div>
      </div>
    </button>
  );
}
