import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import Card from '../components/Card';
import * as usuariosService from '../services/usuariosService';
import { showMessage } from '../utils/notify';

export default function UsuariosScreen() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ id: null as any, nombre: '', email: '', password: '' });

  const load = async () => {
    setLoading(true);
    try {
      const u = await usuariosService.getAll();
      setUsuarios(Array.isArray(u) ? u : []);
    } catch (e) {
      showMessage('Error', 'No se pudieron cargar los usuarios');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm({ id: null, nombre: '', email: '', password: '' });
    setModalVisible(true);
  };

  const openEdit = (item: any) => {
    setForm({ id: item.id, nombre: item.nombre || '', email: item.email || '', password: '' });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.email) return showMessage('Error', 'Nombre y email requeridos');
    setLoading(true);
    try {
      if (form.id) {
        await usuariosService.update(form.id, { nombre: form.nombre, email: form.email });
        showMessage('Éxito', 'Usuario actualizado');
      } else {
        const res: any = await usuariosService.create({ nombre: form.nombre, email: form.email, password: form.password });
        if (res?.error) return showMessage('Error', res.error);
        showMessage('Éxito', 'Usuario creado');
      }
      setModalVisible(false);
      await load();
    } catch (e) {
      showMessage('Error', 'Operación fallida');
    }
    setLoading(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Confirmar', 'Eliminar usuario?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const ok = await usuariosService.remove(id);
          setLoading(false);
          if (ok) {
            showMessage('Éxito', 'Usuario eliminado');
            load();
          } else showMessage('Error', 'No se pudo eliminar');
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f6fb' }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Usuarios</Text>
          <TouchableOpacity onPress={openCreate} style={{ backgroundColor: '#3b82f6', padding: 8, borderRadius: 8 }}>
            <Text style={{ color: '#fff' }}>Nuevo</Text>
          </TouchableOpacity>
        </View>
        {loading ? <ActivityIndicator /> : null}
        <FlatList
          data={usuarios}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontWeight: '700' }}>{item.nombre}</Text>
                  <Text style={{ color: '#6b7280', marginTop: 6 }}>{item.email}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <TouchableOpacity onPress={() => openEdit(item)}>
                    <Text style={{ color: '#3b82f6' }}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={{ color: '#ef4444', marginTop: 6 }}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={<Text style={{ color: '#6b7280' }}>No hay usuarios</Text>}
        />

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalWrap}>
            <View style={styles.modalCard}>
              <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>{form.id ? 'Editar Usuario' : 'Nuevo Usuario'}</Text>
              <TextInput placeholder="Nombre" value={form.nombre} onChangeText={(t) => setForm({ ...form, nombre: t })} style={styles.input} />
              <TextInput placeholder="Email" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} style={styles.input} />
              {!form.id && <TextInput placeholder="Password" secureTextEntry value={form.password} onChangeText={(t) => setForm({ ...form, password: t })} style={styles.input} />}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginRight: 12 }}>
                  <Text>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={{ backgroundColor: '#3b82f6', padding: 10, borderRadius: 8 }}>
                  <Text style={{ color: '#fff' }}>{form.id ? 'Guardar' : 'Crear'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  input: { borderWidth: 1, borderColor: '#e6edf5', padding: 10, borderRadius: 10, marginTop: 8 },
});
