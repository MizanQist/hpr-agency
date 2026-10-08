import { useEffect, useRef } from 'react'

const VIDEO_URL = `${import.meta.env.BASE_URL}HeroVideo.mp4`
const POSTER_URL = `${import.meta.env.BASE_URL}HeroPoster.jpg`
// A seek that hasn't landed by then was dropped (background tab, suspended decoder) — stop waiting for it.
const SEEK_TIMEOUT_MS = 250

export function ScrubVideo() {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    // No cursor → nothing to scrub; the poster (the midpoint frame) is the whole hero and saves the download.
    if (!window.matchMedia('(pointer: fine)').matches) return

    let targetTime = 0
    let seekStartedAt = 0 // 0 = no seek in flight
    let blobUrl = ''
    const controller = new AbortController()

    const seekTo = (t: number) => {
      seekStartedAt = performance.now()
      video.currentTime = t
    }
    const isSeekInFlight = () => seekStartedAt !== 0 && performance.now() - seekStartedAt < SEEK_TIMEOUT_MS
    // One seek in flight at a time; when it lands (or is given up on), chase the target if it moved.
    const chase = () => {
      if (!video.duration || isSeekInFlight()) return
      if (Math.abs(video.currentTime - targetTime) > 0.001) seekTo(targetTime)
    }
    const onSeeked = () => {
      seekStartedAt = 0
      chase()
    }
    // Cursor x maps straight onto the timeline: left edge = first frame, right edge = last.
    const onMove = (e: MouseEvent) => {
      if (!video.duration) return
      const fraction = Math.min(1, Math.max(0, e.clientX / window.innerWidth))
      targetTime = fraction * video.duration
      chase()
    }
    // Face the camera (same frame as the poster) until the cursor moves.
    const onMeta = () => {
      targetTime = video.duration / 2
      seekTo(targetTime)
    }
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      seekStartedAt = 0
      chase()
    }

    // Pull the whole file first so every seek is local — streaming it makes early seeks wait on the network.
    fetch(VIDEO_URL, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} fetching hero video`)
        return r.blob()
      })
      .then((blob) => {
        blobUrl = URL.createObjectURL(blob)
        video.src = blobUrl
      })
      .catch(() => {
        if (!controller.signal.aborted) video.src = VIDEO_URL
      })

    window.addEventListener('mousemove', onMove)
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('loadedmetadata', onMeta)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      controller.abort()
      window.removeEventListener('mousemove', onMove)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('loadedmetadata', onMeta)
      document.removeEventListener('visibilitychange', onVisible)
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [])

  return (
    <video
      ref={ref}
      poster={POSTER_URL}
      muted
      playsInline
      preload="auto"
      className="fixed inset-0 z-0 h-full w-full object-cover object-[40%_center] md:object-center"
    />
  )
}
