import { useEffect, useState, useRef } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

export const useAuthStatus = (): {loggedIn: boolean | undefined, loading: boolean | undefined} => {
  const [loggedIn, setLoggedIn] = useState<boolean | undefined>(false)
  const [loading, setLoading] = useState<boolean | undefined>(true)
  const isMounted = useRef(true)

  useEffect(() => {
    if (isMounted) {
      const auth = getAuth()
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setLoggedIn(true)
        }
        setLoading(false)
      })
    }

    return () => {
      isMounted.current = false
    }
  }, [isMounted])

  return { loggedIn, loading }
}