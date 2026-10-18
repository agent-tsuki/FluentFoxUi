import { GOOGLE_MAPS_EMBED_KEY } from '@/lib/config'
import { Icon } from '@/components/ui/Icon'

const EMBED_URL = 'https://www.google.com/maps/embed/v1/place'
const SEARCH_URL = 'https://www.google.com/maps/search/'
const GPS_ZOOM = 15
const IP_ZOOM = 10

interface LoginMapProps {
  latitude:  number
  longitude: number
  /** GPS is precise enough to zoom in; an IP location only to the city. */
  precise:   boolean
  label:     string
}

export function LoginMap({ latitude, longitude, precise, label }: LoginMapProps) {
  const query = `${latitude},${longitude}`
  const openUrl = `${SEARCH_URL}?api=1&query=${encodeURIComponent(query)}`

  if (!GOOGLE_MAPS_EMBED_KEY) {
    return (
      <a href={openUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
        <Icon name="location_on" className="text-sm" /> Open in Google Maps
      </a>
    )
  }

  const src = `${EMBED_URL}?key=${encodeURIComponent(GOOGLE_MAPS_EMBED_KEY)}&q=${encodeURIComponent(query)}&zoom=${precise ? GPS_ZOOM : IP_ZOOM}`
  return (
    <iframe
      title={`Map of ${label}`}
      src={src}
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      className="w-full h-44 rounded-lg border-0"
    />
  )
}
