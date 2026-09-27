import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { hashPassword } from '../utils/hash';
import { loginUser } from '../db/database';
import { useAuth } from '../context/AuthContext';
import Screen from '../components/Screen';

export default function Login({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) return Alert.alert('Missing fields', 'Enter email and password.');
    const hashed = await hashPassword(password);
    const user = loginUser(email.trim().toLowerCase(), hashed);
    if (!user) return Alert.alert('Login failed', 'Invalid email or password.');
    login(user.email); // this flips App.js into the main app automatically
  };

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

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
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Login" onPress={handleLogin} />
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 16 }}>
        <Text style={{ textAlign: 'center', color: '#2980b9' }}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 14, color: '#555', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
});