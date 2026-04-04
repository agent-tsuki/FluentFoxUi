import { Link, useParams } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { grammarData } from '@/api/mock/grammarData'

interface GrammarSidebarProps {
  level: string;
}

export function GrammarSidebar({ level }: GrammarSidebarProps) {
  const { chapterId } = useParams<{ chapterId?: string }>();
  const activeChapterId = parseInt(chapterId || '1');
  
  const chapters = grammarData[level.toLowerCase()] || [];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-surface-container-lowest flex flex-col p-6 space-y-4 overflow-y-auto border-r border-outline-variant/30 hidden lg:flex scrollbar-hide">
      <div className="mb-6 mt-4">
        <div className="text-xs uppercase tracking-widest text-primary mb-1 font-bold">{level.toUpperCase()} Mastery</div>
        <div className="text-sm text-on-surface-variant">Current: Chapter {activeChapterId}</div>
      </div>

      <nav className="flex flex-col gap-1 overflow-y-auto pb-32 custom-scrollbar">
        {chapters.map((ch) => {
          const isActive = ch.id === activeChapterId;
          return (
            <div key={ch.id} className="group">
              <Link
                to={`/grammar/${level}/${ch.id}`}
                className={`flex items-center gap-3 px-3 py-2 text-sm transition-all duration-200 ease-in-out font-medium rounded-md ${
                  isActive
                    ? 'text-primary font-bold bg-surface-container-highest'
                    : 'text-on-surface-variant hover:text-primary transition-colors'
                }`}
              >
                <Icon
                  name={ch.id === 1 ? "menu_book" : ch.id === 2 ? "translate" : "auto_awesome"}
                  className="text-[20px]"
                />
                <span>Chapter {ch.id}: {ch.title.split(':')[0]}</span>
              </Link>
              
              {isActive && (
                <div className="ml-9 mt-2 flex flex-col gap-2 border-l border-outline-variant/40 pl-4 mb-2">
                  <Link to="#" className="text-xs py-1 text-on-surface-variant hover:text-primary transition-colors">Vocabulary</Link>
                  <Link to="#" className="text-xs py-1 text-primary font-bold underline underline-offset-4">Grammar Notes</Link>
                  <Link to="#" className="text-xs py-1 text-on-surface-variant hover:text-primary transition-colors">Practice Lab</Link>
                </div>
              )}
            </div>
          );
        })}

        {/* Fill remaining with dummy chapters up to 25 if needed */}
        {chapters.length < 25 && Array.from({ length: 25 - chapters.length }).map((_, i) => {
          const id = chapters.length + i + 1;
          return (
            <div key={id} className="group opacity-50 pointer-events-none">
               <div className="flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant font-medium">
                <Icon name="lock" className="text-[20px]" />
                <span>Chapter {id}: Coming Soon</span>
              </div>
            </div>
          )
        })}

        <div className="pt-6 mt-6 border-t border-outline-variant/30">
          <div className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-4 px-3">General Resources</div>
          <Link to="#" className="flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
            <Icon name="auto_stories" className="text-[20px]" />
            <span>Vocabulary</span>
          </Link>
          <Link to="#" className="flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
            <Icon name="g_translate" className="text-[20px]" />
            <span>Grammar Notes</span>
          </Link>
          <Link to="#" className="flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
            <Icon name="fitness_center" className="text-[20px]" />
            <span>Practice Lab</span>
          </Link>
        </div>
      </nav>

      {level.toLowerCase() !== 'n5' && (
        <div className="mt-auto pt-6 bg-surface-container-lowest absolute bottom-0 left-0 w-full p-6 border-t border-outline-variant/30 pb-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] pt-6">
          <Button variant="primary" className="w-full py-3 rounded-xl shadow-none">
            Unlock Pro Deck
          </Button>
        </div>
      )}
    </aside>
  )
}
