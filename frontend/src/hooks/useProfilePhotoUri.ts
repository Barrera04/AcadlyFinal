import { useState, useEffect, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = '@profile_photo_uri'

export default function useProfilePhotoUri(): { uri: string | null } {
  const [uri, setUri] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadUri = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY)
        if (isMounted) setUri(saved)
      } catch (e) {
        console.warn('[useProfilePhotoUri] Error:', e)
      }
    }

    // Load on mount
    loadUri()

    // Poll every 500ms to detect changes
    intervalRef.current = setInterval(loadUri, 500)

    return () => {
      isMounted = false
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return { uri }
}
