Usage

1. Import and place `ProfilePhoto` where you render the user's avatar (e.g., profile screen, header):

```tsx
import ProfilePhoto from '../components/ProfilePhoto'

<ProfilePhoto size={110} />
```

2. The component uses `useProfilePhoto` hook which persists image URIs to AsyncStorage under `@profile_photo_uri` and copies files into the app document directory to ensure persistence.

3. Required dependencies:

- expo-image-picker
- expo-file-system
- @react-native-async-storage/async-storage

Install with:

```bash
expo install expo-image-picker expo-file-system @react-native-async-storage/async-storage
```

Notes
- This implementation stores images only locally and never uploads to any backend.
- It does not change navigation, authentication, or backend logic.
