import { View, Text, ScrollView, Button, Alert, StyleSheet } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getGroupMembers, getGroupSummary, deleteGroup } from '../db/database';
import Screen from '../components/Screen';

export default function GroupDetail({ route, navigation }) {
  const { groupId, name } = route.params;
  const [members, setMembers] = useState([]);
  const [summary, setSummary] = useState({ total: 0, youPaid: 0, yourShare: 0, net: 0 });

  useFocusEffect(useCallback(() => {
    setMembers(getGroupMembers(groupId));
    setSummary(getGroupSummary(groupId));
  }, [groupId]));

  const handleDelete = () => {
    Alert.alert(
      'Delete this group?',
      'This will permanently delete all expenses, members, and settlement history in this group. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteGroup(groupId);
            navigation.navigate('SplitDashboard');
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.summaryBox}>
          <Text style={styles.groupName}>{name}</Text>
          <View style={styles.row}><Text>Total Expenses</Text><Text style={styles.bold}>₹{summary.total.toFixed(2)}</Text></View>
          <View style={styles.row}><Text>You paid</Text><Text style={styles.bold}>₹{summary.youPaid.toFixed(2)}</Text></View>
          <View style={styles.row}><Text>Your share</Text><Text style={styles.bold}>₹{summary.yourShare.toFixed(2)}</Text></View>
          <View style={[styles.row, { borderTopWidth: 1, borderColor: '#ddd', paddingTop: 6, marginTop: 4 }]}>
            <Text style={{ fontWeight: 'bold' }}>{summary.net >= 0 ? 'You should receive' : 'You owe'}</Text>
            <Text style={{ fontWeight: 'bold', color: summary.net >= 0 ? '#27ae60' : '#e74c3c' }}>
              ₹{Math.abs(summary.net).toFixed(2)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Members</Text>
        {members.map(item => (
          <Text key={item.id.toString()} style={styles.memberRow}>
            {item.name}{item.is_me ? ' (You)' : ''}
          </Text>
        ))}

        <View style={{ gap: 10, marginTop: 16 }}>
          <Button title="+ Add Member" onPress={() => navigation.navigate('AddGroupMember', { groupId })} />
          <Button title="+ Add Expense" onPress={() => navigation.navigate('AddExpense', { groupId })} />
          <Button title="View All Expenses" onPress={() => navigation.navigate('ExpenseList', { groupId, name })} />
          <Button title="Settle Up" onPress={() => navigation.navigate('SettlePayment', { groupId })} />
          <Button title="Settlement History" onPress={() => navigation.navigate('SettlementHistory', { groupId })} />
          <Button title="Delete Group" color="#e74c3c" onPress={handleDelete} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryBox: { backgroundColor: '#f7f7f7', borderRadius: 10, padding: 16, marginBottom: 16 },
  groupName: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  bold: { fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  memberRow: { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f0f0f0' },
});