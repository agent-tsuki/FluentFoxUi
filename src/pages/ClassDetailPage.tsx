import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { CourseGrid } from '@/components/classes/CourseGrid'
import { ChannelIntroduction } from '@/components/classes/detail/ChannelIntroduction'
import { ClassDetailSkeleton } from '@/components/classes/detail/ClassDetailSkeleton'
import { Curriculum, WhatYouLearn } from '@/components/classes/detail/CourseContent'
import { CourseHero } from '@/components/classes/detail/CourseHero'
import { PlaylistSection } from '@/components/classes/detail/PlaylistSection'
import { SectionTitle } from '@/components/classes/detail/SectionTitle'
import { isClassNotFound, useClassDetail } from '@/hooks/useClassDetail'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { resolveErrorMessage } from '@/api/errors'
import { hasPlayablePlaylist } from '@/lib/classes/youtube'
import type { ClassCourseCard, ClassCourseDetail } from '@/types/classes'

/** Course page. The route param is still named `teacherId` (App.tsx); it holds the course slug. */
export function ClassDetailPage() {
  const { teacherId: slug = '' } = useParams<{ teacherId: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useClassDetail(slug)

  if (isLoading) return <main className="min-h-dvh pb-16 pt-nav"><ClassDetailSkeleton /></main>

  if (error || !data) {
    const notFound = isClassNotFound(error)
    return (
      <main className="mx-auto min-h-dvh max-w-3xl px-6 pb-20 pt-28">
        {notFound ? (
          <EmptyState
            icon="search_off"
            title="We couldn't find this course"
            description="It may have been moved or is no longer listed."
            actionLabel="Browse all classes"
            onAction={() => navigate('/classes')}
          />
        ) : (
          <ErrorState title="Couldn't load this course" message={resolveErrorMessage(error)} onRetry={refetch} />
        )}
      </main>
    )
  }

  // key: a new slug resets the player state.
  return <CourseView key={data.slug} course={data} />
}

function CourseView({ course }: { course: ClassCourseDetail }) {
  const reducedMotion = useReducedMotion()
  const playlistRef = useRef<HTMLElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [started, setStarted] = useState(false)
  const hasPlaylist = hasPlayablePlaylist(course)

  useEffect(() => {
    document.title = `${course.title} · FoxSensei`
  }, [course.title])

  const markStarted = useCallback(() => setStarted(true), [])
  const startWatching = useCallback(() => {
    setStarted(true)
    playlistRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }, [reducedMotion])

  // Order (CLASSES_UI_SPEC §2): Hero → Meet the channel → Playlist → What you'll learn → Curriculum → rails.
  return (
    <main className="min-h-dvh pb-16 pt-nav">
      <CourseHero course={course} onStartWatching={hasPlaylist ? startWatching : undefined} />

      <div className="mx-auto max-w-5xl space-y-10 px-6 pt-8 md:px-10">
        <ChannelIntroduction channel={course.channel} courseSummary={course.summary} />
        {hasPlaylist && (
          <PlaylistSection
            ref={playlistRef}
            title={course.title}
            videos={course.videos}
            playlistId={course.playlistId}
            thumbnailUrl={course.thumbnailUrl}
            channelName={course.channel.name}
            channelUrl={course.channel.url}
            selectedIndex={selectedIndex}
            started={started}
            onSelect={setSelectedIndex}
            onPlay={markStarted}
          />
        )}
        <WhatYouLearn items={course.whatYouLearn} />
        <Curriculum sections={course.curriculum} />
        <CourseRail id="more-title" icon="grid_view" title={`More from ${course.channel.name}`} courses={course.moreFromChannel} />
        <CourseRail id="similar-title" icon="explore" title="Similar courses" courses={course.similar} />
      </div>
    </main>
  )
}

function CourseRail({ id, icon, title, courses }: { id: string; icon: string; title: string; courses: ClassCourseCard[] }) {
  if (courses.length === 0) return null
  return (
    <section aria-labelledby={id}>
      <SectionTitle id={id} icon={icon}>{title}</SectionTitle>
      <CourseGrid courses={courses} maxCols={4} />
    </section>
  )
}
