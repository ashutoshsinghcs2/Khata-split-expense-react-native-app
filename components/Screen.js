import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Use this instead of <View> on any screen that has:
// - a keyboard/input (forms), and/or
// - buttons pinned near the bottom of the screen
export default function Screen({ children, style }) {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={[{ flex: 1 }, style]}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}