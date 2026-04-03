import { motion, useAnimation } from "framer-motion";

const googleColors = ["#4285F4", "#EA4335", "#FBBC05", "#34A853", "#EA4335", "#4285F4"];
const letters = ["G", "o", "o", "g", "l", "e"];

export function GoogleAuthButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  const letterControls = letters.map(() => useAnimation());
  const auraControls = useAnimation();
  const dotControls = useAnimation();

  const handleHoverStart = async () => {
    // Reset everything first
    auraControls.stop();
    dotControls.stop();
    letterControls.forEach((ctrl) => {
      ctrl.stop();
      ctrl.set({ scale: 1, y: 0, color: "#374151" }); // gray-700
    });
    auraControls.set({ scale: 1, opacity: 0 });
    dotControls.set({ opacity: 0, x: 0, y: 0, scale: 0 });

    // Animate aura
    auraControls.start({
      scale: 4,
      opacity: 0.08,
      transition: { duration: 0.5 },
    });

    // Animate each letter with stagger: bounce up + take its Google color
    letterControls.forEach((ctrl, i) => {
      ctrl.start({
        scale: [1, 1.35, 1],
        y: [0, -6, 0],
        color: [googleColors[i], googleColors[(i + 2) % 6], googleColors[i]],
        transition: {
          duration: 0.5,
          delay: i * 0.06,
          ease: "easeInOut",
        },
      });
    });

    // Animate floating dots
    dotControls.start((i: number) => ({
      x: [0, i % 2 === 0 ? 38 : -38],
      y: [0, i < 2 ? 18 : -18],
      opacity: [0, 1, 0],
      scale: [0, 1.2, 0],
      transition: { duration: 1.4, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" },
    }));
  };

  const handleHoverEnd = () => {
    auraControls.stop();
    dotControls.stop();
    letterControls.forEach((ctrl) => ctrl.stop());

    auraControls.start({ scale: 1, opacity: 0, transition: { duration: 0.3 } });
    dotControls.start({ opacity: 0, scale: 0, transition: { duration: 0.2 } });
    letterControls.forEach((ctrl) =>
      ctrl.start({ scale: 1, y: 0, color: "#374151", transition: { duration: 0.25 } })
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex-1 relative overflow-hidden rounded-xl border border-surface-container-high transition-all"
    >
      <motion.div
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
        className="relative py-3 flex items-center justify-center bg-white cursor-pointer select-none"
      >
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
              initial={{ scale: 1, y: 0, color: "#374151" }}
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
      </motion.div>
    </button>
  );
}