
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Initial check
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Setup resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    window.addEventListener("resize", handleResize)
    
    // Fallback for older browsers that don't support matchMedia
    // or if the matchMedia query doesn't work properly
    if (typeof window.matchMedia !== 'function') {
      console.warn('Browser does not support matchMedia, using resize event only')
      return () => window.removeEventListener("resize", handleResize)
    }
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Modern browsers: use matchMedia listener
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener("change", handleResize)
      return () => {
        mql.removeEventListener("change", handleResize)
        window.removeEventListener("resize", handleResize)
      }
    }
    
    // Legacy browsers: use deprecated addListener
    if (typeof mql.addListener === 'function') {
      mql.addListener(handleResize)
      return () => {
        mql.removeListener(handleResize)
        window.removeEventListener("resize", handleResize)
      }
    }

    // If neither method is available, just use resize
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return isMobile === undefined ? false : isMobile
}
