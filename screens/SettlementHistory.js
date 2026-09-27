import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getSettlements, getMeMember } from '../db/database';

export default function SettlementHistory({ route }) {
  const { groupId } = route.params;
  const [settlements, setSettlements] = useState([]);
  const [meId, setMeId] = useState(null);

  useFocusEffect(useCallback(() => {
    setSettlements(getSettlements(groupId));
    setMeId(getMeMember(groupId)?.id);
  }, [groupId]));

  return (
    <FlatList
      style={{ padding: 16 }}
      data={settlements}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text>
            {item.from_member === meId ? 'You' : item.from_name} paid {item.to_member === meId ? 'You' : item.to_name}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#777', fontSize: 12 }}>{item.date?.slice(0, 10)} · {item.method}</Text>
            <Text style={{ fontWeight: 'bold' }}>₹{item.amount}</Text>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text style={{ color: '#999' }}>No settlements yet</Text>}
    />
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
});