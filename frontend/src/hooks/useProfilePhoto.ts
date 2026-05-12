import { useState, useEffect, useCallback, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'

const STORAGE_KEY = '@profile_photo_uri'

type UseProfilePhotoReturn = {
  uri: string | null
  loading: boolean
  error: string | null
  pickImageFromLibrary: () => Promise<void>
  takePhotoWithCamera: () => Promise<void>
  removePhoto: () => Promise<void>
}

export default function useProfilePhoto(): UseProfilePhotoReturn {
  const [uri, setUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    const loadPhoto = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY)
        if (isMountedRef.current && saved) {
          console.log('[ProfilePhoto] Loaded:', saved)
          setUri(saved)
        }
      } catch (e: any) {
        console.warn('[ProfilePhoto] Load error:', e.message)
      } finally {
        if (isMountedRef.current) setLoading(false)
      }
    }
    loadPhoto()
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const persistUri = useCallback(async (localUri: string | null) => {
    try {
      if (!localUri) {
        await AsyncStorage.removeItem(STORAGE_KEY)
        if (isMountedRef.current) setUri(null)
        console.log('[ProfilePhoto] Removed')
        return
      }
      await AsyncStorage.setItem(STORAGE_KEY, localUri)
      if (isMountedRef.current) {
        setUri(localUri)
        setError(null)
      }
      console.log('[ProfilePhoto] Saved:', localUri)
    } catch (e: any) {
      console.warn('[ProfilePhoto] Save error:', e.message)
      if (isMountedRef.current) setError('Error guardando la foto')
    }
  }, [isMountedRef])

  const pickImageFromLibrary = useCallback(async () => {
    if (isMountedRef.current) setError(null)
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permission.granted) {
        if (isMountedRef.current) setError('Permiso de galería denegado')
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })
      if (!result.canceled && result.assets && result.assets[0]) {
        await persistUri(result.assets[0].uri)
      }
    } catch (e: any) {
      console.warn('[ProfilePhoto] Pick error:', e.message)
      if (isMountedRef.current) setError('No se pudo seleccionar la imagen')
    }
  }, [persistUri, isMountedRef])

  const takePhotoWithCamera = useCallback(async () => {
    if (isMountedRef.current) setError(null)
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync()
      if (!permission.granted) {
        if (isMountedRef.current) setError('Permiso de cámara denegado')
        return
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })
      if (!result.canceled && result.assets && result.assets[0]) {
        await persistUri(result.assets[0].uri)
      }
    } catch (e: any) {
      console.warn('[ProfilePhoto] Camera error:', e.message)
      if (isMountedRef.current) setError('No se pudo tomar la foto')
    }
  }, [persistUri, isMountedRef])

  const removePhoto = useCallback(async () => {
    if (isMountedRef.current) setError(null)
    try {
      await persistUri(null)
    } catch (e: any) {
      console.warn('[ProfilePhoto] Remove error:', e.message)
      if (isMountedRef.current) setError('No se pudo eliminar la foto')
    }
  }, [persistUri, isMountedRef])

  return {
    uri,
    loading,
    error,
    pickImageFromLibrary,
    takePhotoWithCamera,
    removePhoto,
  }
}

