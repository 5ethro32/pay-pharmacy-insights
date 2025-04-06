
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Initial check using window.innerWidth (client-side only)
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    return false // Default to desktop for SSR
  })

  React.useEffect(() => {
    // Skip effect in SSR context
    if (typeof window === 'undefined') return

    // Function to update state based on window width
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Add resize listener
    window.addEventListener("resize", handleResize)
    
    // Also use matchMedia for more responsive updates when supported
    if (typeof window.matchMedia === 'function') {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      
      // Modern browsers: use matchMedia listener when available
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener("change", handleResize)
        return () => {
          mql.removeEventListener("change", handleResize)
          window.removeEventListener("resize", handleResize)
        }
      }
      
      // Fallback to deprecated API if needed
      else if (typeof mql.addListener === 'function') {
        mql.addListener(handleResize)
        return () => {
          mql.removeListener(handleResize)
          window.removeEventListener("resize", handleResize)
        }
      }
    }
    
    // Cleanup resize listener
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return isMobile
}
