import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import Card from '../components/Card';
import * as tareasService from '../services/tareasService';
import * as cursosService from '../services/cursosService';
import { useAuth } from '../context/AuthContext';
import { showMessage } from '../utils/notify';

export default function TareasScreen() {
  const { user } = useAuth();
  const [tareas, setTareas] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ id: null as any, titulo: '', descripcion: '', fecha: '', cursoId: null as any, estado: 'pendiente' });
  const [filter, setFilter] = useState<'all' | 'pendiente' | 'completada'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const t = await tareasService.getAll();
      setTareas(Array.isArray(t) ? t : []);
      const c = await cursosService.getByUsuario(user?.id || 0);
      setCursos(Array.isArray(c) ? c : []);
    } catch (e) {
      showMessage('Error', 'No se pudieron cargar las tareas o materias');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm({ id: null, titulo: '', descripcion: '', fecha: '', cursoId: cursos[0]?.id || null, estado: 'pendiente' });
    setModalVisible(true);
  };

  const openEdit = (item: any) => {
    setForm({ id: item.id, titulo: item.titulo || '', descripcion: item.descripcion || '', fecha: item.fecha || '', cursoId: item.curso?.id || null, estado: item.estado || 'pendiente' });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.titulo || !form.cursoId) return showMessage('Error', 'Título y materia son requeridos');
    setLoading(true);
    try {
      if (form.id) {
        await tareasService.update(form.id, { titulo: form.titulo, descripcion: form.descripcion, fecha: form.fecha, estado: form.estado });
        showMessage('Éxito', 'Tarea actualizada');
      } else {
        await tareasService.create(form.cursoId, { titulo: form.titulo, descripcion: form.descripcion, fecha: form.fecha, estado: form.estado });
        showMessage('Éxito', 'Tarea creada');
      }
      setModalVisible(false);
      await load();
    } catch (e) {
      showMessage('Error', 'Operación fallida');
    }
    setLoading(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Confirmar', 'Eliminar tarea?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const ok = await tareasService.remove(id);
          setLoading(false);
          if (ok) {
            showMessage('Éxito', 'Tarea eliminada');
            load();
          } else showMessage('Error', 'No se pudo eliminar');
        },
      },
    ]);
  };

  const filtered = tareas.filter((t) => (filter === 'all' ? true : t.estado === filter));

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f6fb' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Tareas</Text>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => setFilter('all')} style={{ marginRight: 8 }}>
            <Text style={{ color: filter === 'all' ? '#3b82f6' : '#6b7280' }}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter('pendiente')} style={{ marginRight: 8 }}>
            <Text style={{ color: filter === 'pendiente' ? '#3b82f6' : '#6b7280' }}>Pendientes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter('completada')}>
            <Text style={{ color: filter === 'completada' ? '#3b82f6' : '#6b7280' }}>Hechas</Text>
          </TouchableOpacity>
        </View>
        {loading ? <ActivityIndicator /> : null}
        <FlatList
          data={filtered}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openEdit(item)}>
              <Card style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontWeight: '700' }}>{item.titulo}</Text>
                    <Text style={{ color: '#6b7280', marginTop: 6 }}>{item.curso?.nombre}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: item.estado === 'completada' ? '#10b981' : '#f59e0b' }}>{item.estado}</Text>
                    <Text style={{ color: '#6b7280', marginTop: 6 }}>{item.fecha}</Text>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                      <Text style={{ color: '#ef4444', marginTop: 6 }}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ color: '#6b7280' }}>No hay tareas</Text>}
        />
        <TouchableOpacity style={styles.fab} onPress={openCreate}>
          <Text style={{ color: '#fff', fontSize: 22 }}>+</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalWrap}>
            <View style={styles.modalCard}>
              <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>{form.id ? 'Editar Tarea' : 'Nueva Tarea'}</Text>
              <TextInput placeholder="Título" value={form.titulo} onChangeText={(t) => setForm({ ...form, titulo: t })} style={styles.input} />
              <TextInput placeholder="Descripción" value={form.descripcion} onChangeText={(t) => setForm({ ...form, descripcion: t })} style={styles.input} />
              <TextInput placeholder="Fecha (ej. 2026-05-10)" value={form.fecha} onChangeText={(t) => setForm({ ...form, fecha: t })} style={styles.input} />
              <Text style={{ marginTop: 8, marginBottom: 6 }}>Materia</Text>
              <View style={{ maxHeight: 120 }}>
                <FlatList data={cursos} keyExtractor={(i: any) => String(i.id)} renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => setForm({ ...form, cursoId: item.id })} style={{ padding: 8, backgroundColor: form.cursoId === item.id ? '#eef2ff' : 'transparent' }}>
                    <Text>{item.nombre}</Text>
                  </TouchableOpacity>
                )} />
              </View>
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
