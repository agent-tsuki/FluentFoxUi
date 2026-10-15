"use client";
import { useState, useRef, useEffect } from 'react';
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
  // Tap/keyboard-driven reveal — kept separate from hover so touch and pointer
  // devices don't fight over the same piece of state.
  const [isOpen, setIsOpen] = useState(false);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const spanRef = useRef<HTMLSpanElement>(null);

  const visible = showAll || isHovered || isOpen;
  const isAnataTrap = kanji === 'あなた';

  const updateTipPos = () => {
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      setTipPos({ x: rect.left + rect.width / 2, y: rect.top });
    }
  };

  const handleMouseEnter = () => {
    updateTipPos();
    setIsHovered(true);
  };

  // Tap-to-toggle for touch devices (hover never fires there).
  const handleClick = () => {
    updateTipPos();
    setIsOpen((prev) => !prev);
  };

  const handleFocus = () => {
    updateTipPos();
    setIsOpen(true);
  };

  const handleBlur = () => setIsOpen(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Dismiss the tap-revealed tooltip on an outside tap so it never stays stuck open.
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (spanRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

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
            className={`px-4 py-2.5 rounded-xl shadow-elevation-2 border border-outline-variant/20 backdrop-blur-md whitespace-nowrap text-sm flex flex-col items-center gap-1 min-w-max relative ${
              isAnataTrap ? 'bg-error text-white' : 'bg-surface-container-highest/95 text-on-surface'
            }`}
          >
            <span className="text-2xs uppercase tracking-[0.2em] opacity-80 font-black leading-none">
              {reading}
            </span>
            <span className="font-bold text-base">{meaning}</span>
            <div className={`absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent ${
              isAnataTrap ? 'border-t-error' : 'border-t-surface-container-highest'
            }`} />
          </motion.span>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <span
      ref={spanRef}
      role="button"
      tabIndex={0}
      aria-expanded={visible}
      className="relative inline-flex flex-col items-center group cursor-help mx-1.5 transition-all duration-300 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <span className={`border-b-2 border-dotted pb-0.5 font-bold tracking-wider transition-all duration-300 ${
        isAnataTrap && visible ? 'border-error text-error scale-110' : 'border-primary text-on-surface'
      }`}>
        {kanji}
      </span>

      {createPortal(tooltip, document.body)}
    </span>
  );
}
