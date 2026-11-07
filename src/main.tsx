import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/fonts.css'
import './index.css'
import { App } from './App'
import { startAnswerQueue } from '@/api/answerQueue'
import { loadAnalyticsAfterPageLoad } from '@/lib/analytics'
import { preloadCurrentRoute } from '@/lib/routePreload'
import { installRoutePrefetch } from '@/lib/routePrefetch'

preloadCurrentRoute(window.location.pathname, window.location.search)
startAnswerQueue()
loadAnalyticsAfterPageLoad()
installRoutePrefetch()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
