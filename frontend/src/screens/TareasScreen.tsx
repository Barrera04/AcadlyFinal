import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Badge from '../components/Badge';
import * as tareasService from '../services/tareasService';
import * as cursosService from '../services/cursosService';
import * as courseState from '../services/courseStateService';
import { useAuth } from '../context/AuthContext';
import { showMessage } from '../utils/notify';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FloatingButton from '../components/FloatingButton';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function TareasScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [tareas, setTareas] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    id: null as any,
    titulo: '',
    descripcion: '',
    fecha: '',
    cursoId: null as any,
    estado: 'pendiente',
  });
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

      const activeCursoIds = cursosList
        .map((cu: any) => cu.id)
        .filter((id: any) => map[String(id)] !== false);
      const tareasLists = await Promise.all(
        activeCursoIds.map((cid: number) => tareasService.getByCurso(cid))
      );
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

  const route = useRoute();
  const navigation: any = useNavigation();

  useEffect(() => {
    if (route.params && (route as any).params.openCreate) {
      openCreate();
      try {
        navigation.setParams({ openCreate: false });
      } catch (e) {}
    }
  }, [route.params]);

  const openCreate = () => {
    const firstActive = cursos.find((c) => activeMap[String(c.id)] !== false);
    setForm({
      id: null,
      titulo: '',
      descripcion: '',
      fecha: '',
      cursoId: firstActive?.id || cursos[0]?.id || null,
      estado: 'pendiente',
    });
    setModalVisible(true);
  };

  const openEdit = (item: any) => {
    const fechaStr = item.fechaLimite
      ? String(item.fechaLimite).split('T')[0]
      : item.fecha
      ? String(item.fecha).split('T')[0]
      : '';
    setForm({
      id: item.id,
      titulo: item.titulo || '',
      descripcion: item.descripcion || '',
      fecha: fechaStr,
      cursoId: item.curso?.id || null,
      estado: item.estado || 'pendiente',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.titulo || !form.cursoId || !form.fecha)
      return showMessage('Error', 'Título, fecha y materia son requeridos');
    setLoading(true);
    try {
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
        await tareasService.update(form.id, {
          titulo: form.titulo,
          descripcion: form.descripcion,
          fechaLimite: fechaIso,
          estado: form.estado,
        });
        showMessage('Éxito', 'Tarea actualizada');
      } else {
        await tareasService.create(form.cursoId, {
          titulo: form.titulo,
          descripcion: form.descripcion,
          fechaLimite: fechaIso,
          estado: form.estado,
        });
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
  const pendingCount = filtered.filter((t) => t.estado !== 'completada').length;
  const completedCount = filtered.filter((t) => t.estado === 'completada').length;

  const daysUntil = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const days = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return days;
    } catch {
      return null;
    }
  };

  const getStatusColor = (estado: string) => {
    return estado === 'completada' ? theme.success : theme.primary;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }}>
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: theme.text, marginBottom: theme.spacing.sm }}>
            Tareas
          </Text>
          <Text style={{ fontSize: 14, color: theme.textSecondary }}>
            {pendingCount} pendientes · {completedCount} completadas
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={{ flexDirection: 'row', marginBottom: theme.spacing.lg, gap: theme.spacing.md }}>
          {(['all', 'pendiente', 'completada'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                {
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.md,
                  borderRadius: theme.radius.full,
                  backgroundColor: filter === f ? theme.primary : theme.card,
                  borderWidth: filter === f ? 0 : 1,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={{
                  color: filter === f ? '#fff' : theme.text,
                  fontWeight: '600',
                  fontSize: 13,
                }}
              >
                {f === 'all' ? 'Todas' : f === 'pendiente' ? 'Pendientes' : 'Completadas'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading && <ActivityIndicator color={theme.primary} size="large" />}

      <FlatList
        data={filtered}
        keyExtractor={(item: any) => String(item.id)}
        renderItem={({ item }) => {
          const days = daysUntil(item.fechaLimite || item.fecha);
          const isOverdue = days !== null && days < 0 && item.estado !== 'completada';
          const isDueSoon = days !== null && days >= 0 && days <= 2 && item.estado !== 'completada';

          return (
            <TouchableOpacity
              onPress={() => openEdit(item)}
              activeOpacity={0.7}
              style={{ paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md }}
            >
              <Card
                variant="elevated"
                padding="lg"
                style={[
                  {
                    borderLeftWidth: 4,
                    borderLeftColor: getStatusColor(item.estado),
                    opacity: item.estado === 'completada' ? 0.7 : 1,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                  {/* Checkbox */}
                  <TouchableOpacity
                    onPress={async () => {
                      const newState =
                        item.estado === 'completada' ? 'pendiente' : 'completada';
                      await tareasService.update(item.id, { estado: newState });
                      showMessage('Éxito', `Tarea marcada como ${newState}`);
                      await load();
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: theme.radius.md,
                        backgroundColor:
                          item.estado === 'completada'
                            ? theme.success
                            : theme.border,
                        borderWidth: item.estado === 'completada' ? 0 : 2,
                        borderColor: theme.primary,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 2,
                      }}
                    >
                      {item.estado === 'completada' && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Content */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: theme.text,
                        textDecorationLine:
                          item.estado === 'completada' ? 'line-through' : 'none',
                        marginBottom: theme.spacing.sm,
                      }}
                    >
                      {item.titulo}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.sm }}>
                      <Badge
                        label={item.curso?.nombre || 'Sin materia'}
                        variant="info"
                        size="sm"
                      />
                      {isOverdue && (
                        <Badge label="Vencida" variant="danger" size="sm" />
                      )}
                      {isDueSoon && !isOverdue && (
                        <Badge label="Próxima" variant="warning" size="sm" />
                      )}
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                        {(item.fechaLimite || item.fecha || '').toString().split('T')[0] || ''}
                      </Text>
                      {days !== null && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: isOverdue
                              ? theme.danger
                              : isDueSoon
                              ? theme.accent
                              : theme.textTertiary,
                            fontWeight: '600',
                          }}
                        >
                          {days < 0
                            ? `Hace ${Math.abs(days)} días`
                            : days === 0
                            ? 'Hoy'
                            : `En ${days} día${days !== 1 ? 's' : ''}`}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={{ gap: theme.spacing.sm }}>
                    <TouchableOpacity
                      onPress={() => handleDelete(item.id)}
                      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash" size={18} color={theme.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: theme.spacing.xxl }}>
            <Ionicons
              name="checkmark-done-circle"
              size={64}
              color={theme.success}
              style={{ marginBottom: theme.spacing.lg, opacity: 0.3 }}
            />
            <Text style={{ color: theme.textSecondary, fontSize: 16 }}>
              No hay tareas
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: (insets.bottom || 0) + theme.spacing.xxl + 60 }}
      />

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
                {form.id ? 'Editar Tarea' : 'Nueva Tarea'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <Input
              label="Título"
              placeholder="Ingresa el título"
              value={form.titulo}
              onChangeText={(t) => setForm({ ...form, titulo: t })}
              icon="pencil"
              style={{ marginBottom: theme.spacing.lg }}
            />

            <Input
              label="Descripción"
              placeholder="Detalles adicionales"
              value={form.descripcion}
              onChangeText={(t) => setForm({ ...form, descripcion: t })}
              icon="document-text"
              multiline
              numberOfLines={3}
              style={{ marginBottom: theme.spacing.lg }}
            />

            <View style={{ marginBottom: theme.spacing.lg }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.text,
                  marginBottom: theme.spacing.sm,
                }}
              >
                Fecha límite
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.md,
                  borderRadius: theme.radius.lg,
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                }}
              >
                <Ionicons name="calendar" size={20} color={theme.primary} />
                <Text style={{ color: form.fecha ? theme.text : theme.textTertiary, fontSize: 15 }}>
                  {form.fecha ? form.fecha : 'Selecciona fecha'}
                </Text>
              </TouchableOpacity>
            </View>

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
                        form.cursoId === item.id
                          ? theme.lightBlue
                          : theme.bg,
                      borderWidth: form.cursoId === item.id ? 2 : 0,
                      borderColor: theme.primary,
                    }}
                  >
                    <Text
                      style={{
                        color: form.cursoId === item.id ? theme.primary : theme.text,
                        fontWeight: form.cursoId === item.id ? '600' : '500',
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
