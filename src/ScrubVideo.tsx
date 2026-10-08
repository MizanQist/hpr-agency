import { useEffect, useRef } from 'react'

export function ScrubVideo() {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    let targetTime = 0
    let isSeeking = false

    const seekTo = (t: number) => {
      isSeeking = true
      video.currentTime = t
    }
    // One seek in flight at a time; when it lands, chase the target if it moved.
    const onSeeked = () => {
      isSeeking = false
      if (Math.abs(video.currentTime - targetTime) > 0.001) seekTo(targetTime)
    }
    // Cursor x maps straight onto the timeline: left edge = first frame, right edge = last.
    const onMove = (e: MouseEvent) => {
      if (!video.duration) return
      const fraction = Math.min(1, Math.max(0, e.clientX / window.innerWidth))
      targetTime = fraction * video.duration
      if (!isSeeking && targetTime !== video.currentTime) seekTo(targetTime)
    }
    // Face the camera until the cursor moves (and on touch screens, where it never does).
    const onMeta = () => {
      targetTime = video.duration / 2
      seekTo(targetTime)
    }

    window.addEventListener('mousemove', onMove)
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('loadedmetadata', onMeta)
    if (video.readyState >= 1) onMeta()
    return () => {
      window.removeEventListener('mousemove', onMove)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('loadedmetadata', onMeta)
    }
  }, [])

  return (
    <video
      ref={ref}
      src={`${import.meta.env.BASE_URL}HeroVideo.mp4`}
      muted
      playsInline
      preload="auto"
      className="fixed inset-0 z-0 h-full w-full object-cover object-[40%_center] md:object-center"
    />
  )
}
