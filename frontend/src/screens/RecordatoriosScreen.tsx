import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import Card from '../components/Card';
import * as recordatoriosService from '../services/recordatoriosService';
import * as tareasService from '../services/tareasService';
import * as cursosService from '../services/cursosService';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { showMessage } from '../utils/notify';
import { theme } from '../styles/theme';
import FloatingButton from '../components/FloatingButton';

export default function RecordatoriosScreen() {
  const { user } = useAuth();
  const [recordatorios, setRecordatorios] = useState<any[]>([]);
  const [tareas, setTareas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ id: null as any, mensaje: '', fecha: '', tareaId: null as any });

  const load = async () => {
    setLoading(true);
    try {
      if (!user) {
        setRecordatorios([]);
        setTareas([]);
        setLoading(false);
        return;
      }

      // load user's cursos -> tareas -> recordatorios so we only show current user's data
      const c = await cursosService.getByUsuario(user.id);
      const cursosList = Array.isArray(c) ? c : [];
      const tareasLists = await Promise.all(cursosList.map((cu: any) => tareasService.getByCurso(cu.id)));
      const tareasAll = tareasLists.flat().filter(Boolean);
      setTareas(tareasAll);

      const recordatoriosLists = await Promise.all(tareasAll.map((t: any) => recordatoriosService.getByTarea(t.id)));
      const recordatoriosAll = recordatoriosLists.flat().filter(Boolean);
      setRecordatorios(recordatoriosAll);
    } catch (e) {
      showMessage('Error', 'No se pudieron cargar recordatorios');
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

  const openCreate = () => {
    setForm({ id: null, mensaje: '', fecha: '', tareaId: tareas[0]?.id || null });
    setModalVisible(true);
  };

  const openEdit = (item: any) => {
    setForm({ id: item.id, mensaje: item.mensaje || '', fecha: item.fecha || '', tareaId: item.tarea?.id || null });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.mensaje || !form.tareaId) return showMessage('Error', 'Mensaje y tarea son requeridos');
    setLoading(true);
    try {
      if (form.id) {
        await recordatoriosService.update(form.id, { mensaje: form.mensaje, fecha: form.fecha });
        showMessage('Éxito', 'Recordatorio actualizado');
      } else {
        await recordatoriosService.create(form.tareaId, { mensaje: form.mensaje, fecha: form.fecha });
        showMessage('Éxito', 'Recordatorio creado');
      }
      setModalVisible(false);
      await load();
    } catch (e) {
      showMessage('Error', 'Operación fallida');
    }
    setLoading(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Confirmar', 'Eliminar recordatorio?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const ok = await recordatoriosService.remove(id);
          setLoading(false);
          if (ok) {
            showMessage('Éxito', 'Recordatorio eliminado');
            load();
          } else showMessage('Error', 'No se pudo eliminar');
        },
      },
    ]);
  };

  const toggleEnviado = async (item: any) => {
    setLoading(true);
    try {
      await recordatoriosService.update(item.id, { ...item, enviado: !item.enviado });
      await load();
    } catch (e) {
      showMessage('Error', 'No se pudo actualizar');
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f6fb' }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Recordatorios</Text>
        </View>
        {loading ? <ActivityIndicator /> : null}
        <FlatList
          data={recordatorios}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontWeight: '700' }}>{item.mensaje}</Text>
                  <Text style={{ color: '#6b7280', marginTop: 6 }}>{item.fecha}</Text>
                </View>
                  <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: item.enviado ? '#10b981' : '#f59e0b' }}>{item.enviado ? 'Enviado' : 'Pendiente'}</Text>
                  <TouchableOpacity onPress={() => toggleEnviado(item)} hitSlop={{ top: 28, bottom: 28, left: 28, right: 28 }} activeOpacity={0.8}>
                    <Text style={{ color: '#3b82f6', marginTop: 6 }}>{item.enviado ? 'Marcar pendiente' : 'Marcar enviado'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openEdit(item)} hitSlop={{ top: 28, bottom: 28, left: 28, right: 28 }} activeOpacity={0.8}>
                    <Text style={{ color: '#3b82f6', marginTop: 6 }}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={{ top: 28, bottom: 28, left: 28, right: 28 }} activeOpacity={0.8}>
                    <Text style={{ color: '#ef4444', marginTop: 6 }}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={<Text style={{ color: '#6b7280' }}>No hay recordatorios</Text>}
        />

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalWrap}>
            <View style={styles.modalCard}>
              <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>{form.id ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}</Text>
              <TextInput placeholder="Mensaje" value={form.mensaje} onChangeText={(t) => setForm({ ...form, mensaje: t })} style={styles.input} />
              <TextInput placeholder="Fecha" value={form.fecha} onChangeText={(t) => setForm({ ...form, fecha: t })} style={styles.input} />
              <Text style={{ marginTop: 8, marginBottom: 6 }}>Tarea</Text>
              <View style={{ maxHeight: 120 }}>
                <FlatList data={tareas} keyExtractor={(i: any) => String(i.id)} renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => setForm({ ...form, tareaId: item.id })} style={{ padding: 8, backgroundColor: form.tareaId === item.id ? '#eef2ff' : 'transparent' }}>
                    <Text>{item.titulo}</Text>
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
  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: theme.card, borderRadius: theme.radius, padding: 16, shadowColor: theme.shadowColor, shadowOpacity: theme.shadowOpacity, shadowRadius: theme.shadowRadius, elevation: theme.elevation },
  input: { borderWidth: 1, borderColor: '#e6edf5', padding: 10, borderRadius: 10, marginTop: 8 },
});
