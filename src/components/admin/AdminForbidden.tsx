import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'

/** 403 screen: signed in, but without any admin permission (or not for this item). */
export function AdminForbidden({ message }: { message?: string }) {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center" aria-labelledby="admin-forbidden-title">
      <span aria-hidden className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high">
        <Icon name="lock" className="text-3xl text-on-surface-variant" />
      </span>
      <p className="font-headline text-sm font-bold uppercase tracking-[0.18em] text-primary">403</p>
      <h1 id="admin-forbidden-title" className="font-headline text-2xl font-bold text-on-surface">
        You don&apos;t have access here
      </h1>
      <p className="text-sm leading-relaxed text-on-surface-variant">
        {message ?? 'This area is for FoxSensei teachers and staff. If you were invited, open the link in your invite email.'}
      </p>
      <Link to="/" className="min-h-11 py-2 text-sm font-bold text-primary underline-offset-4 hover:underline">
        Back to FoxSensei
      </Link>
    </section>
  )
}
