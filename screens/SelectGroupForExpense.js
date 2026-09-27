import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { getGroups } from '../db/database';

export default function SelectGroupForExpense({ navigation }) {
  const groups = getGroups();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.title}>Select a group</Text>
      <FlatList
        data={groups}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.replace('AddExpense', { groupId: item.id })}
          >
            <Text style={{ fontSize: 16 }}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color: '#999' }}>Create a group first.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderColor: '#eee' },
});