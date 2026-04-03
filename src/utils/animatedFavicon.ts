import lottie from 'lottie-web'

export function startAnimatedFavicon(animationData: object) {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64

  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;width:64px;height:64px;top:-9999px;left:-9999px;'
  container.appendChild(canvas)
  document.body.appendChild(container)

  const anim = lottie.loadAnimation({
    container,
    renderer: 'canvas',
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: { context: canvas.getContext('2d')!, clearCanvas: true },
  })

  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }

  anim.addEventListener('enterFrame', () => {
    link!.href = canvas.toDataURL('image/png')
  })
}
