import { Alert, Platform, ToastAndroid } from 'react-native';

export function showMessage(title: string, message: string) {
  if (Platform.OS === 'android') {
    // small toast for Android
    ToastAndroid.show(`${title}: ${message}`, ToastAndroid.LONG);
  } else {
    Alert.alert(title, message);
  }
}
