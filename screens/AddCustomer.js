import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { addCustomer } from '../db/database';
import Screen from '../components/Screen';

export default function AddCustomer({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a customer name.');
      return;
    }
    addCustomer(name.trim(), phone.trim());
    navigation.goBack();
  };

  return (
      <Screen style={styles.container}> 
      <Text style={styles.label}>Customer Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Ramesh Kirana Store"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Phone (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 9876543210"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Save Customer" onPress={handleSave} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 14, color: '#555', marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});