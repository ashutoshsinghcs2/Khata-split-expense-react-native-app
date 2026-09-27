import { View, Text, TextInput, Button, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { getGroupMembers, addExpense } from '../db/database';
import Screen from '../components/Screen';

const SPLIT_TYPES = ['Equal', 'Exact Amount', 'Percentage', 'Shares'];

export default function AddExpense({ route, navigation }) {
  const { groupId } = route.params;
  const [members, setMembers] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(null);
  const [selected, setSelected] = useState([]);
  const [splitType, setSplitType] = useState('Equal');
  const [customValues, setCustomValues] = useState({}); // memberId -> string input

  useEffect(() => {
    const list = getGroupMembers(groupId);
    setMembers(list);
    if (list.length) {
      setPaidBy(list[0].id);
      setSelected(list.map(m => m.id));
    }
  }, []);

  const toggleSelected = (id) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const setCustomValue = (id, value) => {
    setCustomValues(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return Alert.alert('Invalid amount', 'Enter a valid amount.');
    if (!paidBy) return Alert.alert('Select who paid');
    if (selected.length === 0) return Alert.alert('Select participants', 'Choose at least one person.');

    let shares = {};

    if (splitType === 'Equal') {
      const per = amt / selected.length;
      selected.forEach(id => { shares[id] = per; });
    }

    if (splitType === 'Exact Amount') {
      let sum = 0;
      selected.forEach(id => { const v = parseFloat(customValues[id]) || 0; shares[id] = v; sum += v; });
      if (Math.abs(sum - amt) > 0.5) {
        return Alert.alert('Amounts don\'t match', `Exact amounts add up to ₹${sum.toFixed(2)}, but total is ₹${amt}.`);
      }
    }

    if (splitType === 'Percentage') {
      let sumPct = 0;
      selected.forEach(id => { sumPct += parseFloat(customValues[id]) || 0; });
      if (Math.abs(sumPct - 100) > 0.5) {
        return Alert.alert('Percentages don\'t add up', `They add up to ${sumPct}%, should be 100%.`);
      }
      selected.forEach(id => { shares[id] = amt * ((parseFloat(customValues[id]) || 0) / 100); });
    }

    if (splitType === 'Shares') {
      let totalUnits = 0;
      selected.forEach(id => { totalUnits += parseFloat(customValues[id]) || 0; });
      if (totalUnits <= 0) return Alert.alert('Invalid shares', 'Enter share units greater than 0.');
      selected.forEach(id => { shares[id] = amt * ((parseFloat(customValues[id]) || 0) / totalUnits); });
    }

    addExpense(groupId, description.trim(), amt, paidBy, shares, splitType);
    navigation.goBack();
  };

  if (members.length === 0) return <View style={styles.container}><Text>Add members first.</Text></View>;

  return (
    <Screen>
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Description</Text>
      <TextInput style={styles.input} placeholder="e.g. Dinner" value={description} onChangeText={setDescription} />

      <Text style={styles.label}>Amount</Text>
      <TextInput style={styles.input} placeholder="e.g. 2400" keyboardType="numeric" value={amount} onChangeText={setAmount} />

      <Text style={styles.label}>Paid by</Text>
      <View style={styles.chipRow}>
        {members.map(m => (
          <TouchableOpacity key={m.id} style={[styles.chip, paidBy === m.id && styles.chipSelected]} onPress={() => setPaidBy(m.id)}>
            <Text style={paidBy === m.id ? styles.chipTextSelected : styles.chipText}>{m.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Split between</Text>
      <View style={styles.chipRow}>
        {members.map(m => (
          <TouchableOpacity key={m.id} style={[styles.chip, selected.includes(m.id) && styles.chipSelected]} onPress={() => toggleSelected(m.id)}>
            <Text style={selected.includes(m.id) ? styles.chipTextSelected : styles.chipText}>{m.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Split type</Text>
      <View style={styles.chipRow}>
        {SPLIT_TYPES.map(type => (
          <TouchableOpacity key={type} style={[styles.chip, splitType === type && styles.chipSelectedAlt]} onPress={() => setSplitType(type)}>
            <Text style={splitType === type ? styles.chipTextSelected : styles.chipText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {splitType !== 'Equal' && (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.hint}>
            {splitType === 'Exact Amount' && 'Enter exact ₹ amount for each person (must add up to the total).'}
            {splitType === 'Percentage' && 'Enter % for each person (must add up to 100).'}
            {splitType === 'Shares' && 'Enter share units for each person (e.g. 2, 1, 1).'}
          </Text>
          {members.filter(m => selected.includes(m.id)).map(m => (
            <View key={m.id} style={styles.customRow}>
              <Text style={{ flex: 1 }}>{m.name}</Text>
              <TextInput
                style={styles.smallInput}
                keyboardType="numeric"
                placeholder={splitType === 'Percentage' ? '%' : splitType === 'Shares' ? 'units' : '₹'}
                value={customValues[m.id] || ''}
                onChangeText={(v) => setCustomValue(m.id, v)}
              />
            </View>
          ))}
        </View>
      )}

      <View style={{ marginTop: 20, marginBottom: 40 }}>
        <Button title="Save Expense" onPress={handleSave} />
      </View>
    </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 14, color: '#555', marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#ccc' },
  chipSelected: { backgroundColor: '#8e44ad', borderColor: '#8e44ad' },
  chipSelectedAlt: { backgroundColor: '#2980b9', borderColor: '#2980b9' },
  chipText: { color: '#333' },
  chipTextSelected: { color: '#fff' },
  hint: { color: '#777', fontSize: 12, marginBottom: 8 },
  customRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  smallInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, width: 90, textAlign: 'right' },
});