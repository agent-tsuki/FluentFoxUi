import { useEffect, useState, type FormEvent } from 'react'
import type { NewsletterData } from '@/types'
import { interactiveService } from '@/api/services/interactiveService'
import { Button } from '@/components/ui/Button'

export function Newsletter() {
  const [data, setData] = useState<NewsletterData | null>(null)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    interactiveService.getNewsletterConfig().then(setData)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    await interactiveService.subscribeNewsletter(email)
    setSubmitted(true)
    setEmail('')
  }

  if (!data) return null

  return (
    <section className="max-w-7xl mx-auto px-8 mb-32">
      <div className="bg-primary px-10 py-16 rounded-3xl text-on-primary flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
        {/* Decorative large character */}
        <div className="absolute top-0 right-0 opacity-10 font-headline font-black text-[20rem] translate-x-1/4 -translate-y-1/4 pointer-events-none select-none">
          {data.decorativeChar}
        </div>

        {/* Copy */}
        <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
          <h2 className="font-headline text-3xl font-bold">{data.heading}</h2>
          <p className="text-on-primary/80 text-lg">{data.subheading}</p>
        </div>

        {/* Form */}
        <div className="relative z-10 w-full md:w-auto">
          {submitted ? (
            <p className="text-on-primary font-bold text-lg">Thanks! Check your inbox. 🎉</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={data.placeholder}
                className="bg-white/10 border-2 border-white/20 text-white placeholder:text-white/60 rounded-xl px-6 py-4 w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
              />
              <Button type="submit" variant="white" className="px-8 py-4 rounded-xl">
                {data.buttonLabel}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
