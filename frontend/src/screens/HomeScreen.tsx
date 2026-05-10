import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import { theme } from '../styles/theme';
import Card from '../components/Card';
import QuickAction from '../components/QuickAction';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import * as tareasService from '../services/tareasService';
import * as cursosService from '../services/cursosService';
import * as courseState from '../services/courseStateService';
import { showMessage } from '../utils/notify';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation: any = useNavigation();
  const insets = useSafeAreaInsets();
  const [nextTask, setNextTask] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // load user's cursos and their tareas to compute counts and next task
        const cursos = await cursosService.getByUsuario(user?.id || 0);
        const cursoIds = Array.isArray(cursos) ? cursos.map((c: any) => c.id) : [];
        const states = await courseState.getStates();
        const activeCursoIds = cursoIds.filter((id: any) => (states[String(id)] ? states[String(id)].active : true));

        const tareasLists = await Promise.all(activeCursoIds.map((cid: number) => tareasService.getByCurso(cid)));
        const tareasAll = tareasLists.flat().filter(Boolean);

        // compute counts
        const pending = tareasAll.filter((x: any) => x.estado !== 'completada');
        const done = tareasAll.filter((x: any) => x.estado === 'completada');
        setPendingCount(pending.length);
        setDoneCount(done.length);

        // find next upcoming by fechaLimite
        // Normalize to date-only (ignore time) so a task due today counts
        // and exclude tasks already completed
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const upcoming = tareasAll
          .map((t: any) => {
            const rawDate = new Date(t.fechaLimite || t.fecha || t.fecha_limite || null);
            if (!(rawDate instanceof Date) || isNaN(rawDate.getTime())) return null;
            const dateOnly = new Date(rawDate.getFullYear(), rawDate.getMonth(), rawDate.getDate());
            return { raw: t, date: rawDate, dateOnly };
          })
          .filter((x: any) => x && x.dateOnly >= todayStart && x.raw?.estado !== 'completada')
          .sort((a: any, b: any) => a.dateOnly.getTime() - b.dateOnly.getTime());

        setNextTask(upcoming.length ? upcoming[0].raw : null);
      } catch (e: any) {
        console.warn('Error fetching tareas', e);
        showMessage('Error', 'No se pudieron cargar las tareas');
      }
    };

    // initial load and reload whenever screen gains focus
    loadDashboard();
    const unsubscribe = navigation.addListener('focus', loadDashboard);
    return unsubscribe;
  }, [navigation, user]);

  return (
    <View style={{ flex: 1 }}>
      <Header nombre={user?.nombre || 'Usuario'} />
      <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={{ padding: 16, paddingBottom: (insets.bottom || 0) + 16 }}>
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 8 }}>Próxima tarea</Text>
          {nextTask ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontWeight: '600' }}>{nextTask.titulo || 'Sin título'}</Text>
                <Text style={{ color: '#6b7280', marginTop: 6 }}>{nextTask.curso?.nombre || 'Sin materia'}</Text>
              </View>
              <Text style={{ color: '#6b7280' }}>{(nextTask.fechaLimite || nextTask.fecha || '').toString().split('T')[0] || ''}</Text>
            </View>
          ) : (
            <Text style={{ color: '#6b7280' }}>No hay tareas próximas</Text>
          )}
        </Card>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <QuickAction icon={<Ionicons name="add" size={20} color="#3b82f6" />} label="Agregar tarea" onPress={() => navigation.navigate('Tareas', { openCreate: true })} />
          <QuickAction icon={<Ionicons name="book" size={20} color="#3b82f6" />} label="Ver materias" onPress={() => navigation.navigate('Materias')} />
          <QuickAction icon={<Ionicons name="calendar" size={20} color="#3b82f6" />} label="Ver horario" onPress={() => navigation.navigate('Horario')} />
        </View>

        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontWeight: '700' }}>Pendientes: <Text style={{ color: '#3b82f6' }}>{pendingCount}</Text></Text>
            <Text style={{ color: '#10b981' }}>Hechas: <Text style={{ color: '#10b981' }}>{doneCount}</Text></Text>
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
