import { useEffect, useRef } from 'react'

const VIDEO_URL = `${import.meta.env.BASE_URL}HeroVideo.mp4`
const POSTER_URL = `${import.meta.env.BASE_URL}HeroPoster.jpg`
// A local seek lands in ~30 ms. One that hasn't landed by this point means the browser suspended or purged
// the media pipeline while the tab was in the background — reload the element and seek again.
const SEEK_TIMEOUT_MS = 500
const MAX_RELOADS = 3

export function ScrubVideo() {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    // No cursor → nothing to scrub; the poster (the midpoint frame) is the whole hero and saves the download.
    if (!window.matchMedia('(pointer: fine)').matches) return

    let targetTime = 0
    let hasTarget = false
    let seekTimer: ReturnType<typeof setTimeout> | undefined // set while a seek is in flight
    let reloads = 0
    let blobUrl = ''
    const controller = new AbortController()

    const reload = () => {
      seekTimer = undefined
      if (!video.currentSrc || reloads >= MAX_RELOADS) return
      reloads += 1
      video.load() // restarts from the blob; loadedmetadata → seek to the target
    }
    const seekTo = (t: number) => {
      clearTimeout(seekTimer)
      seekTimer = setTimeout(reload, SEEK_TIMEOUT_MS)
      video.currentTime = t
    }
    // One seek in flight at a time; when it lands, chase the target if it moved.
    const chase = () => {
      if (!video.duration || seekTimer !== undefined) return
      if (Math.abs(video.currentTime - targetTime) > 0.001) seekTo(targetTime)
    }
    const onSeeked = () => {
      clearTimeout(seekTimer)
      seekTimer = undefined
      reloads = 0
      chase()
    }
    // Cursor x maps straight onto the timeline: left edge = first frame, right edge = last.
    const onMove = (e: MouseEvent) => {
      if (!video.duration) return
      const fraction = Math.min(1, Math.max(0, e.clientX / window.innerWidth))
      targetTime = fraction * video.duration
      hasTarget = true
      chase()
    }
    // Face the camera (same frame as the poster) until the cursor moves; after a reload, go back to the cursor.
    const onMeta = () => {
      if (!hasTarget) targetTime = video.duration / 2
      seekTo(targetTime)
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
    return () => {
      controller.abort()
      clearTimeout(seekTimer)
      window.removeEventListener('mousemove', onMove)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('loadedmetadata', onMeta)
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
