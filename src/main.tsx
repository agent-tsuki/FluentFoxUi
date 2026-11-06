import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/fonts.css'
import './index.css'
import { App } from './App'
import { startAnswerQueue } from '@/api/answerQueue'
import { loadAnalyticsAfterPageLoad } from '@/lib/analytics'
import { preloadCurrentRoute } from '@/lib/routePreload'

preloadCurrentRoute(window.location.pathname, window.location.search)
startAnswerQueue()
loadAnalyticsAfterPageLoad()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
