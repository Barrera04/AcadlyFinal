import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import { theme } from '../styles/theme';
import Card from '../components/Card';
import QuickAction from '../components/QuickAction';
import Badge from '../components/Badge';
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
        const cursos = await cursosService.getByUsuario(user?.id || 0);
        const cursoIds = Array.isArray(cursos) ? cursos.map((c: any) => c.id) : [];
        const states = await courseState.getStates();
        const activeCursoIds = cursoIds.filter((id: any) => (states[String(id)] ? states[String(id)].active : true));

        const tareasLists = await Promise.all(activeCursoIds.map((cid: number) => tareasService.getByCurso(cid)));
        const tareasAll = tareasLists.flat().filter(Boolean);

        const pending = tareasAll.filter((x: any) => x.estado !== 'completada');
        const done = tareasAll.filter((x: any) => x.estado === 'completada');
        setPendingCount(pending.length);
        setDoneCount(done.length);

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

    loadDashboard();
    const unsubscribe = navigation.addListener('focus', loadDashboard);
    return unsubscribe;
  }, [navigation, user]);

  const progressPercent = pendingCount + doneCount > 0 ? Math.round((doneCount / (pendingCount + doneCount)) * 100) : 0;
  const daysUntilDeadline = nextTask
    ? Math.ceil((new Date(nextTask.fechaLimite || nextTask.fecha).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <View style={{ flex: 1 }}>
      <Header nombre={user?.nombre || 'Usuario'} />
      <ScrollView
        style={[styles.container]}
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: (insets.bottom || 0) + theme.spacing.lg,
        }}
        scrollIndicatorInsets={{ right: 1 }}
      >
        {/* Next Task Section */}
        {nextTask ? (
          <Card variant="elevated" padding="lg" style={{ marginBottom: theme.spacing.xl }}>
            <View style={{ marginBottom: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: theme.radius.lg,
                    backgroundColor: theme.lightBlue,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                </View>
                <View>
                  <Text style={{ fontSize: 13, color: theme.textSecondary, fontWeight: '600' }}>PRÓXIMA TAREA</Text>
                </View>
              </View>

              <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: theme.spacing.sm }}>
                {nextTask.titulo || 'Sin título'}
              </Text>

              <Text style={{ fontSize: 14, color: theme.textSecondary, marginBottom: theme.spacing.md }}>
                {nextTask.curso?.nombre || 'Sin materia'}
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: theme.textTertiary }}>
                  {(nextTask.fechaLimite || nextTask.fecha || '').toString().split('T')[0] || ''}
                </Text>
                {daysUntilDeadline !== null && (
                  <Badge
                    label={daysUntilDeadline <= 1 ? 'Hoy' : daysUntilDeadline <= 3 ? `En ${daysUntilDeadline} días` : `En ${daysUntilDeadline} días`}
                    variant={daysUntilDeadline <= 1 ? 'danger' : daysUntilDeadline <= 3 ? 'warning' : 'info'}
                    size="sm"
                  />
                )}
              </View>
            </View>
          </Card>
        ) : (
          <Card variant="outlined" padding="lg" style={{ marginBottom: theme.spacing.xl }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
              <Ionicons name="checkmark-done" size={28} color={theme.success} />
              <View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.success }}>¡Excelente!</Text>
                <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: theme.spacing.sm }}>No hay tareas próximas</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Stats Section */}
        <View style={{ flexDirection: 'row', gap: theme.spacing.lg, marginBottom: theme.spacing.xl }}>
          <Card variant="default" padding="lg" style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: theme.textSecondary, fontWeight: '600', marginBottom: theme.spacing.md }}>PENDIENTES</Text>
            <Text style={{ fontSize: 32, fontWeight: '700', color: theme.primary, marginBottom: theme.spacing.sm }}>
              {pendingCount}
            </Text>
            <View style={{ width: '100%', height: 4, backgroundColor: theme.bg, borderRadius: theme.radius.full, overflow: 'hidden' }}>
              <View
                style={{
                  width: `${Math.min(pendingCount * 25, 100)}%`,
                  height: '100%',
                  backgroundColor: theme.primary,
                  borderRadius: theme.radius.full,
                }}
              />
            </View>
          </Card>

          <Card variant="default" padding="lg" style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: theme.textSecondary, fontWeight: '600', marginBottom: theme.spacing.md }}>COMPLETADAS</Text>
            <Text style={{ fontSize: 32, fontWeight: '700', color: theme.success, marginBottom: theme.spacing.sm }}>
              {doneCount}
            </Text>
            <View style={{ width: '100%', height: 4, backgroundColor: theme.bg, borderRadius: theme.radius.full, overflow: 'hidden' }}>
              <View
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  backgroundColor: theme.success,
                  borderRadius: theme.radius.full,
                }}
              />
            </View>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <Text style={{ fontSize: 13, color: theme.textSecondary, fontWeight: '600', marginBottom: theme.spacing.lg }}>ACCESOS RÁPIDOS</Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <QuickAction
              icon={<Ionicons name="add-circle" size={28} color={theme.primary} />}
              label="Nueva tarea"
              onPress={() => navigation.navigate('Tareas', { openCreate: true })}
            />
            <QuickAction
              icon={<Ionicons name="book" size={28} color={theme.primary} />}
              label="Materias"
              onPress={() => navigation.navigate('Materias')}
            />
            <QuickAction
              icon={<Ionicons name="calendar" size={28} color={theme.primary} />}
              label="Horario"
              onPress={() => navigation.navigate('Horario')}
            />
          </View>
        </View>

        {/* Motivational Card */}
        <Card variant="elevated" padding="lg" style={{ backgroundColor: theme.accentLight, borderLeftWidth: 4, borderLeftColor: theme.accent }}>
          <View style={{ flexDirection: 'row', gap: theme.spacing.lg, alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 32 }}>✨</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 16, color: theme.text, marginBottom: theme.spacing.sm }}>Mantén el ritmo</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 20 }}>
                Cada tarea completada es un paso hacia tus metas. ¡Tú puedes!
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
});
