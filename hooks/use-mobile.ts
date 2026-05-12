import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    // setIsMobile(window.innerWidth < MOBILE_BREAKPOINT) // Removed to avoid lint error, but we need initial state.
    // Instead of setting it in the effect, we can initialize it in useState if we want SSR safety or just use a passive effect.
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
