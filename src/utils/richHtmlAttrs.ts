/**
 * Attribute names shared by the MDX parser (which writes interactive-word
 * placeholders into HTML) and `RichHtml` (which hydrates them). Kept in their
 * own tiny module so `RichHtml` doesn't pull the parser into its chunk.
 */

/**
 * Attribute that marks an interactive-word placeholder inside parsed HTML.
 * `RichHtml` finds these after render and mounts a real `<InteractiveWord />`
 * into each one via a portal.
 */
export const IW_PLACEHOLDER_ATTR = 'data-iw'
/** Child of a placeholder holding the plain-text fallback shown before mount. */
export const IW_FALLBACK_ATTR = 'data-iw-fallback'
