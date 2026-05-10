import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'cursoStates';

export async function getStates(): Promise<Record<string, { active: boolean }>> {
  try {
    const txt = await AsyncStorage.getItem(KEY);
    return txt ? JSON.parse(txt) : {};
  } catch (e) {
    return {};
  }
}

export async function isActive(id: number): Promise<boolean> {
  const s = await getStates();
  return s[String(id)] ? !!s[String(id)].active : true;
}

export async function toggleActive(id: number): Promise<boolean> {
  const s = await getStates();
  const key = String(id);
  const current = s[key]?.active ?? true;
  s[key] = { active: !current };
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(s));
  } catch (e) {}
  return s[key].active;
}

export async function setActive(id: number, value: boolean) {
  const s = await getStates();
  s[String(id)] = { active: !!value };
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(s));
  } catch (e) {}
}

export default { getStates, isActive, toggleActive, setActive };