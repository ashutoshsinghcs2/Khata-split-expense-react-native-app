import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { getGroupMembers, getMeMember, recordSettlement } from '../db/database';
import Screen from '../components/Screen';

const METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Other'];

export default function SettlePayment({ route, navigation }) {
  const { groupId } = route.params;
  const [members, setMembers] = useState([]);
  const [otherMember, setOtherMember] = useState(null);
  const [direction, setDirection] = useState('pay'); // 'pay' = you pay them, 'receive' = they pay you
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');

  useEffect(() => {
    const all = getGroupMembers(groupId);
    const others = all.filter(m => !m.is_me);
    setMembers(others);
    if (others.length) setOtherMember(others[0].id);
  }, []);

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return Alert.alert('Invalid amount');
    if (!otherMember) return Alert.alert('Select a person');

    const me = getMeMember(groupId);
    if (direction === 'pay') {
      recordSettlement(groupId, me.id, otherMember, amt, method);
    } else {
      recordSettlement(groupId, otherMember, me.id, amt, method);
    }
    navigation.goBack();
  };

  if (members.length === 0) return <View style={styles.container}><Text>No other members in this group.</Text></View>;

  return (
    <Screen style={styles.container}>
      <Text style={styles.label}>Who</Text>
      <View style={styles.chipRow}>
        {members.map(m => (
          <TouchableOpacity key={m.id} style={[styles.chip, otherMember === m.id && styles.chipSelected]} onPress={() => setOtherMember(m.id)}>
            <Text style={otherMember === m.id ? styles.chipTextSelected : styles.chipText}>{m.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Direction</Text>
      <View style={styles.chipRow}>
        <TouchableOpacity style={[styles.chip, direction === 'pay' && styles.chipSelected]} onPress={() => setDirection('pay')}>
          <Text style={direction === 'pay' ? styles.chipTextSelected : styles.chipText}>You are paying them</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.chip, direction === 'receive' && styles.chipSelected]} onPress={() => setDirection('receive')}>
          <Text style={direction === 'receive' ? styles.chipTextSelected : styles.chipText}>They are paying you</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Amount</Text>
      <TextInput style={styles.input} keyboardType="numeric" placeholder="e.g. 500" value={amount} onChangeText={setAmount} />

      <Text style={styles.label}>Payment method</Text>
      <View style={styles.chipRow}>
        {METHODS.map(m => (
          <TouchableOpacity key={m} style={[styles.chip, method === m && styles.chipSelected]} onPress={() => setMethod(m)}>
            <Text style={method === m ? styles.chipTextSelected : styles.chipText}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="Mark as Paid" onPress={handleSave} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 14, color: '#555', marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#ccc' },
  chipSelected: { backgroundColor: '#2980b9', borderColor: '#2980b9' },
  chipText: { color: '#333' },
  chipTextSelected: { color: '#fff' },
});