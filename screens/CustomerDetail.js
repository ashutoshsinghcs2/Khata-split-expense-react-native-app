import {
  View, Text, FlatList, TouchableOpacity, Modal,
  TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { addTransaction, getTransactions, getBalance } from '../db/database';

export default function CustomerDetail({ route }) {
  const { customerId, name } = route.params;

  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [txnType, setTxnType] = useState('gave'); // 'gave' or 'got'
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const loadData = useCallback(() => {
    setTransactions(getTransactions(customerId));
    setBalance(getBalance(customerId));
  }, [customerId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const openModal = (type) => {
    setTxnType(type);
    setAmount('');
    setNote('');
    setModalVisible(true);
  };

  const saveTransaction = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    addTransaction(customerId, txnType, amt, note.trim());
    setModalVisible(false);
    loadData();
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Balance summary */}
      <View style={styles.balanceBox}>
        <Text style={styles.customerName}>{name}</Text>
        <Text style={{ color: balance >= 0 ? 'green' : 'red', fontSize: 20, fontWeight: 'bold' }}>
          ₹{Math.abs(balance)} {balance >= 0 ? 'will get' : 'will give'}
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#e74c3c' }]} onPress={() => openModal('gave')}>
          <Text style={styles.actionText}>You Gave ₹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#27ae60' }]} onPress={() => openModal('got')}>
          <Text style={styles.actionText}>You Got ₹</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction history */}
      <FlatList
        data={transactions}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.txnRow}>
            <View>
              <Text style={{ fontWeight: '600' }}>
                {item.type === 'gave' ? 'You gave' : 'You got'} ₹{item.amount}
              </Text>
              {item.note ? <Text style={{ color: '#777' }}>{item.note}</Text> : null}
            </View>
            <Text style={{ color: '#999', fontSize: 12 }}>{item.date}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30, color: '#999' }}>No transactions yet</Text>}
      />

      {/* Add transaction modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
         <KeyboardAvoidingView style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
              {txnType === 'gave' ? 'You Gave (udhar diya)' : 'You Got (payment received)'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <TextInput
              style={styles.input}
              placeholder="Note (optional)"
              value={note}
              onChangeText={setNote}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
              <Button title="Cancel" color="#999" onPress={() => setModalVisible(false)} />
              <Button title="Save" onPress={saveTransaction} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceBox: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  customerName: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  actionRow: { flexDirection: 'row', padding: 12, gap: 12 },
  actionBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold' },
  txnRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f0f0f0',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#fff', borderRadius: 10, padding: 20 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, fontSize: 16, marginBottom: 10,
  },
});