import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import Card from '../components/Card';
import QuickAction from '../components/QuickAction';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import * as tareasService from '../services/tareasService';
import { showMessage } from '../utils/notify';

export default function HomeScreen() {
  const { user } = useAuth();
  const [nextTask, setNextTask] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const t = await tareasService.getAll();
        if (t && Array.isArray(t)) {
          const pending = t.filter((x: any) => x.estado !== 'completada');
          setPendingCount(pending.length);
          setNextTask(pending.length ? pending[0] : null);
        }
      } catch (e: any) {
        console.warn('Error fetching tareas', e);
        showMessage('Error', 'No se pudieron cargar las tareas');
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Header nombre={user?.nombre || 'Usuario'} />
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 8 }}>Próxima tarea</Text>
          {nextTask ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontWeight: '600' }}>{nextTask.titulo || 'Sin título'}</Text>
                <Text style={{ color: '#6b7280', marginTop: 6 }}>{nextTask.curso?.nombre || 'Sin materia'}</Text>
              </View>
              <Text style={{ color: '#6b7280' }}>{nextTask.fecha || ''}</Text>
            </View>
          ) : (
            <Text style={{ color: '#6b7280' }}>No hay tareas próximas</Text>
          )}
        </Card>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <QuickAction icon={<Ionicons name="add" size={20} color="#3b82f6" />} label="Agregar tarea" onPress={() => {}} />
          <QuickAction icon={<Ionicons name="book" size={20} color="#3b82f6" />} label="Ver materias" onPress={() => {}} />
          <QuickAction icon={<Ionicons name="calendar" size={20} color="#3b82f6" />} label="Ver horario" onPress={() => {}} />
        </View>

        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontWeight: '700' }}>Pendientes: <Text style={{ color: '#3b82f6' }}>{pendingCount}</Text></Text>
            <Text style={{ color: '#10b981' }}>Hechas: 1</Text>
          </View>
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#fffbeb', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="bulb" size={22} color="#f59e0b" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700' }}>Un paso a la vez</Text>
              <Text style={{ color: '#6b7280' }}>también es progreso.</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f6fb' },
});
