import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { CourseGrid } from '@/components/classes/CourseGrid'
import { ChannelIntroduction } from '@/components/classes/detail/ChannelIntroduction'
import { ClassDetailSkeleton } from '@/components/classes/detail/ClassDetailSkeleton'
import { Curriculum, WhatYouLearn } from '@/components/classes/detail/CourseContent'
import { CourseHero, type HeroPlayback } from '@/components/classes/detail/CourseHero'
import { CourseSidebar } from '@/components/classes/detail/CourseSidebar'
import { CourseTabs, type CourseTab } from '@/components/classes/detail/CourseTabs'
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
  const lessonsRef = useRef<HTMLElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [started, setStarted] = useState(false)
  const hasLessons = course.platform === 'youtube' && course.videos.length > 0
  // With a synced video list the lessons section has the player; with only a playlist id the hero plays it.
  const playback: HeroPlayback = hasLessons ? 'lessons' : hasPlayablePlaylist(course) ? 'inline' : 'external'

  useEffect(() => {
    document.title = `${course.title} · FoxSensei`
  }, [course.title])

  const markStarted = useCallback(() => setStarted(true), [])
  const startWatching = useCallback(() => {
    setStarted(true)
    if (hasLessons) lessonsRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }, [hasLessons, reducedMotion])

  const tabs = useMemo<CourseTab[]>(
    () => [
      { id: 'overview', label: 'Overview' },
      ...(hasLessons ? [{ id: 'lessons', label: 'Lessons' }] : []),
      ...(course.curriculum.length > 0 ? [{ id: 'curriculum', label: 'Curriculum' }] : []),
      { id: 'teacher', label: course.channel.platform === 'youtube' ? 'About the teacher' : 'About the provider' },
    ],
    [hasLessons, course.curriculum.length, course.channel.platform],
  )

  return (
    <main className="min-h-dvh pb-16 pt-nav">
      <CourseHero course={course} playback={playback} playing={started} onStartWatching={startWatching} />
      <CourseTabs tabs={tabs} />

      <div className="mx-auto max-w-6xl space-y-12 px-4 pt-8 sm:px-6 md:px-10">
        <div id="overview" className="grid scroll-mt-40 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
          <div className="min-w-0 space-y-10">
            <WhatYouLearn items={course.whatYouLearn} />
            {hasLessons && (
              <PlaylistSection
                ref={lessonsRef}
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
            <Curriculum sections={course.curriculum} />
            <ChannelIntroduction channel={course.channel} courseSummary={course.summary} />
          </div>
          <CourseSidebar channel={course.channel} />
        </div>

        <CourseRail id="more-title" title={`More from ${course.channel.name}`} courses={course.moreFromChannel} />
        <CourseRail id="similar-title" title="Similar courses" courses={course.similar} />
      </div>
    </main>
  )
}

function CourseRail({ id, title, courses }: { id: string; title: string; courses: ClassCourseCard[] }) {
  if (courses.length === 0) return null
  return (
    <section aria-labelledby={id}>
      <SectionTitle id={id}>{title}</SectionTitle>
      <CourseGrid courses={courses} maxCols={4} />
    </section>
  )
}
