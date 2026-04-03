import { motion, useAnimation } from "framer-motion";
import { useRef, useState } from "react";

const XLogo = ({ fill }: { fill: string }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" style={{ fill, transition: "fill 0.2s ease" }}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L3.283 2.25H9.59l4.258 5.658Zm-1.161 16.81h1.833L7.084 4.126H5.117Z" />
  </svg>
);

export function XAuthButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const xControls = useAnimation();
  const bgControls = useAnimation();
  const [hovered, setHovered] = useState(false);

  const handleHoverStart = () => {
    setHovered(true);
    xControls.stop();
    xControls.set({ scale: 1 });
    xControls.start({ scale: 1.35, transition: { type: "spring", stiffness: 280, damping: 18 } });
    bgControls.start({ opacity: 1, transition: { duration: 0.3 } });
  };

  const handleHoverEnd = () => {
    setHovered(false);
    xControls.start({ scale: 1, transition: { duration: 0.25 } });
    bgControls.start({ opacity: 0, transition: { duration: 0.3 } });
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
        className="flex-1 relative overflow-hidden rounded-xl border border-surface-container-high bg-white"
        >
        {/* Black base — absolute relative to button so it fills the full button */}
        <motion.div
          animate={bgControls}
          initial={{ opacity: 0 }}
          className="absolute inset-0 z-0"
          style={{ background: "#000" }}
        />

        <div className="relative w-full py-3 flex items-center justify-center cursor-pointer select-none">
          {/* X Icon */}
          <motion.div animate={xControls} initial={{ scale: 1 }} className="relative z-20">
            <XLogo fill={hovered ? "#ffffff" : "#000000"} />
          </motion.div>
        </div>
      </button>
    </>
  );
}