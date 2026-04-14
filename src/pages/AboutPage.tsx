import { Link } from 'react-router-dom'
import { FoxLogo } from '@/components/layout/Navbar/FoxLogo'
import { useModal } from '@/context/ModalContext'

const team = [
  {
    name: 'Hana Yoshida',
    role: 'Co-Founder & Head of Curriculum',
    bio: 'Former Japanese teacher with 10+ years helping learners reach N1. Obsessed with contextual learning.',
    avatar: '/avatars/women/japanese.png',
  },
  {
    name: 'Kenji Nakamura',
    role: 'Co-Founder & Engineering Lead',
    bio: 'Built language tools at two EdTech startups before starting FoxSensei. Hiragana level: legendary.',
    avatar: '/avatars/men/samurai.png',
  },
  {
    name: 'Aoi Tanaka',
    role: 'Head of Design',
    bio: 'Believes that beautiful, distraction-free design is itself a teaching tool. Former UX lead at Duolingo.',
    avatar: '/avatars/women/casual_1.png',
  },
]

const values = [
  {
    icon: 'school',
    title: 'Deep Learning Over Gamification',
    body: 'We focus on genuine comprehension and long-term retention, not streaks and badges that create anxiety.',
  },
  {
    icon: 'auto_stories',
    title: 'Editorial-Grade Content',
    body: 'Every lesson is crafted with the same care as a well-edited textbook — accurate, clear, and culturally nuanced.',
  },
  {
    icon: 'travel_explore',
    title: 'Immersion First',
    body: 'Real Japanese from the first lesson. We believe the best way to learn a language is to live inside it.',
  },
  {
    icon: 'favorite',
    title: 'Zero Stress Environment',
    body: "Learning should feel like exploration, not a test. We remove artificial urgency so you can focus on progress.",
  },
]

export function AboutPage() {
  const { openModal } = useModal()

  return (
    <main className="pt-28 pb-20">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center space-y-6">
        <div className="flex justify-center">
          <FoxLogo size={80} autoplay loop />
        </div>
        <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter text-on-surface">
          About FoxSensei
        </h1>
        <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          We're on a mission to make Japanese fluency accessible to everyone — through deep,
          distraction-free learning experiences built on respect for the language and the learner.
        </p>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tighter">Our Story</h2>
        <div className="space-y-4 text-on-surface-variant leading-relaxed text-[15px]">
          <p>
            FoxSensei started in 2024 when two language enthusiasts got frustrated with existing tools.
            Gamified apps felt like a game, not a language course. Textbooks were dense and offline.
            Video courses were passive. None of them felt like the real thing.
          </p>
          <p>
            We built FoxSensei around a single belief: the best way to learn Japanese is through
            structured immersion — real characters, real grammar, real words used in real context —
            presented in an interface that gets out of your way and lets you focus.
          </p>
          <p>
            Today, FoxSensei serves learners from complete beginners tackling hiragana to advanced
            students preparing for JLPT N1. We're a small, focused team and every feature we ship
            is tested by someone who is actively learning Japanese.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface-container-low py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tighter mb-10">
            What We Believe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v) => (
              <div key={v.title} className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">{v.icon}</span>
                </div>
                <h3 className="font-headline font-bold text-on-surface text-lg">{v.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tighter mb-10">
          Meet the Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member) => (
            <div key={member.name} className="space-y-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-container border-2 border-outline-variant/30">
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-headline font-bold text-on-surface">{member.name}</p>
                <p className="text-[11px] uppercase tracking-widest text-primary font-bold mt-0.5">{member.role}</p>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tighter">
            Ready to start learning?
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            Join thousands of learners who have chosen depth over distraction. Start your Japanese
            journey today — it's free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => openModal('signup')}
              className="px-8 py-3 bg-primary text-on-primary rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-container transition-colors"
            >
              Get Started for Free
            </button>
            <Link
              to="/"
              className="px-8 py-3 border border-outline-variant rounded-lg text-on-surface-variant font-bold text-sm hover:text-on-surface transition-colors"
            >
              Explore Lessons
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
