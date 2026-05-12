import React from 'react'
import { Image, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import useProfilePhotoUri from '../hooks/useProfilePhotoUri'

type Props = {
  color: string
  size?: number
}

export default function TabProfileIcon({ color, size = 24 }: Props) {
  const { uri } = useProfilePhotoUri()

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    )
  }

  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="person" size={size - 6} color={color} />
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: '#fff',
  },
})
