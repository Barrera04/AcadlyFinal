import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../styles/theme';
import Card from '../components/Card';
import FloatingButton from '../components/FloatingButton';
import * as cursosService from '../services/cursosService';
import * as courseState from '../services/courseStateService';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { showMessage } from '../utils/notify';

export default function MateriasScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ id: null as any, nombre: '', color: '#60a5fa' });
  const palette = ['#60a5fa', '#f87171', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#fb923c', '#a3e635'];
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    try {
      if (!user) {
        setCursos([]);
        setActiveMap({});
        setLoading(false);
        return;
      }

      const list = await cursosService.getByUsuario(user.id);
      setCursos(Array.isArray(list) ? list : []);
      const s = await courseState.getStates();
      const map: Record<string, boolean> = {};
      Object.keys(s).forEach((k) => (map[k] = !!s[k].active));
      setActiveMap(map);
    } catch (e) {
      showMessage('Error', 'No se pudieron cargar las materias');
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
        if (!user) return showMessage('Error', 'No autorizado');
        await cursosService.create(user.id, { nombre: form.nombre, color: form.color });
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
    <View style={{ flex: 1, backgroundColor: '#f3f6fb', paddingBottom: insets.bottom }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Materias</Text>
        {loading ? <ActivityIndicator /> : null}
        <FlatList
          data={cursos}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openEdit(item)} activeOpacity={0.8}>
                <Card style={{ marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 12, height: 40, backgroundColor: item.color || '#60a5fa', borderRadius: 8, marginRight: 12 }} />
                    <Text style={{ fontWeight: '700' }}>{item.nombre}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={async () => {
                      const v = await courseState.toggleActive(item.id);
                      setActiveMap({ ...activeMap, [String(item.id)]: v });
                    }} style={{ marginRight: 12 }} hitSlop={{ top: 28, bottom: 28, left: 28, right: 28 }}>
                      <Ionicons name={activeMap[String(item.id)] === false ? 'eye-off' : 'eye'} size={20} color="#374151" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={{ top: 28, bottom: 28, left: 28, right: 28 }}>
                      <Text style={{ color: '#ef4444' }}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ color: '#6b7280' }}>No hay materias</Text>}
        />
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalWrap}>
            <View style={styles.modalCard}>
              <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>{form.id ? 'Editar Materia' : 'Nueva Materia'}</Text>
              <TextInput placeholder="Nombre" value={form.nombre} onChangeText={(t) => setForm({ ...form, nombre: t })} style={styles.input} />
              <Text style={{ marginTop: 8 }}>Color</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                {palette.map((c) => (
                  <TouchableOpacity key={c} onPress={() => setForm({ ...form, color: c })} style={{ width: 36, height: 36, backgroundColor: c, borderRadius: 8, marginRight: 8, marginBottom: 8, borderWidth: form.color === c ? 2 : 0, borderColor: '#000' }} />
                ))}
              </View>
              <TextInput placeholder="Color (hex)" value={form.color} onChangeText={(t) => setForm({ ...form, color: t })} style={styles.input} />
              {form.id ? (
                <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
                  <Text style={{ marginRight: 8 }}>Visible</Text>
                  <TouchableOpacity onPress={async () => { const newVal = !(await courseState.isActive(form.id)); await courseState.setActive(form.id, newVal); setActiveMap({ ...activeMap, [String(form.id)]: newVal }); }}>
                    <Ionicons name={(form.id && activeMap[String(form.id)] === false) ? 'eye-off' : 'eye'} size={20} color="#374151" />
                  </TouchableOpacity>
                </View>
              ) : null}
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
