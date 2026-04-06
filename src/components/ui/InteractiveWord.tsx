"use client";
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface InteractiveWordProps {
  kanji: string;
  reading: string;
  meaning: string;
  showAll?: boolean;
}

export function InteractiveWord({ kanji, reading, meaning, showAll = false }: InteractiveWordProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const spanRef = useRef<HTMLSpanElement>(null);

  const visible = showAll || isHovered;
  const isAnataTrap = kanji === 'あなた';

  const handleMouseEnter = () => {
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      setTipPos({ x: rect.left + rect.width / 2, y: rect.top });
    }
    setIsHovered(true);
  };

  const tooltip = (
    <AnimatePresence mode="wait">
      {visible && (
        // Outer div — handles fixed positioning only, never touched by framer-motion
        <div
          style={{
            position: 'fixed',
            left: tipPos.x,
            top: tipPos.y - 12,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          {/* Inner span — handles animation only, no positioning transforms */}
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            style={{ transformOrigin: 'bottom center', display: 'block' }}
            className={`px-4 py-2.5 text-white rounded-xl shadow-2xl whitespace-nowrap text-sm flex flex-col items-center gap-1 min-w-max relative ${
              isAnataTrap ? 'bg-error' : 'bg-zinc-900/95 backdrop-blur-md'
            }`}
          >
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-80 font-black leading-none">
              {reading}
            </span>
            <span className="font-bold text-base">{meaning}</span>
            <div className={`absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent ${
              isAnataTrap ? 'border-t-error' : 'border-t-zinc-900/95'
            }`} />
          </motion.span>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <span
      ref={spanRef}
      className="relative inline-flex flex-col items-center group cursor-help mx-1.5 transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={`border-b-2 border-dotted pb-0.5 font-bold tracking-wider transition-all duration-300 ${
        isAnataTrap && isHovered ? 'border-error text-error scale-110' : 'border-primary text-on-surface'
      }`}>
        {kanji}
      </span>

      {createPortal(tooltip, document.body)}
    </span>
  );
}
