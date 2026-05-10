import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../styles/theme';
import Card from '../components/Card';
import FloatingButton from '../components/FloatingButton';
import * as horariosService from '../services/horariosService';
import * as cursosService from '../services/cursosService';
import * as courseState from '../services/courseStateService';
import { useAuth } from '../context/AuthContext';
import { showMessage } from '../utils/notify';

export default function HorariosScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [horarios, setHorarios] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ id: null as any, dia: 'Lun', horaInicio: '08:00', horaFin: '09:30', aula: '', cursoId: null as any });
  const dayMap: Record<string, number> = { Lun: 1, Mar: 2, Mie: 3, Jue: 4, Vie: 5 };
  const numToDay = (n: number) => (n >= 1 && n <= 5 ? ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'][n - 1] : 'Lun');

  const load = async () => {
    setLoading(true);
    try {
      if (!user) {
        setHorarios([]);
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
      const horariosLists = await Promise.all(activeCursoIds.map((cid: number) => horariosService.getByCurso(cid)));
      const horariosAll = horariosLists
        .flat()
        .filter(Boolean)
        .map((item: any) => ({
          ...item,
          dia: item.dia || (item.diaSemana ? numToDay(item.diaSemana) : undefined),
          horaInicio: item.horaInicio || item.hora_inicio,
          horaFin: item.horaFin || item.hora_fin,
        }));
      setHorarios(horariosAll);
    } catch (e) {
      showMessage('Error', 'No se pudo cargar el horario');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const openCreate = () => {
    const firstActive = cursos.find((c) => activeMap[String(c.id)] !== false);
    setForm({ id: null, dia: 'Lun', horaInicio: '08:00', horaFin: '09:30', aula: '', cursoId: firstActive?.id || cursos[0]?.id || null });
    setModalVisible(true);
  };

  const openEdit = (item: any) => {
    const diaStr = item.dia || (item.diaSemana ? numToDay(item.diaSemana) : 'Lun');
    const hInicio = item.horaInicio || item.hora_inicio || '08:00';
    const hFin = item.horaFin || item.hora_fin || '09:30';
    setForm({ id: item.id, dia: diaStr, horaInicio: hInicio, horaFin: hFin, aula: item.aula || '', cursoId: item.curso?.id || null });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.cursoId) return showMessage('Error', 'Selecciona una materia');
    setLoading(true);
    try {
      const diaSemanaVal = dayMap[form.dia] || 1;
      if (form.id) {
        await horariosService.update(form.id, { diaSemana: diaSemanaVal, horaInicio: form.horaInicio, horaFin: form.horaFin, aula: form.aula });
        showMessage('Éxito', 'Horario actualizado');
      } else {
        await horariosService.create(form.cursoId, { diaSemana: diaSemanaVal, horaInicio: form.horaInicio, horaFin: form.horaFin, aula: form.aula });
        showMessage('Éxito', 'Horario creado');
      }
      setModalVisible(false);
      await load();
    } catch (e) {
      showMessage('Error', 'Operación fallida');
    }
    setLoading(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Confirmar', 'Eliminar horario?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const ok = await horariosService.remove(id);
          setLoading(false);
          if (ok) {
            showMessage('Éxito', 'Horario eliminado');
            load();
          } else showMessage('Error', 'No se pudo eliminar');
        },
      },
    ]);
  };

  const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'];

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f6fb' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: (insets.bottom || 0) + 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Horario</Text>
        </View>
        {loading ? <ActivityIndicator /> : null}
        {days.map((d) => (
          <Card key={d} style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: '700' }}>{d}</Text>
            {horarios.filter((h) => h.dia === d).length === 0 ? (
              <Text style={{ color: '#6b7280', marginTop: 6 }}>No hay clases</Text>
            ) : (
              horarios
                .filter((h) => h.dia === d)
                .map((h) => (
                  <View key={h.id} style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={{ fontWeight: '600' }}>{h.curso?.nombre || 'Materia'}</Text>
                      <Text style={{ color: '#6b7280' }}>{h.horaInicio} - {h.horaFin} · {h.aula}</Text>
                    </View>
                    <View>
                        <TouchableOpacity onPress={() => openEdit(h)} hitSlop={{ top: 28, bottom: 28, left: 28, right: 28 }} activeOpacity={0.8}>
                          <Text style={{ color: '#3b82f6' }}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(h.id)} hitSlop={{ top: 28, bottom: 28, left: 28, right: 28 }} activeOpacity={0.8}>
                          <Text style={{ color: '#ef4444', marginTop: 6 }}>Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                  </View>
                ))
            )}
          </Card>
        ))}

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalWrap}>
            <View style={styles.modalCard}>
              <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>{form.id ? 'Editar Horario' : 'Nuevo Horario'}</Text>
              <Text style={{ marginTop: 4 }}>Día</Text>
              <View style={{ flexDirection: 'row', marginTop: 6 }}>
                {days.map((d) => (
                  <TouchableOpacity key={d} onPress={() => setForm({ ...form, dia: d })} style={{ marginRight: 8 }}>
                    <Text style={{ color: form.dia === d ? '#3b82f6' : '#6b7280' }}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput placeholder="Hora inicio" value={form.horaInicio} onChangeText={(t) => setForm({ ...form, horaInicio: t })} style={styles.input} />
              <TextInput placeholder="Hora fin" value={form.horaFin} onChangeText={(t) => setForm({ ...form, horaFin: t })} style={styles.input} />
              <TextInput placeholder="Aula" value={form.aula} onChangeText={(t) => setForm({ ...form, aula: t })} style={styles.input} />
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
      </ScrollView>
      <FloatingButton onPress={openCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: theme.card, borderRadius: theme.radius, padding: 16, shadowColor: theme.shadowColor, shadowOpacity: theme.shadowOpacity, shadowRadius: theme.shadowRadius, elevation: theme.elevation },
  input: { borderWidth: 1, borderColor: '#e6edf5', padding: 10, borderRadius: 10, marginTop: 8 },
});
