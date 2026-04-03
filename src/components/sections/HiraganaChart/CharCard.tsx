import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { KanaChar } from '@/types';

interface CharCardProps {
  char: KanaChar;
  size?: 'lg' | 'sm';
  interactive?: boolean;
}

const sampleWords: Record<string, { word: string; meaning: string }> = {
  a:   { word: 'あさ (asa)',         meaning: 'morning'    },
  i:   { word: 'いぬ (inu)',         meaning: 'dog'        },
  u:   { word: 'うみ (umi)',         meaning: 'sea'        },
  e:   { word: 'えき (eki)',         meaning: 'station'    },
  o:   { word: 'おに (oni)',         meaning: 'demon'      },
  ka:  { word: 'かわ (kawa)',        meaning: 'river'      },
  ki:  { word: 'きつね (kitsune)',   meaning: 'fox'        },
  ku:  { word: 'くも (kumo)',        meaning: 'cloud'      },
  ke:  { word: 'けむり (kemuri)',    meaning: 'smoke'      },
  ko:  { word: 'こころ (kokoro)',    meaning: 'heart'      },
  sa:  { word: 'さくら (sakura)',    meaning: 'cherry blossom' },
  shi: { word: 'しま (shima)',       meaning: 'island'     },
  su:  { word: 'すし (sushi)',       meaning: 'sushi'      },
  se:  { word: 'せかい (sekai)',     meaning: 'world'      },
  so:  { word: 'そら (sora)',        meaning: 'sky'        },
  ta:  { word: 'たいよう (taiyou)', meaning: 'sun'        },
  chi: { word: 'ちから (chikara)',   meaning: 'strength'   },
  tsu: { word: 'つき (tsuki)',       meaning: 'moon'       },
  te:  { word: 'てら (tera)',        meaning: 'temple'     },
  to:  { word: 'とり (tori)',        meaning: 'bird'       },
  na:  { word: 'なみ (nami)',        meaning: 'wave'       },
  ni:  { word: 'にわ (niwa)',        meaning: 'garden'     },
  nu:  { word: 'ぬの (nuno)',        meaning: 'cloth'      },
  ne:  { word: 'ねこ (neko)',        meaning: 'cat'        },
  no:  { word: 'のり (nori)',        meaning: 'seaweed'    },
  ha:  { word: 'はな (hana)',        meaning: 'flower'     },
  hi:  { word: 'ひかり (hikari)',    meaning: 'light'      },
  fu:  { word: 'ふじ (fuji)',        meaning: 'Mt. Fuji'   },
  he:  { word: 'へや (heya)',        meaning: 'room'       },
  ho:  { word: 'ほし (hoshi)',       meaning: 'star'       },
  ma:  { word: 'まつり (matsuri)',   meaning: 'festival'   },
  mi:  { word: 'みち (michi)',       meaning: 'path'       },
  mu:  { word: 'むし (mushi)',       meaning: 'insect'     },
  me:  { word: 'めだか (medaka)',    meaning: 'killifish'  },
  mo:  { word: 'もり (mori)',        meaning: 'forest'     },
  ya:  { word: 'やま (yama)',        meaning: 'mountain'   },
  yu:  { word: 'ゆき (yuki)',        meaning: 'snow'       },
  yo:  { word: 'よる (yoru)',        meaning: 'night'      },
  ra:  { word: 'らくだ (rakuda)',    meaning: 'camel'      },
  ri:  { word: 'りんご (ringo)',     meaning: 'apple'      },
  ru:  { word: 'るび (rubi)',        meaning: 'ruby'       },
  re:  { word: 'れんが (renga)',     meaning: 'brick'      },
  ro:  { word: 'ろうそく (rousoku)', meaning: 'candle'     },
  wa:  { word: 'わし (washi)',       meaning: 'eagle'      },
  wo:  { word: 'をかし (okashi)',    meaning: 'amusing'    },
  n:   { word: 'にほん (nihon)',     meaning: 'Japan'      },
};

export function CharCard({ char, size = 'lg', interactive = true }: CharCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const flipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (char.isEmpty) {
    return <div className="opacity-0 pointer-events-none" aria-hidden />;
  }

  const isLg     = size === 'lg';
  const base     = char.isCompound ? char.character[0]       : char.character;
  const small    = char.isCompound ? char.character.slice(1) : '';
  const sampleWord = sampleWords[char.romaji];

  const toggle = () => {
    if (!interactive) return;
    if (flipped) {
      if (flipTimeout.current) clearTimeout(flipTimeout.current);
      flipTimeout.current = null;
      setFlipped(false);
    } else {
      setFlipped(true);
      flipTimeout.current = setTimeout(() => {
        setFlipped(false);
        flipTimeout.current = null;
      }, 8000);
    }
  };

  // Solid card background — no backdrop-filter (major GPU cost with 46+ cards)
  const cardBg = flipped
    ? 'rgba(255, 248, 244, 0.98)'
    : hovered
    ? 'rgba(255, 252, 249, 0.98)'
    : 'rgba(255, 255, 255, 0.96)';

  const cardShadow = flipped
    ? '0 20px 56px rgba(255,115,64,0.18), 0 6px 20px rgba(0,0,0,0.06)'
    : hovered
    ? '0 14px 40px rgba(255,115,64,0.10), 0 4px 14px rgba(0,0,0,0.05)'
    : '0 2px 16px rgba(0,0,0,0.045), 0 1px 4px rgba(0,0,0,0.035)';

  return (
    <motion.div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={`${char.character} — ${char.romaji}`}
      className={`relative select-none ${interactive ? 'cursor-pointer' : 'cursor-default'} ${isLg ? 'w-32 h-44' : 'w-24 h-32'}`}
      onClick={toggle}
      onKeyDown={(e) => e.key === 'Enter' && toggle()}
      onMouseEnter={() => interactive && setHovered(true)}
      onMouseLeave={() => interactive && setHovered(false)}
      whileHover={interactive ? { y: -7 } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
    >
      {/* ── Ambient glow — CSS transition instead of Framer Motion ── */}
      <div
        aria-hidden
        className="absolute pointer-events-none transition-opacity duration-300"
        style={{
          inset: '-24%',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 58%, #FF7340 0%, transparent 65%)',
          filter: 'blur(22px)',
          zIndex: 0,
          opacity: !interactive ? 0.06 : flipped ? 0.45 : hovered ? 0.22 : 0.06,
        }}
      />

      {/* ── Card surface (solid bg — no backdrop-filter) ── */}
      <div
        className="absolute inset-0 rounded-[22px] overflow-hidden transition-shadow duration-300"
        style={{
          background: cardBg,
          border: '1px solid rgba(255,255,255,0.92)',
          boxShadow: cardShadow,
          zIndex: 1,
        }}
      >
        {/* Top-edge shine strip */}
        <div
          aria-hidden
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 40%, transparent)' }}
        />

        <AnimatePresence mode="wait" initial={false}>
          {/* ── FRONT: character ── */}
          {!flipped ? (
            <motion.div
              key="front"
              className="w-full h-full flex flex-col"
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -7 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              <div className="flex-1 flex items-center justify-center">
                {char.isCompound ? (
                  <div className="flex items-baseline">
                    <span
                      className={`${isLg ? 'text-6xl' : 'text-4xl'} font-bold`}
                      style={{ color: '#18182A', lineHeight: 1 }}
                    >
                      {base}
                    </span>
                    <span
                      className={`${isLg ? 'text-3xl' : 'text-xl'} font-bold`}
                      style={{ color: '#18182A', opacity: 0.38, lineHeight: 1 }}
                    >
                      {small}
                    </span>
                  </div>
                ) : (
                  <span
                    className={`${isLg ? 'text-7xl' : 'text-5xl'} font-bold`}
                    style={{ color: '#18182A', lineHeight: 1 }}
                  >
                    {base}
                  </span>
                )}
              </div>

              {/* Romaji row */}
              <div className="pb-4 flex items-center justify-center gap-2">
                <span aria-hidden style={{ display: 'block', width: isLg ? 14 : 10, height: 1, borderRadius: 1, background: '#FF7340', opacity: 0.55 }} />
                <span
                  className={`${isLg ? 'text-[11px]' : 'text-[9px]'} font-semibold tracking-[0.18em] uppercase`}
                  style={{ color: '#FF7340' }}
                >
                  {char.romaji}
                </span>
                <span aria-hidden style={{ display: 'block', width: isLg ? 14 : 10, height: 1, borderRadius: 1, background: '#FF7340', opacity: 0.55 }} />
              </div>
            </motion.div>

          ) : (
            /* ── BACK: example word ── */
            <motion.div
              key="back"
              className="w-full h-full flex flex-col items-center justify-center p-4 text-center"
              style={{ gap: isLg ? 8 : 5 }}
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -7 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none rounded-[22px]"
                style={{ background: 'rgba(255,115,64,0.04)' }}
              />

              {sampleWord ? (
                <>
                  <span
                    className={`${isLg ? 'text-[17px]' : 'text-[12px]'} font-bold leading-snug relative`}
                    style={{ color: '#18182A' }}
                  >
                    {sampleWord.word}
                  </span>
                  <div
                    aria-hidden
                    style={{ width: isLg ? 28 : 20, height: 1.5, borderRadius: 2, background: 'linear-gradient(90deg, transparent, #FF7340, transparent)' }}
                  />
                  <span
                    className={`${isLg ? 'text-[11px]' : 'text-[9px]'} italic relative`}
                    style={{ color: '#18182A', opacity: 0.48 }}
                  >
                    {sampleWord.meaning}
                  </span>
                </>
              ) : (
                <span
                  className={`${isLg ? 'text-4xl' : 'text-2xl'} font-bold`}
                  style={{ color: '#18182A' }}
                >
                  {char.character}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
