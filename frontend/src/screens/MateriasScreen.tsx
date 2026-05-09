import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import Card from '../components/Card';
import * as cursosService from '../services/cursosService';
import { useAuth } from '../context/AuthContext';
import { showMessage } from '../utils/notify';

export default function MateriasScreen() {
  const { user } = useAuth();
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ id: null as any, nombre: '', color: '#60a5fa' });

  const load = async () => {
    setLoading(true);
    try {
      const list = await cursosService.getByUsuario(user?.id || 0);
      setCursos(Array.isArray(list) ? list : []);
    } catch (e) {
      showMessage('Error', 'No se pudieron cargar las materias');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm({ id: null, nombre: '', color: '#60a5fa' });
    setModalVisible(true);
  };

  const openEdit = (item: any) => {
    setForm({ id: item.id, nombre: item.nombre || '', color: item.color || '#60a5fa' });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.nombre) return showMessage('Error', 'Nombre es requerido');
    setLoading(true);
    try {
      if (form.id) {
        await cursosService.update(form.id, { nombre: form.nombre, color: form.color });
        showMessage('Éxito', 'Materia actualizada');
      } else {
        await cursosService.create(user?.id || 0, { nombre: form.nombre, color: form.color });
        showMessage('Éxito', 'Materia creada');
      }
      setModalVisible(false);
      await load();
    } catch (e) {
      showMessage('Error', 'Operación fallida');
    }
    setLoading(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Confirmar', 'Eliminar materia?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const ok = await cursosService.remove(id);
          setLoading(false);
          if (ok) {
            showMessage('Éxito', 'Materia eliminada');
            load();
          } else showMessage('Error', 'No se pudo eliminar');
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f6fb' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Materias</Text>
        {loading ? <ActivityIndicator /> : null}
        <FlatList
          data={cursos}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openEdit(item)}>
              <Card style={{ marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 12, height: 40, backgroundColor: item.color || '#60a5fa', borderRadius: 8, marginRight: 12 }} />
                  <Text style={{ fontWeight: '700' }}>{item.nombre}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={{ color: '#ef4444' }}>Eliminar</Text>
                </TouchableOpacity>
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ color: '#6b7280' }}>No hay materias</Text>}
        />
        <TouchableOpacity style={styles.fab} onPress={openCreate}>
          <Text style={{ color: '#fff', fontSize: 30 }}>+</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalWrap}>
            <View style={styles.modalCard}>
              <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>{form.id ? 'Editar Materia' : 'Nueva Materia'}</Text>
              <TextInput placeholder="Nombre" value={form.nombre} onChangeText={(t) => setForm({ ...form, nombre: t })} style={styles.input} />
              <TextInput placeholder="Color (hex)" value={form.color} onChangeText={(t) => setForm({ ...form, color: t })} style={styles.input} />
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
  fab: { position: 'absolute', right: 26, bottom: 26, width: 56, height: 56, borderRadius: 28, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  input: { borderWidth: 1, borderColor: '#e6edf5', padding: 10, borderRadius: 10, marginTop: 8 },
});
