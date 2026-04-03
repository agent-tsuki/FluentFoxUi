import { FoxLogo } from '@/components/layout/Navbar/FoxLogo'

export function ServerErrorPage() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center space-y-8 animate-in fade-in zoom-in duration-700 relative overflow-hidden">
      {/* Central Reddish Radial Gradient for Error */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_rgba(239,68,68,0.08)_0%,_transparent_70%)] pointer-events-none z-0" />

      <div className="relative z-10">
        <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full animate-pulse px-10 py-10 opacity-50" />
        <FoxLogo size={180} autoplay={true} loop={true} className="relative z-10 grayscale-[30%] brightness-75" />
      </div>

      <div className="space-y-4 relative z-10">
        <h1 className="text-8xl font-black font-headline bg-gradient-to-br from-red-900 to-red-500 dark:from-red-400 dark:to-red-600 bg-clip-text text-transparent tracking-tighter">
          500
        </h1>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
          Something went wrong on our end.
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          The fox is currently tangled in some server cables. We're working hard to get things back on track.
        </p>
      </div>
    </main>
  )
}
