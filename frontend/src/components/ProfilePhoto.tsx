import React, { useState } from 'react'
import { View, TouchableOpacity, Modal, Text, ActivityIndicator, Image, StyleSheet, Pressable } from 'react-native'
import useProfilePhoto from '../hooks/useProfilePhoto'

type Props = {
  size?: number
}

export default function ProfilePhoto({ size = 110 }: Props) {
  const { uri, loading, error, pickImageFromLibrary, takePhotoWithCamera, removePhoto } = useProfilePhoto()
  const [open, setOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const handlePick = async () => {
    setActionLoading(true)
    await pickImageFromLibrary()
    setActionLoading(false)
    setOpen(false)
  }

  const handleCamera = async () => {
    setActionLoading(true)
    await takePhotoWithCamera()
    setActionLoading(false)
    setOpen(false)
  }

  const handleRemove = async () => {
    setActionLoading(true)
    await removePhoto()
    setActionLoading(false)
    setOpen(false)
  }

  return (
    <View style={{ alignItems: 'center' }}>
      <TouchableOpacity onPress={() => setOpen(true)} activeOpacity={0.8} accessibilityLabel="Editar foto de perfil">
        <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}> 
          {loading ? (
            <ActivityIndicator size="small" color="#666" />
          ) : uri ? (
            <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.initials}>Perfil</Text>
            </View>
          )}
          <View style={styles.editBadge}><Text style={styles.editText}>✎</Text></View>
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => !actionLoading && setOpen(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.title}>Actualizar foto</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.row}>
              <Pressable style={[styles.button, actionLoading && styles.disabled]} onPress={handleCamera} disabled={actionLoading}>
                <Text style={styles.buttonText}>{actionLoading ? '⏳' : '📷 Tomar foto'}</Text>
              </Pressable>
              <Pressable style={[styles.button, actionLoading && styles.disabled]} onPress={handlePick} disabled={actionLoading}>
                <Text style={styles.buttonText}>{actionLoading ? '⏳' : '🖼️ Galería'}</Text>
              </Pressable>
            </View>
            <View style={styles.row}>
              <Pressable style={[styles.button, styles.destructive, actionLoading && styles.disabled]} onPress={handleRemove} disabled={actionLoading}>
                <Text style={[styles.buttonText, { color: '#b71c1c' }]}>{actionLoading ? '⏳' : '🗑️ Eliminar'}</Text>
              </Pressable>
              <Pressable style={[styles.button, actionLoading && styles.disabled]} onPress={() => setOpen(false)} disabled={actionLoading}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  image: { resizeMode: 'cover' },
  placeholder: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  initials: { color: '#374151', fontSize: 18, fontWeight: '600' },
  editBadge: { position: 'absolute', right: 6, bottom: 6, backgroundColor: '#fff', padding: 6, borderRadius: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, elevation: 4 },
  editText: { fontSize: 12, color: '#111827' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '86%', backgroundColor: '#fff', borderRadius: 14, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 10 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  button: { flex: 1, paddingVertical: 10, marginHorizontal: 6, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center' },
  disabled: { opacity: 0.6 },
  destructive: { backgroundColor: '#fff' },
  buttonText: { color: '#111827', fontWeight: '600', fontSize: 14 },
  error: { color: '#b71c1c', marginBottom: 6, fontSize: 12 }
})
