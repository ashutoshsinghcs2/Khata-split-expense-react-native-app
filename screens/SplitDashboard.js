import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getGroupsWithMyBalance, getDashboardTotals } from '../db/database';
import Screen from '../components/Screen';

export default function SplitDashboard({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [totals, setTotals] = useState({ youOwe: 0, youAreOwed: 0, net: 0 });

  useFocusEffect(useCallback(() => {
    setGroups(getGroupsWithMyBalance());
    setTotals(getDashboardTotals());
  }, []));

  return (
    <Screen style={{ flex: 1, padding: 16 }}>
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text>You owe</Text>
          <Text style={{ color: '#e74c3c', fontWeight: 'bold' }}>₹{totals.youOwe.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>You are owed</Text>
          <Text style={{ color: '#27ae60', fontWeight: 'bold' }}>₹{totals.youAreOwed.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, { borderTopWidth: 1, borderColor: '#ddd', paddingTop: 8, marginTop: 4 }]}>
          <Text style={{ fontWeight: 'bold' }}>Net balance</Text>
          <Text style={{ color: totals.net >= 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
            {totals.net >= 0 ? '+' : ''}₹{totals.net.toFixed(2)}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>My Groups</Text>
      <FlatList
        data={groups}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.groupRow} onPress={() => navigation.navigate('GroupDetail', { groupId: item.id, name: item.name })}>
            <Text style={{ fontSize: 16 }}>{item.name}</Text>
            <Text style={{ color: item.balance >= 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
              {item.balance === 0
                ? 'settled'
                : item.balance > 0
                ? `You are owed ₹${item.balance.toFixed(2)}`
                : `You owe ₹${Math.abs(item.balance).toFixed(2)}`}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color: '#999' }}>No groups yet — create one to get started</Text>}
      />

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        <Button title="+ Add Expense" onPress={() => navigation.navigate('SelectGroupForExpense')} />
        <Button title="+ Create Group" onPress={() => navigation.navigate('CreateGroup')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryBox: { backgroundColor: '#f7f7f7', borderRadius: 10, padding: 16, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  groupRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
});