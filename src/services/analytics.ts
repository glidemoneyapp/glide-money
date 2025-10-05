/**
 * Minimal analytics service stub
 */

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (!__DEV__) return
  try {
    // Replace with real analytics SDK later
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${eventName}`, properties || {})
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('analytics error', error)
  }
}

export function trackError(name: string, err: unknown, extras?: Record<string, unknown>) {
  if (!__DEV__) return
  try {
    // eslint-disable-next-line no-console
    console.warn(`[error] ${name}`, err, extras || {})
  } catch {}
}


