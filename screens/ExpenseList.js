import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getGroupExpenses, getMeMember } from '../db/database';

export default function ExpenseList({ route, navigation }) {
  const { groupId } = route.params;
  const [expenses, setExpenses] = useState([]);
  const [meId, setMeId] = useState(null);

  useFocusEffect(useCallback(() => {
    setExpenses(getGroupExpenses(groupId));
    const me = getMeMember(groupId);
    setMeId(me?.id);
  }, [groupId]));

  return (
    <FlatList
      style={{ padding: 16 }}
      data={expenses}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ExpenseDetail', { expenseId: item.id })}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '600' }}>{item.description || 'Expense'}</Text>
            <Text style={{ fontWeight: 'bold' }}>₹{item.amount}</Text>
          </View>
          <Text style={{ color: '#777', fontSize: 12 }}>
            Paid by {item.paid_by === meId ? 'You' : item.paid_by_name} · {item.date?.slice(0, 10)}
          </Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={{ color: '#999', padding: 16 }}>No expenses yet</Text>}
    />
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
});