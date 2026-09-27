import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { createGroup } from '../db/database';
import Screen from '../components/Screen';

export default function CreateGroup({ navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('INR');

  const handleCreate = () => {
    if (!name.trim()) return Alert.alert('Name required', 'Please enter a group name.');
    createGroup(name.trim(), description.trim(), currency.trim() || 'INR');
    navigation.goBack();
  };

  return (
    <Screen style={styles.container}>
      <Text style={styles.label}>Group Name</Text>
      <TextInput style={styles.input} placeholder="e.g. Goa Trip" value={name} onChangeText={setName} />

      <Text style={styles.label}>Group Description</Text>
      <TextInput style={styles.input} placeholder="e.g. Trip with friends" value={description} onChangeText={setDescription} />

      <Text style={styles.label}>Currency</Text>
      <TextInput style={styles.input} placeholder="INR" value={currency} onChangeText={setCurrency} />

      <View style={{ marginTop: 20 }}>
        <Button title="Create Group" onPress={handleCreate} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 14, color: '#555', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
});