import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../styles/theme';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import FloatingButton from '../components/FloatingButton';
import * as horariosService from '../services/horariosService';
import * as cursosService from '../services/cursosService';
import * as courseState from '../services/courseStateService';
import { useAuth } from '../context/AuthContext';
import { showMessage } from '../utils/notify';
import { Ionicons } from '@expo/vector-icons';

const dayMap: Record<string, number> = { Lun: 1, Mar: 2, Mie: 3, Jue: 4, Vie: 5 };
const numToDay = (n: number) =>
  n >= 1 && n <= 5 ? ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'][n - 1] : 'Lun';
const dayColors = {
  Lun: '#60a5fa',
  Mar: '#34d399',
  Mie: '#fbbf24',
  Jue: '#f87171',
  Vie: '#a78bfa',
};

export default function HorariosScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [horarios, setHorarios] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    id: null as any,
    dia: 'Lun',
    horaInicio: '08:00',
    horaFin: '09:30',
    aula: '',
    cursoId: null as any,
  });
  const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'];

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

      const activeCursoIds = cursosList
        .map((cu: any) => cu.id)
        .filter((id: any) => map[String(id)] !== false);
      const horariosLists = await Promise.all(
        activeCursoIds.map((cid: number) => horariosService.getByCurso(cid))
      );
      const horariosAll = horariosLists
        .flat()
        .filter(Boolean)
        .map((item: any) => ({
          ...item,
          dia:
            item.dia ||
            (item.diaSemana ? numToDay(item.diaSemana) : undefined),
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
    setForm({
      id: null,
      dia: 'Lun',
      horaInicio: '08:00',
      horaFin: '09:30',
      aula: '',
      cursoId: firstActive?.id || cursos[0]?.id || null,
    });
    setModalVisible(true);
  };

  const openEdit = (item: any) => {
    const diaStr =
      item.dia || (item.diaSemana ? numToDay(item.diaSemana) : 'Lun');
    const hInicio = item.horaInicio || item.hora_inicio || '08:00';
    const hFin = item.horaFin || item.hora_fin || '09:30';
    setForm({
      id: item.id,
      dia: diaStr,
      horaInicio: hInicio,
      horaFin: hFin,
      aula: item.aula || '',
      cursoId: item.curso?.id || null,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.cursoId)
      return showMessage('Error', 'Selecciona una materia');
    setLoading(true);
    try {
      const diaSemanaVal = dayMap[form.dia] || 1;
      if (form.id) {
        await horariosService.update(form.id, {
          diaSemana: diaSemanaVal,
          horaInicio: form.horaInicio,
          horaFin: form.horaFin,
          aula: form.aula,
        });
        showMessage('Éxito', 'Horario actualizado');
      } else {
        await horariosService.create(form.cursoId, {
          diaSemana: diaSemanaVal,
          horaInicio: form.horaInicio,
          horaFin: form.horaFin,
          aula: form.aula,
        });
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

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }}>
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              color: theme.text,
              marginBottom: theme.spacing.sm,
            }}
          >
            Horario
          </Text>
          <Text style={{ fontSize: 14, color: theme.textSecondary }}>
            Tu semana académica
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          color={theme.primary}
          size="large"
          style={{ marginTop: theme.spacing.xxl }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: (insets.bottom || 0) + theme.spacing.xl + 60,
          }}
        >
          {days.map((day) => {
            const dayClasses = horarios.filter((h) => h.dia === day);

            return (
              <View key={day} style={{ marginBottom: theme.spacing.xl }}>
                {/* Day Header */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                    marginBottom: theme.spacing.lg,
                  }}
                >
                  <View
                    style={{
                      width: 4,
                      height: 24,
                      backgroundColor: (dayColors as any)[day],
                      borderRadius: theme.radius.full,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: theme.text,
                    }}
                  >
                    {day}
                  </Text>
                  {dayClasses.length > 0 && (
                    <View
                      style={{
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.sm,
                        backgroundColor: (dayColors as any)[day],
                        borderRadius: theme.radius.full,
                      }}
                    >
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: '600',
                        }}
                      >
                        {dayClasses.length}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Classes */}
                {dayClasses.length === 0 ? (
                  <Card variant="outlined" padding="lg">
                    <View style={{ alignItems: 'center', gap: theme.spacing.md }}>
                      <Ionicons
                        name="checkmark-circle"
                        size={40}
                        color={theme.textTertiary}
                      />
                      <Text
                        style={{
                          color: theme.textSecondary,
                          fontSize: 14,
                        }}
                      >
                        Sin clases
                      </Text>
                    </View>
                  </Card>
                ) : (
                  dayClasses.map((h, idx) => (
                    <View
                      key={h.id}
                      style={{
                        marginBottom:
                          idx === dayClasses.length - 1 ? 0 : theme.spacing.md,
                      }}
                    >
                      <Card
                        variant="elevated"
                        padding="lg"
                        style={{
                          borderLeftWidth: 4,
                          borderLeftColor: (dayColors as any)[day],
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: theme.spacing.lg,
                          }}
                        >
                          {/* Time */}
                          <View style={{ minWidth: 60 }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: '700',
                                color: (dayColors as any)[day],
                                marginBottom: theme.spacing.sm,
                              }}
                            >
                              {h.horaInicio}
                            </Text>
                            <Text
                              style={{
                                fontSize: 13,
                                color: theme.textTertiary,
                              }}
                            >
                              {h.horaFin}
                            </Text>
                          </View>

                          {/* Content */}
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: theme.text,
                                marginBottom: theme.spacing.sm,
                              }}
                            >
                              {h.curso?.nombre || 'Clase'}
                            </Text>
                            <View
                              style={{
                                flexDirection: 'row',
                                gap: theme.spacing.md,
                                alignItems: 'center',
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  gap: theme.spacing.sm,
                                }}
                              >
                                <Ionicons
                                  name="location"
                                  size={14}
                                  color={theme.textSecondary}
                                />
                                <Text
                                  style={{
                                    fontSize: 13,
                                    color: theme.textSecondary,
                                  }}
                                >
                                  {h.aula || 'Sin aula'}
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Actions */}
                          <TouchableOpacity
                            onPress={() => openEdit(h)}
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name="pencil"
                              size={18}
                              color={theme.primary}
                            />
                          </TouchableOpacity>
                        </View>
                      </Card>
                    </View>
                  ))
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: theme.spacing.lg,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text }}>
                {form.id ? 'Editar Horario' : 'Nuevo Horario'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: theme.spacing.lg }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.text,
                  marginBottom: theme.spacing.md,
                }}
              >
                Día
              </Text>
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
                {days.map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setForm({ ...form, dia: d })}
                    style={{
                      paddingHorizontal: theme.spacing.lg,
                      paddingVertical: theme.spacing.md,
                      borderRadius: theme.radius.full,
                      backgroundColor:
                        form.dia === d ? (dayColors as any)[d] : theme.bg,
                      borderWidth: form.dia === d ? 0 : 1,
                      borderColor: theme.border,
                    }}
                  >
                    <Text
                      style={{
                        color: form.dia === d ? '#fff' : theme.text,
                        fontWeight: '600',
                        fontSize: 14,
                      }}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Hora inicio"
              placeholder="08:00"
              value={form.horaInicio}
              onChangeText={(t) => setForm({ ...form, horaInicio: t })}
              icon="time"
              style={{ marginBottom: theme.spacing.lg }}
            />

            <Input
              label="Hora fin"
              placeholder="09:30"
              value={form.horaFin}
              onChangeText={(t) => setForm({ ...form, horaFin: t })}
              icon="time"
              style={{ marginBottom: theme.spacing.lg }}
            />

            <Input
              label="Aula/Ubicación"
              placeholder="Ej: Sala 101"
              value={form.aula}
              onChangeText={(t) => setForm({ ...form, aula: t })}
              icon="location"
              style={{ marginBottom: theme.spacing.lg }}
            />

            <View style={{ marginBottom: theme.spacing.lg }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.text,
                  marginBottom: theme.spacing.md,
                }}
              >
                Materia
              </Text>
              <FlatList
                data={cursos.filter((c) => activeMap[String(c.id)] !== false)}
                keyExtractor={(i: any) => String(i.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setForm({ ...form, cursoId: item.id })}
                    style={{
                      paddingHorizontal: theme.spacing.lg,
                      paddingVertical: theme.spacing.md,
                      marginBottom: theme.spacing.sm,
                      borderRadius: theme.radius.lg,
                      backgroundColor:
                        form.cursoId === item.id ? theme.lightBlue : theme.bg,
                      borderWidth: form.cursoId === item.id ? 2 : 0,
                      borderColor: theme.primary,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          form.cursoId === item.id ? theme.primary : theme.text,
                        fontWeight:
                          form.cursoId === item.id ? '600' : '500',
                      }}
                    >
                      {item.nombre}
                    </Text>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              <Button
                label="Cancelar"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                label={form.id ? 'Guardar' : 'Crear'}
                variant="primary"
                onPress={handleSave}
                loading={loading}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <FloatingButton onPress={openCreate} icon="add" />
    </View>
  );
}

const styles = StyleSheet.create({
  modalWrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
  modalCard: {
    backgroundColor: theme.card,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    maxHeight: '90%',
  },
});
