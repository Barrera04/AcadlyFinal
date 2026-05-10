import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import * as tareasService from '../services/tareasService';
import * as cursosService from '../services/cursosService';
import * as courseState from '../services/courseStateService';
import { useAuth } from '../context/AuthContext';
import { showMessage } from '../utils/notify';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FloatingButton from '../components/FloatingButton';
import { theme } from '../styles/theme';

export default function TareasScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [tareas, setTareas] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ id: null as any, titulo: '', descripcion: '', fecha: '', cursoId: null as any, estado: 'pendiente' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pendiente' | 'completada'>('all');

  const load = async () => {
    setLoading(true);
    try {
      if (!user) {
        setTareas([]);
        setCursos([]);
        setActiveMap({});
        setLoading(false);
        return;
      }

      const c = await cursosService.getByUsuario(user.id);
      const cursosList = Array.isArray(c) ? c : [];
      setCursos(cursosList);
      const s = await courseState.getStates();
      const map: Record<string, boolean> = {};
      Object.keys(s).forEach((k) => (map[k] = !!s[k].active));
      setActiveMap(map);

      const activeCursoIds = cursosList.map((cu: any) => cu.id).filter((id: any) => map[String(id)] !== false);
      const tareasLists = await Promise.all(activeCursoIds.map((cid: number) => tareasService.getByCurso(cid)));
      const tareasAll = tareasLists.flat().filter(Boolean);
      setTareas(tareasAll);
    } catch (e) {
      showMessage('Error', 'No se pudieron cargar las tareas o materias');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [user])
  );

  // open create modal if navigated here with param
  const route = useRoute();
  const navigation: any = useNavigation();

  useEffect(() => {
    // @ts-ignore
    if (route.params && (route as any).params.openCreate) {
      openCreate();
      try {
        navigation.setParams({ openCreate: false });
      } catch (e) {}
    }
  }, [route.params]);

  const openCreate = () => {
    const firstActive = cursos.find((c) => activeMap[String(c.id)] !== false);
    setForm({ id: null, titulo: '', descripcion: '', fecha: '', cursoId: firstActive?.id || cursos[0]?.id || null, estado: 'pendiente' });
    setModalVisible(true);
  };

  const openEdit = (item: any) => {
    const fechaStr = item.fechaLimite ? String(item.fechaLimite).split('T')[0] : (item.fecha ? String(item.fecha).split('T')[0] : '');
    setForm({ id: item.id, titulo: item.titulo || '', descripcion: item.descripcion || '', fecha: fechaStr, cursoId: item.curso?.id || null, estado: item.estado || 'pendiente' });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.titulo || !form.cursoId || !form.fecha) return showMessage('Error', 'Título, fecha y materia son requeridos');
    setLoading(true);
    try {
      // convert fecha (e.g. YYYY-MM-DD) to ISO offset string so backend OffsetDateTime parses it
      let fechaIso: string;
      try {
        const d = new Date(form.fecha);
        if (isNaN(d.getTime())) throw new Error('invalid date');
        fechaIso = d.toISOString();
      } catch (err) {
        setLoading(false);
        return showMessage('Error', 'Fecha inválida');
      }

      if (form.id) {
        await tareasService.update(form.id, { titulo: form.titulo, descripcion: form.descripcion, fechaLimite: fechaIso, estado: form.estado });
        showMessage('Éxito', 'Tarea actualizada');
      } else {
        await tareasService.create(form.cursoId, { titulo: form.titulo, descripcion: form.descripcion, fechaLimite: fechaIso, estado: form.estado });
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
    <View style={{ flex: 1, backgroundColor: '#f3f6fb', paddingBottom: insets.bottom }}>
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
                    <Text style={{ color: '#6b7280', marginTop: 6 }}>{item.fechaLimite ? String(item.fechaLimite).split('T')[0] : (item.fecha ? String(item.fecha).split('T')[0] : '')}</Text>
                    <TouchableOpacity onPress={async () => {
                      const newState = item.estado === 'completada' ? 'pendiente' : 'completada';
                      const res = await tareasService.update(item.id, { estado: newState });
                      if (res?.error) return showMessage('Error', 'No se pudo actualizar estado');
                      showMessage('Éxito', `Tarea marcada como ${newState}`);
                      await load();
                              }} hitSlop={{ top: 28, bottom: 28, left: 28, right: 28 }} activeOpacity={0.8}>
                                <Text style={{ color: item.estado === 'completada' ? '#f59e0b' : '#10b981', marginTop: 6 }}>{item.estado === 'completada' ? 'Marcar pendiente' : 'Marcar hecha'}</Text>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={{ top: 28, bottom: 28, left: 28, right: 28 }} activeOpacity={0.8}>
                                <Text style={{ color: '#ef4444', marginTop: 6 }}>Eliminar</Text>
                              </TouchableOpacity>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ color: '#6b7280' }}>No hay tareas</Text>}
        />
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalWrap}>
            <View style={styles.modalCard}>
              <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>{form.id ? 'Editar Tarea' : 'Nueva Tarea'}</Text>
              <TextInput placeholder="Título" value={form.titulo} onChangeText={(t) => setForm({ ...form, titulo: t })} style={styles.input} />
              <TextInput placeholder="Descripción" value={form.descripcion} onChangeText={(t) => setForm({ ...form, descripcion: t })} style={styles.input} />
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.input, { justifyContent: 'center' }]}> 
                <Text style={{ color: form.fecha ? '#000' : '#9ca3af' }}>{form.fecha ? form.fecha : 'Seleccionar fecha'}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={form.fecha ? new Date(form.fecha) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(event: any, selectedDate?: Date) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const isoDay = selectedDate.toISOString().split('T')[0];
                      setForm({ ...form, fecha: isoDay });
                    }
                  }}
                />
              )}
              <Text style={{ marginTop: 8, marginBottom: 6 }}>Materia</Text>
              <View style={{ maxHeight: 120 }}>
                <FlatList data={cursos.filter((c) => activeMap[String(c.id)] !== false)} keyExtractor={(i: any) => String(i.id)} renderItem={({ item }) => (
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
      <FloatingButton onPress={openCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  fab: { position: 'absolute', right: 26, width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: theme.card, borderRadius: theme.radius, padding: 16, shadowColor: theme.shadowColor, shadowOpacity: theme.shadowOpacity, shadowRadius: theme.shadowRadius, elevation: theme.elevation },
  input: { borderWidth: 1, borderColor: '#e6edf5', padding: 10, borderRadius: 10, marginTop: 8 },
});
