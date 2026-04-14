import { useState, type FormEvent } from 'react'
import { authService } from '@/api/services/authService'
import { Icon } from '@/components/ui/Icon'

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <Icon name="mark_email_read" className="text-3xl" filled />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-headline font-extrabold text-on-surface tracking-tighter">
            Check Your Inbox
          </h2>
          <p className="text-on-surface-variant text-sm leading-relaxed px-4">
            If <span className="font-semibold text-on-surface">{email}</span> is registered, you'll receive a password reset link shortly.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-on-surface-variant/60 font-medium hover:text-on-surface transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <Icon name="arrow_back" className="text-sm" />
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-headline font-extrabold text-on-surface tracking-tighter">
          Forgot Password?
        </h2>
        <p className="text-on-surface-variant text-sm leading-relaxed">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant px-1">
            Email Address
          </label>
          <input
            type="email"
            required
            maxLength={254}
            placeholder="haruki@foxsensei.jp"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface-container-low border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/50 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-container text-on-primary font-headline font-bold py-4 rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="text-xs text-on-surface-variant/60 font-medium hover:text-on-surface transition-colors flex items-center gap-2"
      >
        <Icon name="arrow_back" className="text-sm" />
        Back to Login
      </button>
    </div>
  )
}
