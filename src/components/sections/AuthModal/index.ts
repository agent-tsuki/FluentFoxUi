// Only the lazy entry is exported: importing AuthModal itself here would pull
// the whole modal back into the initial bundle.
export { LazyAuthModal, prefetchAuthModal, authModalPrefetchHandlers } from './LazyAuthModal'
