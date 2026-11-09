import { memo } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/cn'
import { formatDateTime } from '@/lib/admin/format'
import { isActiveJob, jobTitle, workerWarning } from '@/lib/admin/audio'
import type { AudioJob, AudioJobStatus } from '@/types/audioAdmin'

const STATUS: Record<AudioJobStatus, { label: string; className: string; icon: string }> = {
  queued: { label: 'Queued', className: 'bg-surface-container-high text-on-surface-variant', icon: 'schedule' },
  running: { label: 'Running', className: 'bg-primary/10 text-primary', icon: 'progress_activity' },
  done: { label: 'Done', className: 'bg-success/10 text-success', icon: 'check_circle' },
  failed: { label: 'Failed', className: 'bg-error/10 text-error', icon: 'error' },
  cancelled: { label: 'Cancelled', className: 'bg-surface-container-high text-on-surface-variant', icon: 'close' },
}

const JobItem = memo(function JobItem({ job, busy, onCancel }: { job: AudioJob; busy: boolean; onCancel: (job: AudioJob) => void }) {
  const status = STATUS[job.status]
  const warning = workerWarning(job)
  const handled = job.done + job.failed
  return (
    <li className="space-y-2 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-on-surface">{jobTitle(job)}</p>
          <p className="text-xs text-on-surface-variant">Queued {formatDateTime(job.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold', status.className)}>
            <Icon name={status.icon} className={cn('text-sm', job.status === 'running' && 'animate-spin motion-reduce:animate-none')} />
            {status.label}
          </span>
          {isActiveJob(job) && (
            <Button variant="ghost" className="min-h-11 !px-3 !py-2 text-sm" disabled={busy} onClick={() => onCancel(job)}>
              Cancel
            </Button>
          )}
        </div>
      </div>
      {job.kind === 'generate' && job.total > 0 && (
        <div className="space-y-1">
          <ProgressBar value={handled} max={job.total} label={`${jobTitle(job)} progress`} tone={job.status === 'done' ? 'success' : 'primary'} />
          <p className="text-xs text-on-surface-variant">
            {handled} of {job.total} texts
            {job.failed > 0 && <span className="text-error"> · {job.failed} without a clip</span>}
          </p>
        </div>
      )}
      {job.error && <p className="text-xs text-error">{job.error}</p>}
      {warning && (
        <p className="flex items-start gap-1.5 text-xs text-warning">
          <Icon name="warning" className="text-sm" />
          {warning}
        </p>
      )}
    </li>
  )
})

/** The audio worker's recent jobs, newest first. */
export function JobList({ jobs, busy, onCancel }: { jobs: readonly AudioJob[]; busy: string | null; onCancel: (job: AudioJob) => void }) {
  return (
    <ul className="divide-y divide-outline-variant/40">
      {jobs.map((job) => (
        <JobItem key={job.id} job={job} busy={busy === `cancel:${job.id}`} onCancel={onCancel} />
      ))}
    </ul>
  )
}
