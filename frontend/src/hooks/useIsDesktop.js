import { useEffect, useState } from 'react'

const QUERY = '(min-width: 992px)'

// solo per interazioni che devono *funzionare* diversamente su desktop (non solo
// apparire diverse): il resto si fa con un @media, niente JS
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(QUERY).matches)

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const handler = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isDesktop
}
