import Lottie from 'lottie-web'

/**
 * Renders a Lottie animation into a hidden 64×64 canvas and pumps each frame
 * into the page's <link rel="icon">. Returns a cleanup function — always call
 * it (e.g. in a useEffect cleanup) to destroy the animation and remove the
 * hidden container from the DOM.
 */
export function startAnimatedFavicon(animationData: object): () => void {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64

  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;width:64px;height:64px;top:-9999px;left:-9999px;pointer-events:none;'
  container.appendChild(canvas)
  document.body.appendChild(container)

  const anim = Lottie.loadAnimation({
    container,
    renderer: 'canvas',
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: {
      context: canvas.getContext('2d')!,
      clearCanvas: true,
    },
  })

  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }

  const onFrame = () => {
    link!.href = canvas.toDataURL('image/png')
  }

  anim.addEventListener('enterFrame', onFrame)

  // Pause when tab is hidden to save CPU
  const onVisibility = () => {
    if (document.hidden) anim.pause()
    else anim.play()
  }
  document.addEventListener('visibilitychange', onVisibility)

  return () => {
    anim.removeEventListener('enterFrame', onFrame)
    document.removeEventListener('visibilitychange', onVisibility)
    anim.destroy()
    container.remove()
  }
}
