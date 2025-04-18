
import * as React from "react"

// Setting a consistent mobile breakpoint
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Initial check based on window width
    const checkMobile = () => {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    
    // Set initial state
    setIsMobile(checkMobile())
    
    // Function to update state based on window width
    const handleResize = () => {
      setIsMobile(checkMobile())
    }
    
    // Add resize listener
    window.addEventListener("resize", handleResize)
    
    // Use matchMedia for more responsive updates
    if (typeof window.matchMedia === 'function') {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      
      // Use standard addEventListener when available
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener("change", handleResize)
        return () => {
          mql.removeEventListener("change", handleResize)
          window.removeEventListener("resize", handleResize)
        }
      }
      // Fall back to deprecated API if needed
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
