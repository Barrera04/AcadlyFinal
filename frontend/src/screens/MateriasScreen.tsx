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
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../styles/theme';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import FloatingButton from '../components/FloatingButton';
import * as cursosService from '../services/cursosService';
import * as courseState from '../services/courseStateService';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { showMessage } from '../utils/notify';

const colorPalette = [
  '#60a5fa', // blue
  '#f87171', // red
  '#34d399', // green
  '#fbbf24', // amber
  '#a78bfa', // purple
  '#f472b6', // pink
  '#fb923c', // orange
  '#a3e635', // lime
];

export default function MateriasScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    id: null as any,
    nombre: '',
    color: colorPalette[0],
  });
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
    setForm({ id: null, nombre: '', color: colorPalette[0] });
    setModalVisible(true);
  };

  const openEdit = (item: any) => {
    setForm({
      id: item.id,
      nombre: item.nombre || '',
      color: item.color || colorPalette[0],
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.nombre)
      return showMessage('Error', 'Nombre es requerido');
    setLoading(true);
    try {
      if (form.id) {
        await cursosService.update(form.id, {
          nombre: form.nombre,
          color: form.color,
        });
        showMessage('Éxito', 'Materia actualizada');
      } else {
        if (!user)
          return showMessage('Error', 'No autorizado');
        await cursosService.create(user.id, {
          nombre: form.nombre,
          color: form.color,
        });
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
            Materias
          </Text>
          <Text style={{ fontSize: 14, color: theme.textSecondary }}>
            {cursos.length} materias disponibles
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
          data={cursos}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={({ item }) => {
            const isActive = activeMap[String(item.id)] !== false;

            return (
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
                    borderLeftColor: item.color || colorPalette[0],
                    opacity: isActive ? 1 : 0.6,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: theme.spacing.lg,
                    }}
                  >
                    {/* Icon */}
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: theme.radius.lg,
                        backgroundColor: item.color || colorPalette[0],
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: 0.1,
                      }}
                    />

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
                        {item.nombre}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: theme.spacing.md,
                        }}
                      >
                        <View
                          style={{
                            paddingHorizontal: theme.spacing.md,
                            paddingVertical: theme.spacing.sm,
                            backgroundColor: isActive ? item.color || colorPalette[0] : theme.muted,
                            borderRadius: theme.radius.full,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '600',
                              color: '#fff',
                            }}
                          >
                            {isActive ? 'Activa' : 'Oculta'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Actions */}
                    <View style={{ gap: theme.spacing.sm }}>
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
                      <TouchableOpacity
                        onPress={async () => {
                          const newVal =
                            activeMap[String(item.id)] === false ? true : false;
                          await courseState.setActive(item.id, !newVal);
                          setActiveMap({
                            ...activeMap,
                            [String(item.id)]: !newVal,
                          });
                        }}
                        hitSlop={{
                          top: 10,
                          bottom: 10,
                          left: 10,
                          right: 10,
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={
                            activeMap[String(item.id)] === false
                              ? 'eye-off'
                              : 'eye'
                          }
                          size={18}
                          color={theme.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              </View>
            );
          }}
          ListEmptyComponent={
            <View
              style={{
                alignItems: 'center',
                marginTop: theme.spacing.xxl,
              }}
            >
              <Ionicons
                name="book"
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
                No hay materias
              </Text>
              <Text
                style={{
                  color: theme.textTertiary,
                  fontSize: 13,
                  marginTop: theme.spacing.sm,
                }}
              >
                Crea tu primera materia
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
                {form.id ? 'Editar Materia' : 'Nueva Materia'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <Input
              label="Nombre"
              placeholder="Ej: Matemáticas"
              value={form.nombre}
              onChangeText={(t) => setForm({ ...form, nombre: t })}
              icon="book"
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
                Color
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: theme.spacing.md,
                }}
              >
                {colorPalette.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setForm({ ...form, color: c })}
                    style={{
                      width: 56,
                      height: 56,
                      backgroundColor: c,
                      borderRadius: theme.radius.lg,
                      borderWidth: form.color === c ? 3 : 0,
                      borderColor: theme.text,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {form.color === c && (
                      <Ionicons name="checkmark" size={24} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {form.id && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.lg,
                  borderRadius: theme.radius.lg,
                  backgroundColor: theme.bg,
                  marginBottom: theme.spacing.lg,
                }}
              >
                <TouchableOpacity
                  onPress={async () => {
                    const newVal =
                      activeMap[String(form.id)] === false
                        ? true
                        : false;
                    await courseState.setActive(form.id, !newVal);
                    setActiveMap({
                      ...activeMap,
                      [String(form.id)]: !newVal,
                    });
                  }}
                  hitSlop={{
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      activeMap[String(form.id)] === false ? 'eye-off' : 'eye'
                    }
                    size={20}
                    color={theme.primary}
                  />
                </TouchableOpacity>
                <Text style={{ color: theme.text, fontWeight: '500' }}>
                  {activeMap[String(form.id)] === false ? 'Oculta' : 'Visible'}
                </Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              {form.id && (
                <Button
                  label="Eliminar"
                  variant="danger"
                  onPress={() => {
                    Alert.alert(
                      'Confirmar',
                      '¿Eliminar materia?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Eliminar',
                          style: 'destructive',
                          onPress: async () => {
                            setLoading(true);
                            const ok = await cursosService.remove(form.id);
                            setLoading(false);
                            if (ok) {
                              showMessage('Éxito', 'Materia eliminada');
                              setModalVisible(false);
                              load();
                            } else
                              showMessage('Error', 'No se pudo eliminar');
                          },
                        },
                      ],
                      { cancelable: false }
                    );
                  }}
                  style={{ flex: 1 }}
                />
              )}
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
