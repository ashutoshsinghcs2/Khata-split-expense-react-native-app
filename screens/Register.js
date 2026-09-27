import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { hashPassword } from '../utils/hash';
import { registerUser } from '../db/database';
import { useAuth } from '../context/AuthContext';
import Screen from '../components/Screen';

export default function Register({ navigation }) {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      return Alert.alert('Missing fields', 'Please fill in all fields.');
    }
    if (password.length < 4) {
      return Alert.alert('Weak password', 'Use at least 4 characters.');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Passwords don\'t match', 'Please re-enter your password.');
    }

    const hashed = await hashPassword(password);
    const result = registerUser(name.trim(), email.trim().toLowerCase(), hashed);

    if (!result.success) {
      return Alert.alert('Registration failed', result.error);
    }

    // Auto-login straight into the dashboard after successful registration
    login(email.trim().toLowerCase());
  };

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} placeholder="Your name" value={name} onChangeText={setName} />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} secureTextEntry placeholder="••••••••" value={password} onChangeText={setPassword} />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput style={styles.input} secureTextEntry placeholder="••••••••" value={confirmPassword} onChangeText={setConfirmPassword} />

      <View style={{ marginTop: 20 }}>
        <Button title="Register" onPress={handleRegister} />
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 16 }}>
        <Text style={{ textAlign: 'center', color: '#2980b9' }}>Already have an account? Login</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 14, color: '#555', marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
});