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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Badge from '../components/Badge';
import * as recordatoriosService from '../services/recordatoriosService';
import * as tareasService from '../services/tareasService';
import * as cursosService from '../services/cursosService';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { showMessage } from '../utils/notify';
import { theme } from '../styles/theme';
import FloatingButton from '../components/FloatingButton';
import { Ionicons } from '@expo/vector-icons';

export default function RecordatoriosScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [recordatorios, setRecordatorios] = useState<any[]>([]);
  const [tareas, setTareas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    id: null as any,
    mensaje: '',
    fecha: '',
    tareaId: null as any,
  });

  const load = async () => {
    setLoading(true);
    try {
      if (!user) {
        setRecordatorios([]);
        setTareas([]);
        setLoading(false);
        return;
      }

      const c = await cursosService.getByUsuario(user.id);
      const cursosList = Array.isArray(c) ? c : [];
      const tareasLists = await Promise.all(
        cursosList.map((cu: any) => tareasService.getByCurso(cu.id))
      );
      const tareasAll = tareasLists.flat().filter(Boolean);
      setTareas(tareasAll);

      const recordatoriosLists = await Promise.all(
        tareasAll.map((t: any) => recordatoriosService.getByTarea(t.id))
      );
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
    setForm({
      id: null,
      mensaje: '',
      fecha: '',
      tareaId: tareas[0]?.id || null,
    });
    setModalVisible(true);
  };

  const openEdit = (item: any) => {
    setForm({
      id: item.id,
      mensaje: item.mensaje || '',
      fecha: item.fecha || '',
      tareaId: item.tarea?.id || null,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.mensaje || !form.tareaId)
      return showMessage('Error', 'Mensaje y tarea son requeridos');
    setLoading(true);
    try {
      if (form.id) {
        await recordatoriosService.update(form.id, {
          mensaje: form.mensaje,
          fecha: form.fecha,
        });
        showMessage('Éxito', 'Recordatorio actualizado');
      } else {
        await recordatoriosService.create(form.tareaId, {
          mensaje: form.mensaje,
          fecha: form.fecha,
        });
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
      await recordatoriosService.update(item.id, {
        ...item,
        enviado: !item.enviado,
      });
      await load();
    } catch (e) {
      showMessage('Error', 'No se pudo actualizar');
    }
    setLoading(false);
  };

  const enviadosCount = recordatorios.filter((r) => r.enviado).length;

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
            Recordatorios
          </Text>
          <Text style={{ fontSize: 14, color: theme.textSecondary }}>
            {enviadosCount} de {recordatorios.length} enviados
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
        <FlatList
          data={recordatorios}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={({ item }) => (
            <View
              style={{
                paddingHorizontal: theme.spacing.lg,
                marginBottom: theme.spacing.md,
              }}
            >
              <Card
                variant="elevated"
                padding="lg"
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: item.enviado ? theme.success : theme.accent,
                  opacity: item.enviado ? 0.8 : 1,
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
                  {/* Checkbox */}
                  <TouchableOpacity
                    onPress={() => toggleEnviado(item)}
                    hitSlop={{
                      top: 10,
                      bottom: 10,
                      left: 10,
                      right: 10,
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: theme.radius.md,
                        backgroundColor: item.enviado
                          ? theme.success
                          : theme.border,
                        borderWidth: item.enviado ? 0 : 2,
                        borderColor: theme.accent,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 2,
                      }}
                    >
                      {item.enviado && (
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
                        textDecorationLine: item.enviado ? 'line-through' : 'none',
                        marginBottom: theme.spacing.sm,
                      }}
                    >
                      {item.mensaje}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: theme.spacing.md,
                        marginBottom: theme.spacing.sm,
                      }}
                    >
                      <Badge
                        label={item.tarea?.titulo || 'Sin tarea'}
                        variant="info"
                        size="sm"
                      />
                      {item.enviado && (
                        <Badge label="Enviado" variant="success" size="sm" />
                      )}
                      {!item.enviado && (
                        <Badge label="Pendiente" variant="warning" size="sm" />
                      )}
                    </View>

                    {item.fecha && (
                      <Text
                        style={{
                          fontSize: 13,
                          color: theme.textSecondary,
                        }}
                      >
                        {item.fecha}
                      </Text>
                    )}
                  </View>

                  {/* Actions */}
                  <TouchableOpacity
                    onPress={() => openEdit(item)}
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
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: theme.spacing.xxl }}>
              <Ionicons
                name="notifications"
                size={64}
                color={theme.textTertiary}
                style={{ marginBottom: theme.spacing.lg, opacity: 0.3 }}
              />
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 16,
                }}
              >
                No hay recordatorios
              </Text>
            </View>
          }
          contentContainerStyle={{
            paddingHorizontal: 0,
            paddingBottom: (insets.bottom || 0) + theme.spacing.xl + 60,
          }}
        />
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
                {form.id ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <Input
              label="Mensaje"
              placeholder="¿Qué quieres recordar?"
              value={form.mensaje}
              onChangeText={(t) => setForm({ ...form, mensaje: t })}
              icon="notifications"
              multiline
              numberOfLines={2}
              style={{ marginBottom: theme.spacing.lg }}
            />

            <Input
              label="Fecha (opcional)"
              placeholder="Ej: 2024-12-25"
              value={form.fecha}
              onChangeText={(t) => setForm({ ...form, fecha: t })}
              icon="calendar"
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
                Tarea
              </Text>
              <FlatList
                data={tareas}
                keyExtractor={(i: any) => String(i.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setForm({ ...form, tareaId: item.id })}
                    style={{
                      paddingHorizontal: theme.spacing.lg,
                      paddingVertical: theme.spacing.md,
                      marginBottom: theme.spacing.sm,
                      borderRadius: theme.radius.lg,
                      backgroundColor:
                        form.tareaId === item.id ? theme.lightBlue : theme.bg,
                      borderWidth: form.tareaId === item.id ? 2 : 0,
                      borderColor: theme.primary,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          form.tareaId === item.id ? theme.primary : theme.text,
                        fontWeight:
                          form.tareaId === item.id ? '600' : '500',
                      }}
                    >
                      {item.titulo}
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
