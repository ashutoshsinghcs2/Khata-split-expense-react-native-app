import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { addGroupMember } from '../db/database';
import Screen from '../components/Screen';

export default function AddGroupMember({ route, navigation }) {
  const { groupId } = route.params;
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return Alert.alert('Name required', 'Please enter a name.');
    addGroupMember(groupId, name.trim());
    navigation.goBack();
  };

  return (
    <Screen style={styles.container}>
      <Text style={styles.label}>Member Name</Text>
      <TextInput style={styles.input} placeholder="e.g. Rahul" value={name} onChangeText={setName} />
      <View style={{ marginTop: 20 }}>
        <Button title="Save" onPress={handleSave} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 14, color: '#555', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
});