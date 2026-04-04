"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveWordProps {
  kanji: string;
  reading: string;
  meaning: string;
  showAll?: boolean;
}

export function InteractiveWord({ kanji, reading, meaning, showAll = false }: InteractiveWordProps) {
  const [isHovered, setIsHovered] = useState(false);

  // If the global "showAll" is on, or user is hovering, show the hint
  const visible = showAll || isHovered;

  // Specific warning for the "Anata" trap as suggested by user
  const isAnataTrap = kanji === 'あなた';

  return (
    <span 
      className="relative inline-flex flex-col items-center group cursor-help mx-1.5 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* The main Kanji text */}
      <span className={`border-b-2 border-dotted pb-0.5 font-bold tracking-wider transition-all duration-300 ${
        isAnataTrap && isHovered ? 'border-error text-error scale-110' : 'border-primary text-on-surface'
      }`}>
        {kanji}
      </span>

      {/* The Tooltip / Hint */}
      <AnimatePresence mode="wait">
        {visible && (
          <motion.span
            initial={{ opacity: 0, y: 10, scale: 0.95, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 5, scale: 0.95, x: '-50%' }}
            className={`absolute bottom-[calc(100%+12px)] left-1/2 mb-0 px-4 py-2.5 text-white rounded-xl shadow-2xl z-[100] whitespace-nowrap text-sm flex flex-col items-center gap-1 pointer-events-none min-w-max ${
              isAnataTrap ? 'bg-error' : 'bg-zinc-900/95 backdrop-blur-md'
            }`}
            style={{ transformOrigin: 'bottom center' }}
          >
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-80 font-black leading-none">
              {reading}
            </span>
            <span className="font-bold text-base">{meaning}</span>
            {/* Tiny arrow */}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent ${
               isAnataTrap ? 'border-t-error' : 'border-t-zinc-900/95'
            }`} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
