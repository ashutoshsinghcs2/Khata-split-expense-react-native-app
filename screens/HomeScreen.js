import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useState, useCallback } from 'react';
import { getCustomers, getBalance, getUdharTotals } from '../db/database';

export default function HomeScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [totals, setTotals] = useState({ toReceive: 0, toGive: 0, net: 0 });

  useFocusEffect(useCallback(() => {
    const list = getCustomers().map(c => ({ ...c, balance: getBalance(c.id) }));
    setCustomers(list);
    setTotals(getUdharTotals());
  }, []));

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text>You'll receive</Text>
          <Text style={{ color: '#27ae60', fontWeight: 'bold' }}>₹{totals.toReceive.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>You'll give</Text>
          <Text style={{ color: '#e74c3c', fontWeight: 'bold' }}>₹{totals.toGive.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, { borderTopWidth: 1, borderColor: '#ddd', paddingTop: 8, marginTop: 4 }]}>
          <Text style={{ fontWeight: 'bold' }}>Net balance</Text>
          <Text style={{ color: totals.net >= 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
            {totals.net >= 0 ? '+' : ''}₹{totals.net.toFixed(2)}
          </Text>
        </View>
      </View>

      <Button title="+ Add Customer" onPress={() => navigation.navigate('AddCustomer')} />
      <FlatList
        data={customers}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id, name: item.name })}
            style={{ padding: 14, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 16 }}>{item.name}</Text>
            <Text style={{ color: item.balance >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
              ₹{Math.abs(item.balance)} {item.balance >= 0 ? '(will get)' : '(will give)'}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  summaryBox: { backgroundColor: '#f7f7f7', borderRadius: 10, padding: 16, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
});