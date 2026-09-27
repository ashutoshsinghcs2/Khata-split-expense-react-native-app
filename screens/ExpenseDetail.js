import { View, Text, FlatList, Button, Alert, StyleSheet } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getExpenseDetail, deleteExpense } from '../db/database';

export default function ExpenseDetail({ route, navigation }) {
  const { expenseId } = route.params;
  const [data, setData] = useState({ expense: null, shares: [] });

  useFocusEffect(useCallback(() => {
    setData(getExpenseDetail(expenseId));
  }, [expenseId]));

  const handleDelete = () => {
    Alert.alert('Delete expense?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteExpense(expenseId); navigation.goBack(); } },
    ]);
  };

  if (!data.expense) return null;
  const { expense, shares } = data;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={styles.title}>{expense.description || 'Expense'}</Text>
      <Text style={styles.amount}>₹{expense.amount}</Text>
      <Text style={{ color: '#777', marginBottom: 16 }}>Paid by {expense.paid_by_name}</Text>

      <Text style={styles.sectionTitle}>Participants</Text>
      <FlatList
        data={shares}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.name}</Text>
            <Text>₹{item.share.toFixed(2)}</Text>
          </View>
        )}
      />

      <Text style={{ color: '#999', marginTop: 16 }}>{expense.date?.slice(0, 10)}</Text>

      <View style={{ marginTop: 24 }}>
        <Button title="Delete Expense" color="#e74c3c" onPress={handleDelete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold' },
  amount: { fontSize: 26, fontWeight: 'bold', marginVertical: 6 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f0f0f0' },
});